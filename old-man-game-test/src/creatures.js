// The bull, the cows, and the thing that paces you. Procedural low-poly, animated by hand.
import * as THREE from "three";

const M = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...o });
function seg(len, r0, r1, mat, sides = 6) {
  const g = new THREE.CylinderGeometry(r1, r0, len, sides);
  g.translate(0, -len / 2, 0);
  return new THREE.Mesh(g, mat);
}

/* ---------------- elk ---------------- */
export function buildElk({ bull = true } = {}) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const hide = M(bull ? 0x9a7a52 : 0xa48660), mane = M(0x4a3524), rump = M(0xd9c7a2), leg = M(0x3a2a1e), antler = M(0xd8cdb6), nose = M(0x221a14);
  // barrel
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 8), hide);
  torso.rotation.z = Math.PI / 2;
  torso.rotation.y = Math.PI / 2;
  torso.position.set(0, 1.45, 0);
  body.add(torso);
  const r = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), rump);
  r.position.set(0, 1.5, 0.72);
  r.scale.set(0.95, 0.95, 0.6);
  body.add(r);
  // neck + head
  const neck = new THREE.Group();
  neck.position.set(0, 1.62, -0.7);
  body.add(neck);
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(bull ? 0.26 : 0.18, bull ? 0.36 : 0.26, 0.85, 7), mane);
  nk.rotation.x = -0.75;
  nk.position.set(0, 0.28, -0.25);
  neck.add(nk);
  const head = new THREE.Group();
  head.position.set(0, 0.62, -0.55);
  neck.add(head);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.42), hide);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.3), hide);
  snout.position.set(0, -0.07, -0.3);
  head.add(snout);
  const ns = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.06), nose);
  ns.position.set(0, -0.08, -0.46);
  head.add(ns);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), hide);
    ear.position.set(s * 0.15, 0.14, 0.1);
    ear.rotation.z = -s * 0.9;
    head.add(ear);
  }
  if (bull) {
    // six-point rack
    for (const s of [-1, 1]) {
      const beam = new THREE.Group();
      beam.position.set(s * 0.1, 0.14, 0.05);
      head.add(beam);
      let px = 0, py = 0, pz = 0;
      const pts = [[0.18, 0.28, 0.12], [0.1, 0.3, 0.2], [0.06, 0.3, 0.15], [0.02, 0.26, 0.1], [-0.02, 0.2, 0.06]];
      pts.forEach(([dx, dy, dz], k) => {
        const a = new THREE.Vector3(px, py, pz);
        const b = new THREE.Vector3(px + s * dx, py + dy, pz + dz);
        const len = a.distanceTo(b);
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03 - k * 0.003, len, 5), antler);
        m.position.copy(a).add(b).multiplyScalar(0.5);
        m.lookAt(b);
        m.rotateX(Math.PI / 2);
        beam.add(m);
        // tine forward
        if (k < 4) {
          const tl = 0.22 - k * 0.03;
          const t = new THREE.Mesh(new THREE.ConeGeometry(0.018, tl, 4), antler);
          t.position.set(b.x, b.y + 0.02, b.z - tl * 0.45);
          t.rotation.x = -1.1;
          beam.add(t);
        }
        px = b.x; py = b.y; pz = b.z;
      });
    }
  }
  // legs
  const legs = [];
  for (const [x, z] of [[-0.24, -0.55], [0.24, -0.55], [-0.24, 0.62], [0.24, 0.62]]) {
    const hip = new THREE.Group();
    hip.position.set(x, 1.3, z);
    const up = seg(0.6, 0.11, 0.08, hide);
    hip.add(up);
    const kn = new THREE.Group();
    kn.position.y = -0.6;
    hip.add(kn);
    const lo = seg(0.62, 0.06, 0.05, leg);
    kn.add(lo);
    body.add(hip);
    legs.push({ hip, kn, front: z < 0 });
  }
  // vitals marker for hit testing (invisible)
  const vitals = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  vitals.position.set(0, 1.4, -0.45);
  vitals.userData.part = "vitals";
  body.add(vitals);
  const bodyHit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 2.1), new THREE.MeshBasicMaterial({ visible: false }));
  bodyHit.position.set(0, 1.45, 0.05);
  bodyHit.userData.part = "body";
  body.add(bodyHit);
  root.userData.hit = [vitals, bodyHit];
  let phase = Math.random() * 10;
  const api = {
    root, hitMeshes: [vitals, bodyHit],
    /** mode: stand | graze | walk | run | bed | down | alert */
    animate(mode, dt, t) {
      const run = mode === "run", walk = mode === "walk";
      phase += dt * (run ? 9 : walk ? 4 : 0);
      body.rotation.set(0, 0, 0);
      body.position.y = 0;
      if (mode === "down") {
        body.rotation.z = Math.PI / 2 * 0.92;
        body.position.set(0.9, -0.35, 0);
        legs.forEach((l, i) => { l.hip.rotation.x = 0.4 * (i % 2 ? 1 : -1); l.kn.rotation.x = 0.3; });
        neck.rotation.x = 0.6;
        return;
      }
      body.position.x = 0;
      if (mode === "bed") {
        body.position.y = -0.95;
        legs.forEach((l) => { l.hip.rotation.x = l.front ? -1.4 : 1.4; l.kn.rotation.x = l.front ? 2.6 : -2.6; });
        neck.rotation.x = -0.1 + Math.sin(t * 0.4) * 0.05;
        head.rotation.y = Math.sin(t * 0.3) * 0.5;
        return;
      }
      legs.forEach((l, i) => {
        const off = i === 0 || i === 3 ? 0 : Math.PI;
        const a = Math.sin(phase + off) * (run ? 0.75 : walk ? 0.4 : 0);
        l.hip.rotation.x = a;
        l.kn.rotation.x = Math.max(0, -Math.cos(phase + off)) * (run ? 1.1 : walk ? 0.5 : 0) * (l.front ? -1 : 1);
      });
      if (run) body.position.y = Math.abs(Math.sin(phase)) * 0.18;
      if (mode === "graze") {
        neck.rotation.x = 1.15 + Math.sin(t * 1.3) * 0.06;
        head.rotation.y = 0;
      } else if (mode === "alert") {
        neck.rotation.x = -0.35;
        head.rotation.y = Math.sin(t * 0.7) * 0.15;
      } else {
        neck.rotation.x = run ? 0.1 : -0.1 + Math.sin(t * 0.5) * 0.05;
        head.rotation.y = walk ? 0 : Math.sin(t * 0.35) * 0.4;
      }
    },
  };
  return api;
}

/* ---------------- the shadow walker ---------------- */
// Tall, taller than a man. Matted hair like hanging moss or shredded bark. Skin rough as
// old cedar. Long arms ending in branch-like hands. Eyes that catch the light, greenish.
export function buildWalker() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const bark = M(0x1d1a16, { emissive: 0x0a0d0a }), moss = M(0x2a2e1e, { emissive: 0x0a0d09 }), dark = M(0x0f0e0c, { emissive: 0x060706 });
  const H = 2.9;
  // legs: long, thin, knees slightly back
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(s * 0.2, 1.35, 0);
    hip.add(seg(0.72, 0.13, 0.1, bark));
    const kn = new THREE.Group();
    kn.position.y = -0.72;
    hip.add(kn);
    kn.add(seg(0.66, 0.09, 0.07, bark));
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.42), dark);
    foot.position.set(0, -0.66, -0.08);
    kn.add(foot);
    body.add(hip);
    legs.push({ hip, kn });
  }
  // torso: narrow hips, wide stooped shoulders, shaggy
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.24, 1.15, 7), bark);
  torso.position.y = 1.92;
  torso.scale.z = 0.62;
  body.add(torso);
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.4, 7, 5), moss);
  hump.position.set(0, 2.42, 0.12);
  hump.scale.set(1.15, 0.7, 0.8);
  body.add(hump);
  // hanging moss strands
  const strandGeo = new THREE.PlaneGeometry(0.07, 0.55);
  strandGeo.translate(0, -0.27, 0);
  const strandMat = new THREE.MeshLambertMaterial({ color: 0x272b1c, side: THREE.DoubleSide });
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2;
    const s = new THREE.Mesh(strandGeo, strandMat);
    const y = 1.5 + (i % 5) * 0.22;
    s.position.set(Math.cos(a) * 0.36, y + 0.3, Math.sin(a) * 0.24);
    s.rotation.y = -a;
    s.rotation.x = 0.15;
    s.scale.y = 0.7 + ((i * 37) % 10) / 12;
    body.add(s);
  }
  // head: broad, flat, low on the shoulders
  const neck = new THREE.Group();
  neck.position.set(0, 2.55, -0.12);
  body.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.32), bark);
  head.position.y = 0.12;
  neck.add(head);
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.1), dark);
  brow.position.set(0, 0.2, -0.16);
  neck.add(brow);
  // eyes: unlit, unfogged, additive glow so they read through the dark
  const eyeTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(230,255,210,1)");
    gr.addColorStop(0.15, "rgba(150,240,110,0.9)");
    gr.addColorStop(0.45, "rgba(60,160,40,0.25)");
    gr.addColorStop(1, "rgba(20,80,10,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const eyeMat = new THREE.SpriteMaterial({ map: eyeTex, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Sprite(eyeMat);
    e.position.set(s * 0.11, 0.13, -0.18);
    e.scale.set(0.42, 0.42, 1);
    neck.add(e);
    eyes.push(e);
  }
  // arms: very long, to the knees, ending in branch fingers
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(s * 0.46, 2.36, 0);
    sh.add(seg(0.85, 0.1, 0.08, bark));
    const el = new THREE.Group();
    el.position.y = -0.85;
    sh.add(el);
    el.add(seg(0.8, 0.08, 0.05, bark));
    const hand = new THREE.Group();
    hand.position.y = -0.8;
    el.add(hand);
    for (let f = 0; f < 4; f++) {
      const fg = seg(0.36 + f * 0.04, 0.025, 0.008, dark, 4);
      fg.rotation.z = (f - 1.5) * 0.22 * s;
      fg.rotation.x = 0.2;
      hand.add(fg);
      const twig = seg(0.14, 0.012, 0.004, dark, 3);
      twig.position.y = -0.2;
      twig.rotation.z = 0.7 * s;
      fg.add(twig);
    }
    body.add(sh);
    arms.push({ sh, el });
  }
  root.scale.setScalar(1);
  let phase = 0;
  return {
    root, eyes, eyeMat, height: H,
    /** mode: stand | walk | run | crouch | reach ; eyesOn 0..1 */
    animate(mode, dt, t, eyesOn = 1) {
      const run = mode === "run", walk = mode === "walk";
      phase += dt * (run ? 7 : walk ? 2.6 : 0);
      legs.forEach((l, i) => {
        const o = i ? Math.PI : 0;
        l.hip.rotation.x = Math.sin(phase + o) * (run ? 0.8 : walk ? 0.45 : 0);
        l.kn.rotation.x = Math.max(0, Math.cos(phase + o)) * (run ? 1.0 : walk ? 0.6 : 0.05) + 0.05;
      });
      arms.forEach((a, i) => {
        const o = i ? Math.PI : 0;
        a.sh.rotation.x = (walk || run ? -Math.sin(phase + o) * 0.35 : Math.sin(t * 0.6 + i) * 0.04) + (mode === "reach" ? -1.2 : 0);
        a.sh.rotation.z = (i ? -1 : 1) * 0.08;
        a.el.rotation.x = mode === "reach" ? -0.4 : -0.15;
      });
      body.rotation.x = mode === "crouch" ? 0.45 : run ? 0.3 : 0.12;
      body.position.y = mode === "crouch" ? -0.5 : 0;
      neck.rotation.y = mode === "stand" ? Math.sin(t * 0.21) * 0.25 : 0;
      neck.rotation.z = mode === "stand" ? Math.sin(t * 0.13) * 0.12 : 0; // the head tilt
      eyeMat.opacity = eyesOn;
    },
  };
}
