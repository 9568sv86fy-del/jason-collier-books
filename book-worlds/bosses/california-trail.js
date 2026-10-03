// World I signature boss. A Nonimaginaire fused with this book's threat:
// the bear from the hunt that turned on the hunters, waiting at the ford.
import * as THREE from "three";
import { damp } from "../src/util.js";
import { makeDust, spinDust } from "../src/rigs.js";

export const boss = {
  id: "blank-bear",
  world: "california-trail",
  name: "The Blank Bear",
  hp: 280,
  radius: 2.05,
  home: { x: 0, z: 114, yaw: Math.PI },
  drain: { inner: 12, outer: 22 },
  lines: {
    jang: "That bear has no face and too many opinions.",
    tom: "I don't like a bear that eats the pages, Jang.",
    lasso: "Lasso the neck. It is not a horse, but it can be convinced.",
    win: "The hunt is over. I will not be putting that on a handbill.",
  },
  objective: {
    waiting: "The wagons are afloat. The Blank Bear is waiting in the ford.",
    fighting: "The Blank Bear is erasing the pages. Break it.",
    thinning(left) {
      return `The bear is fog again. The book still wants ${left} page${left === 1 ? "" : "s"}.`;
    },
  },
  create,
};

function create() {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  rig.scale.setScalar(1.42);
  root.add(rig);

  const hide = new THREE.MeshLambertMaterial({ color: 0x6e6e6a, emissive: 0x3a3a38, emissiveIntensity: 0.18 });
  const fogMat = new THREE.MeshLambertMaterial({ color: 0xb4b4b4, emissive: 0x6e6e6e, emissiveIntensity: 0.26 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x3a3a38, emissive: 0x1c1c1c, emissiveIntensity: 0.12 });
  const faceMat = new THREE.MeshLambertMaterial({ color: 0xd4d4d4, emissive: 0x9a9a9a, emissiveIntensity: 0.1 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.2, 4, 8), hide);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 1.22, 0);
  torso.castShadow = true;
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.52, 10, 8), hide);
  hump.scale.set(1.15, 0.72, 1.35);
  hump.position.set(0, 1.82, -0.12);
  hump.castShadow = true;
  rig.add(torso, hump);

  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), hide);
  skull.scale.set(1.05, 0.92, 1.2);
  skull.castShadow = true;
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), dark);
  muzzle.scale.set(1.05, 0.7, 1.35);
  muzzle.position.set(0, -0.08, 0.36);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), faceMat);
  face.scale.set(1.2, 1.28, 0.42);
  face.position.set(0, 0.06, 0.26);
  head.add(skull, muzzle, face);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), dark);
    ear.scale.set(0.65, 1.15, 0.4);
    ear.position.set(s * 0.26, 0.3, -0.04);
    head.add(ear);
  }
  head.position.set(0, 1.5, 1.12);
  rig.add(head);

  const legs = [];
  const fronts = [];
  for (const [x, z, front] of [[-0.42, 0.52, true], [0.42, 0.52, true], [-0.46, -0.68, false], [0.46, -0.68, false]]) {
    const hip = new THREE.Group();
    hip.position.set(x, 1.12, z);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(front ? 0.15 : 0.18, 0.52, 3, 6), hide);
    leg.position.y = -0.4;
    leg.castShadow = true;
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.32), dark);
    paw.position.set(0, -0.74, 0.08);
    hip.add(leg, paw);
    rig.add(hip);
    legs.push(hip);
    if (front) fronts.push(hip);
  }

  const smearSpecs = [
    { p: [0, 2.02, -0.15], s: [1.45, 0.32, 0.95] },
    { p: [0.58, 1.48, 0.15], s: [0.55, 0.72, 1.05] },
    { p: [-0.52, 1.32, -0.28], s: [0.48, 0.58, 0.9] },
    { p: [0.05, 1.78, 0.78], s: [0.85, 0.26, 0.48] },
  ];
  const smears = smearSpecs.map((spec) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), fogMat);
    mesh.scale.set(spec.s[0], spec.s[1], spec.s[2]);
    mesh.position.set(spec.p[0], spec.p[1], spec.p[2]);
    rig.add(mesh);
    return { mesh, spec };
  });

  const dust = makeDust(72, 0xe6e6e6, 1.7);
  dust.position.set(0, 1.45, 0.1);
  rig.add(dust);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  root.add(shadow);

  let phase = 0;
  return {
    root,
    update(dt, a) {
      phase += dt * (a.moving ? 6.5 : 1.5);
      rig.position.y = a.state === "dead" ? 0 : Math.abs(Math.sin(phase)) * (a.moving ? 0.05 : 0.02);
      legs.forEach((hip, i) => {
        const walk = a.moving ? Math.sin(phase + (i % 2) * Math.PI) * 0.55 : Math.sin(phase * 0.35 + i) * 0.04;
        hip.rotation.x = walk;
      });
      if (a.state === "slam") fronts.forEach((hip) => { hip.rotation.x = 1.15; });
      const nod = a.state === "chargeWind" ? -0.42
        : a.state === "charge" ? 0.28
          : a.state === "slam" ? 0.65
            : a.state === "roar" || a.state === "roarWind" ? -0.5
              : 0.05;
      head.rotation.x = damp(head.rotation.x, nod, 8, dt);
      smears.forEach(({ mesh, spec }, i) => {
        mesh.position.y = spec.p[1] + Math.sin(phase * 1.15 + i) * 0.05;
        mesh.rotation.z = Math.sin(phase * 0.8 + i) * 0.22;
      });
      fogMat.emissiveIntensity = 0.22 + (a.hit || 0) * 0.85 + (a.state === "roar" ? 0.3 : 0);
      hide.emissive.setHex((a.hit || 0) > 0.2 ? 0xd8d8d8 : 0x3a3a38);
      faceMat.emissiveIntensity = 0.08 + (a.hit || 0) * 0.6;
      spinDust(dust, phase);
      rig.rotation.x = damp(rig.rotation.x, a.state === "charge" ? 0.1 : 0, 6, dt);
    },
  };
}
