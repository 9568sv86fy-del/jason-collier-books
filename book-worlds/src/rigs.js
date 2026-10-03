// Smooth capsule rigs. Environment stays faceted; people do not.
import * as THREE from "three";
import { damp } from "./util.js";

const mats = new Map();
function M(hex, opts = {}) {
  const key = `${hex}|${opts.side || ""}|${opts.emissive || ""}`;
  if (!opts.unique && mats.has(key)) return mats.get(key);
  const m = new THREE.MeshLambertMaterial({ color: hex, emissive: opts.emissive || 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 0.35, side: opts.side || THREE.FrontSide });
  if (!opts.unique) mats.set(key, m);
  return m;
}

function down(len, radius, mat) {
  const mid = Math.max(0.04, len - radius * 2);
  const g = new THREE.CapsuleGeometry(radius, mid, 5, 16);
  g.translate(0, -len / 2, 0);
  const mesh = new THREE.Mesh(g, mat);
  mesh.castShadow = true;
  return mesh;
}

function sphere(r, mat, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  return mesh;
}

export function createHuman(spec) {
  const root = new THREE.Group();
  const bob = new THREE.Group();
  root.add(bob);
  const body = new THREE.Group();
  bob.add(body);

  const skin = M(spec.skin || 0xd2a07c);
  const cloth = M(spec.cloth);
  const cloth2 = M(spec.cloth2 || spec.cloth);
  const pantsM = M(spec.pants);
  const bootM = M(spec.boots);
  const hatM = M(spec.hat || 0x5a432c);
  const hairM = M(spec.hair || 0x3a2a22);
  const shoulder = spec.shoulder || 0.23;

  const leg = (side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.1, 0.94, 0);
    hip.add(down(0.44, 0.072, pantsM));
    const knee = new THREE.Group();
    knee.position.y = -0.42;
    hip.add(knee);
    knee.add(down(0.4, 0.055, pantsM));
    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.12, 2, 8), bootM);
    foot.rotation.x = Math.PI / 2;
    foot.position.set(0, -0.4, 0.05);
    foot.castShadow = true;
    knee.add(foot);
    body.add(hip);
    return { hip, knee };
  };
  const L = leg(-1);
  const R = leg(1);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.32, 6, 16), cloth);
  torso.position.y = 1.25;
  torso.scale.set(spec.chest || 1.05, 1, 0.82);
  torso.castShadow = true;
  body.add(torso);

  const vest = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.22, 3, 8), cloth2);
  vest.position.set(0, 1.28, 0.06);
  vest.scale.set(1.05, 0.95, 0.7);
  vest.castShadow = true;
  body.add(vest);

  if (spec.coat) {
    const coat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.34, 0.58, 16, 1, true, 0.45, Math.PI * 1.75),
      M(spec.coat, { side: THREE.DoubleSide }),
    );
    coat.position.y = 0.86;
    coat.castShadow = true;
    body.add(coat);
  }

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.045, 10), M(0x2a2118));
  belt.position.y = 1.05;
  belt.scale.set(spec.chest || 1, 1, 0.82);
  body.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), brassMat());
  buckle.position.set(0, 1.05, 0.14 * (spec.chest || 1));
  body.add(buckle);

  if (spec.suspenders) {
    for (const s of [-1, 1]) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.38, 0.02), M(0x6a3a28));
      strap.position.set(s * 0.07, 1.32, 0.1);
      strap.rotation.z = s * -0.08;
      body.add(strap);
    }
  }
  if (spec.neckerchief) {
    const necker = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 6), M(spec.neckerchief));
    necker.position.set(0, 1.5, 0.08);
    necker.rotation.x = Math.PI;
    body.add(necker);
  }

  const arm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * shoulder * (spec.chest || 1), 1.5, 0);
    sh.add(down(0.3, 0.05, spec.sleeves ? M(spec.sleeves) : cloth));
    const el = new THREE.Group();
    el.position.y = -0.28;
    sh.add(el);
    el.add(down(0.26, 0.042, spec.sleeves ? M(spec.sleeves) : cloth));
    const hand = new THREE.Group();
    hand.position.y = -0.26;
    el.add(hand);
    hand.add(sphere(0.046, skin, 0.9, 1, 0.75));
    body.add(sh);
    return { sh, el, hand };
  };
  const LA = arm(-1);
  const RA = arm(1);

  const neck = new THREE.Group();
  neck.position.y = 1.58;
  body.add(neck);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.06, 0.12, 12), skin);
  neckMesh.position.y = 0.02;
  neckMesh.castShadow = true;
  neck.add(neckMesh);
  const head = sphere(0.112, skin, 0.96, 1.06, 1);
  head.position.y = 0.1;
  neck.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.118, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM);
  hair.position.y = 0.15;
  neck.add(hair);
  const eyeW = M(0xf4efe8);
  const eyeD = M(0x1b140f);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), eyeW);
    w.position.set(s * 0.04, 0.12, 0.09);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 5), eyeD);
    p.position.set(s * 0.042, 0.118, 0.105);
    neck.add(w, p);
  }
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.02), hairM);
  brow.position.set(0, 0.15, 0.09);
  if (spec.sharp) brow.scale.y = 1.4;
  neck.add(brow);
  if (spec.mustache) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.016, 0.03), hairM);
    m.position.set(0, 0.06, 0.1);
    neck.add(m);
  }
  if (spec.roundFace) {
    head.scale.set(1.08, 1.02, 1.05);
  }

  let hat = null;
  if (spec.hat !== null) {
    hat = new THREE.Group();
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.018, 16), hatM);
    brim.position.y = 0.2;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12), hatM);
    crown.position.y = 0.26;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.122, 0.122, 0.025, 12), M(spec.hatBand || 0x3a2418));
    band.position.y = 0.21;
    hat.add(brim, crown, band);
    hat.position.y = 0.02;
    hat.rotation.z = spec.hatTilt || 0;
    hat.rotation.x = spec.hatPitch || 0.06;
    neck.add(hat);
  }

  let key = null;
  if (spec.key) {
    key = trailKey();
    key.position.set(0.02, -0.02, 0.04);
    key.rotation.set(-0.5, 0.2, 0.15);
    RA.hand.add(key);
  }
  if (spec.club) {
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.55, 6), M(0x5a4030));
    club.position.set(0, -0.2, 0.02);
    club.rotation.x = 0.4;
    club.castShadow = true;
    RA.hand.add(club);
  }
  if (spec.bills) {
    const stack = handbillMesh();
    stack.scale.setScalar(0.7);
    stack.position.set(0, -0.04, 0.04);
    LA.hand.add(stack);
  }
  if (spec.bandana) {
    const ban = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), M(0x7a2e2a));
    ban.position.set(0, 0.08, 0.09);
    neck.add(ban);
  }
  if (spec.lantern) {
    const lamp = new THREE.Group();
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 8), M(0x3a342c));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc56a }));
    glow.position.y = 0.01;
    lamp.add(cage, glow);
    lamp.position.set(-0.16, 1.08, 0.08);
    body.add(lamp);
    spec._glow = glow;
  }
  if (spec.wisp) {
    const wisp = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 1), new THREE.MeshBasicMaterial({ color: 0xb9a0d0 }));
    wisp.position.set(0.18, 1.55, 0);
    body.add(wisp);
  }

  root.scale.set(spec.bulk || 1, spec.height || 1, spec.bulk || 1);

  const shadow = blobShadow();
  root.add(shadow);

  let phase = Math.random() * 6;
  let swing = 0;
  const tmp = new THREE.Vector3();

  function update(dt, a) {
    const moving = a.speed > 0.25 && !a.air;
    phase += dt * (moving ? Math.max(0.85, Math.min(2.6, a.speed / 0.9)) : 0) * Math.PI * 2;
    swing = damp(swing, moving ? Math.min(1, 0.45 + a.speed / 3) : 0, 8, dt);
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const hip = (0.48 + Math.min(0.22, a.speed * 0.05)) * swing;
    const k = a.action === "attack" || a.action === "dodge" ? 16 : 11;
    let lhx = -s * hip;
    let rhx = s * hip;
    let lkx = Math.max(0, s) * (0.9 + Math.min(0.4, a.speed * 0.08)) * swing;
    let rkx = Math.max(0, -s) * (0.9 + Math.min(0.4, a.speed * 0.08)) * swing;
    if (a.air) {
      lhx = -0.55; rhx = 0.25; lkx = 1.05; rkx = 0.7;
    }
    let lax = s * 0.5 * swing;
    let rax = -s * 0.5 * swing;
    let laz = -0.14;
    let raz = 0.14;
    let lex = -0.28 - swing * 0.15;
    let rex = -0.28 - swing * 0.15;
    let keyX = -0.5;

    if (a.action === "attack") {
      const p = Math.min(1, a.actionT);
      const swg = Math.sin(p * Math.PI);
      const dir = a.combo === 2 ? -1 : 1;
      if (a.combo === 3) {
        rax = -2.35 + swg * 2.5;
        raz = 0.2;
        rex = -0.35 - swg * 0.55;
        keyX = -1.35;
      } else {
        rax = -0.45 - swg * 0.9;
        raz = dir * (0.25 + swg * 1.35);
        rex = -0.45 - swg * 0.65;
        keyX = -0.55 - swg * 0.85;
      }
      lax = -0.9;
      laz = -0.35;
      lex = -0.4;
    } else if (a.action === "flash") {
      const p = Math.sin(Math.min(1, a.actionT) * Math.PI);
      lax = -2.5 * p - 0.2;
      rax = -2.5 * p - 0.2;
      laz = -0.45;
      raz = 0.45;
      keyX = -1.4;
    } else if (a.action === "shove") {
      const p = Math.sin(Math.min(1, a.actionT) * Math.PI);
      lax = -1.2 * p;
      rax = -1.2 * p;
      laz = -0.2;
      raz = 0.2;
      lex = -0.2;
      rex = -0.2;
    } else if (a.action === "throw") {
      const p = Math.min(1, a.actionT);
      lax = -0.4 - Math.sin(p * Math.PI) * 1.7;
      laz = -0.2;
      lex = -0.3;
    }

    if (spec.scratch && a.action === "idle" && a.speed < 0.35) {
      const sc = Math.sin(performance.now() / 1000 * 0.85);
      if (sc > 0.55) {
        lax = -2.15;
        laz = -0.85;
        lex = -1.55;
      }
    }

    const dodge = a.action === "dodge";
    if (dodge) {
      const spins = a.actionT * Math.PI * 2;
      if (Math.abs(a.dodgeSide || 0) > 0.45) {
        bob.rotation.z = -(a.dodgeSide) * spins;
        bob.rotation.x = 0;
      } else {
        bob.rotation.x = spins;
        bob.rotation.z = 0;
      }
      bob.position.y = -Math.sin(Math.min(1, a.actionT) * Math.PI) * 0.42;
      lhx = 0.4; rhx = -0.2; lkx = 1.2; rkx = 1.1;
    } else {
      bob.rotation.x = damp(bob.rotation.x, moving ? 0.08 + a.speed * 0.02 : 0, 10, dt);
      bob.rotation.z = damp(bob.rotation.z, s * 0.05 * swing, 10, dt);
      const breathe = Math.sin(performance.now() / 1000 * 1.7) * 0.012;
      bob.position.y = damp(bob.position.y, Math.abs(Math.sin(phase * 2)) * 0.035 * swing + breathe, 10, dt);
    }

    setRot(L.hip, lhx, 0, 0, k, dt);
    setRot(R.hip, rhx, 0, 0, k, dt);
    setRot(L.knee, lkx, 0, 0, k, dt);
    setRot(R.knee, rkx, 0, 0, k, dt);
    setRot(LA.sh, lax, 0, laz, k, dt);
    setRot(RA.sh, rax, 0, raz, k, dt);
    setRot(LA.el, lex, 0, 0, k, dt);
    setRot(RA.el, rex, 0, 0, k, dt);
    if (key) key.rotation.x = damp(key.rotation.x, keyX, 14, dt);

    const look = a.look || 0;
    neck.rotation.y = damp(neck.rotation.y, look, 8, dt);
    neck.rotation.x = damp(neck.rotation.x, a.air ? -0.2 : moving ? -0.08 : 0, 8, dt);
    body.rotation.y = damp(body.rotation.y, 0, 8, dt);

    if (a.hurt > 0) {
      body.rotation.x = damp(body.rotation.x, -0.25 * a.hurt, 14, dt);
    }

    root.updateMatrixWorld(true);
    neck.getWorldPosition(tmp);
    shadow.position.y = 0.03 - bob.position.y;
    const sp = Math.min(1, a.speed / 4);
    shadow.material.opacity = 0.38 - sp * 0.08;
    return { head: tmp.clone(), step: moving && s * c < 0 && Math.sin(phase - dt * 4) * Math.cos(phase - dt * 4) > 0 };
  }

  return { root, update, hand: RA.hand, glow: spec._glow || null, neck };
}

function setRot(obj, x, y, z, lambda, dt) {
  obj.rotation.x = damp(obj.rotation.x, x, lambda, dt);
  obj.rotation.y = damp(obj.rotation.y, y, lambda, dt);
  obj.rotation.z = damp(obj.rotation.z, z, lambda, dt);
}

let brass = null;
function brassMat() {
  if (!brass) {
    brass = new THREE.MeshStandardMaterial({ color: 0xe0bf78, metalness: 0.72, roughness: 0.32 });
  }
  return brass;
}

export function trailKey() {
  const g = new THREE.Group();
  const metal = brassMat();
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 14), metal);
  bow.position.y = 0.06;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.16, 8), metal);
  shaft.position.y = -0.05;
  const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.018, 0.02), metal);
  tooth.position.set(0.028, -0.1, 0);
  const tooth2 = tooth.clone();
  tooth2.position.y = -0.13;
  tooth2.scale.x = 0.7;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.78, 0.055), metal);
  blade.position.y = -0.52;
  blade.scale.z = 1;
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.7, 0.012), new THREE.MeshStandardMaterial({ color: 0xfff1c4, metalness: 0.4, roughness: 0.2, emissive: 0x6a4a20, emissiveIntensity: 0.4 }));
  edge.position.set(0, -0.5, 0.03);
  g.add(bow, shaft, tooth, tooth2, blade, edge);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

let billTex = null;
function billTexture() {
  if (billTex) return billTex;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 80;
  const g = c.getContext("2d");
  g.fillStyle = "#f3e6c4";
  g.fillRect(0, 0, 128, 80);
  g.strokeStyle = "#6a4320";
  g.strokeRect(3, 3, 122, 74);
  g.fillStyle = "#3a2414";
  g.font = "700 11px Georgia";
  g.textAlign = "center";
  g.fillText("SAFE PASSAGE", 64, 28);
  g.font = "10px Georgia";
  g.fillText("Reasonable rates", 64, 46);
  g.fillText("— J & T —", 64, 62);
  billTex = new THREE.CanvasTexture(c);
  billTex.colorSpace = THREE.SRGBColorSpace;
  return billTex;
}

export function handbillMesh() {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.22),
    new THREE.MeshLambertMaterial({ map: billTexture(), side: THREE.DoubleSide }),
  );
  m.castShadow = true;
  return m;
}

export function createShade() {
  const root = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0x1a1022, emissive: 0x7a5aaa, emissiveIntensity: 0.6 });
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), mat);
  body.scale.set(0.72, 1.25, 0.72);
  body.position.y = 0.95;
  body.castShadow = true;
  root.add(body);
  const wisps = [];
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.28, 2, 6), mat);
    w.position.y = 0.7;
    root.add(w);
    wisps.push(w);
  }
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf4efe6 });
  const eyes = new THREE.Group();
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeMat);
    e.position.set(s * 0.1, 1.15, 0.22);
    eyes.add(e);
  }
  root.add(eyes);
  const dust = makeDust(28, 0xc8b8e0, 0.9);
  dust.position.y = 0.9;
  root.add(dust);
  root.add(blobShadow());
  let phase = Math.random() * 5;
  return {
    root,
    mat,
    update(dt, a) {
      phase += dt * (a.speed > 0.2 ? 6 : 2.2);
      const bob = Math.sin(phase) * 0.06;
      body.position.y = 0.95 + bob + (a.tele ? 0.12 : 0);
      body.rotation.y += dt * 0.8;
      const lean = a.tele ? -0.45 : a.strike ? 0.55 : 0;
      body.rotation.x = damp(body.rotation.x, lean, 10, dt);
      const pulse = 0.45 + Math.sin(phase * 3) * 0.25 + (a.tele ? 0.7 : 0) + (a.hit || 0);
      mat.emissiveIntensity = pulse;
      wisps.forEach((w, i) => {
        const ang = phase * 1.4 + i * 1.6;
        w.position.x = Math.cos(ang) * 0.28;
        w.position.z = Math.sin(ang) * 0.28;
        w.position.y = 0.55 + Math.sin(ang * 1.3) * 0.1;
        w.rotation.z = Math.sin(ang) * 0.6;
      });
      eyes.position.y = bob;
      spinDust(dust, phase);
      const s = Math.sin(phase);
      return { step: a.speed > 0.4 && s < 0 && Math.sin(phase - dt * 6) > 0 };
    },
  };
}

export function createCoach() {
  const root = new THREE.Group();
  const wood = M(0x6a4630);
  const dark = M(0x2a1c16);
  const cloth = M(0xcbb892, { side: THREE.DoubleSide });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 3.4), wood);
  chassis.position.y = 0.95;
  chassis.castShadow = true;
  const cabinMat = new THREE.MeshLambertMaterial({ color: 0x2a1c16, emissive: 0x000000, emissiveIntensity: 0 });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.15, 1.7), cabinMat);
  cabin.position.set(0, 1.7, -0.15);
  cabin.castShadow = true;
  const bonnet = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.9, 12, 1, true, 0, Math.PI), cloth);
  bonnet.rotation.z = Math.PI / 2;
  bonnet.rotation.y = Math.PI / 2;
  bonnet.position.set(0, 2.15, -0.15);
  bonnet.castShadow = true;
  root.add(chassis, cabin, bonnet);
  const wheels = [];
  for (const [x, z] of [[-0.95, -1.15], [0.95, -1.15], [-0.95, 1.15], [0.95, 1.15]]) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.08, 6, 12), M(0x241810));
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8), brassMat());
    hub.rotation.z = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), M(0x8a7048));
      spoke.rotation.z = (i / 6) * Math.PI;
      w.add(spoke);
    }
    w.add(tire, hub);
    w.position.set(x, 0.5, z);
    w.rotation.y = Math.PI / 2;
    root.add(w);
    wheels.push(w);
  }
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), wood);
  tongue.position.set(0, 0.85, 2.15);
  root.add(tongue);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf2efe6 });
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.05), eyeMat);
    e.position.set(s * 0.32, 1.75, 0.72);
    root.add(e);
    eyes.push(e);
  }
  const dust = makeDust(70, 0xd8c4a0, 2.2);
  dust.position.y = 1.2;
  root.add(dust);
  const staticP = makeDust(24, 0xd2c6ee, 1.6);
  staticP.position.y = 1.5;
  root.add(staticP);
  let spin = 0;
  let phase = 0;
  return {
    root,
    update(dt, a) {
      phase += dt * (a.moving ? 9 : 2);
      spin += dt * (a.moving ? 10 : 0.4);
      wheels.forEach((w) => { w.rotation.x = spin; });
      const rear = a.state === "chargeWind" ? -0.14 : a.state === "slam" ? 0.08 : 0;
      root.rotation.x = damp(root.rotation.x, rear, 8, dt);
      root.position.y = Math.abs(Math.sin(phase)) * (a.moving ? 0.06 : 0.02);
      const flicker = 0.65 + Math.sin(phase * 8) * 0.35;
      eyes.forEach((e) => { e.scale.y = flicker; });
      spinDust(dust, phase);
      spinDust(staticP, phase * 1.7);
      cabinMat.emissive.setHex(a.hit > 0 ? 0xffe2b0 : 0x000000);
      cabinMat.emissiveIntensity = a.hit > 0 ? a.hit : 0;
    },
  };
}

function makeDust(n, color, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: 0.08, map: softDot(), transparent: true, depthWrite: false, opacity: 0.7, sizeAttenuation: true,
  }));
  pts.userData.base = pos.slice(0);
  pts.frustumCulled = false;
  return pts;
}

function spinDust(pts, phase) {
  const base = pts.userData.base;
  const arr = pts.geometry.attributes.position.array;
  for (let i = 0; i < base.length; i += 3) {
    const a = phase * 0.6 + i;
    arr[i] = base[i] * Math.cos(a) - base[i + 2] * Math.sin(a * 0.3);
    arr[i + 1] = base[i + 1] + Math.sin(phase + i) * 0.05;
    arr[i + 2] = base[i + 2] * Math.cos(a * 0.3) + base[i] * Math.sin(a);
  }
  pts.geometry.attributes.position.needsUpdate = true;
}

let dotTex = null;
export function softDot() {
  if (dotTex) return dotTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,0.95)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  dotTex = new THREE.CanvasTexture(c);
  return dotTex;
}

function blobShadow() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({ map: softDot(), transparent: true, depthWrite: false, opacity: 0.35, color: 0x000000 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  mesh.renderOrder = 1;
  return mesh;
}

export function createCritter(kind) {
  const root = new THREE.Group();
  const hide = M(kind === "ox" ? 0x8a623c : 0xd8d0c2);
  const dark = M(kind === "ox" ? 0x4a3024 : 0x6a5a48);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(kind === "ox" ? 0.38 : 0.16, kind === "ox" ? 0.9 : 0.34, 3, 8), hide);
  body.rotation.z = Math.PI / 2;
  body.position.y = kind === "ox" ? 0.85 : 0.42;
  body.castShadow = true;
  root.add(body);
  const head = new THREE.Group();
  const skull = sphere(kind === "ox" ? 0.22 : 0.1, hide);
  head.add(skull);
  if (kind === "ox") {
    for (const s of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.28, 5), M(0xe6dcc8));
      horn.position.set(s * 0.12, 0.16, 0);
      horn.rotation.z = s * -0.8;
      head.add(horn);
    }
  } else {
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), dark);
      ear.position.set(s * 0.06, 0.08, 0);
      head.add(ear);
    }
  }
  head.position.set(kind === "ox" ? 0.7 : 0.28, kind === "ox" ? 0.95 : 0.48, 0);
  root.add(head);
  const legs = [];
  const offs = kind === "ox" ? [[-0.35, -0.18], [-0.35, 0.18], [0.35, -0.18], [0.35, 0.18]] : [[-0.12, -0.07], [-0.12, 0.07], [0.12, -0.07], [0.12, 0.07]];
  for (const [x, z] of offs) {
    const hip = new THREE.Group();
    hip.position.set(x, kind === "ox" ? 0.7 : 0.36, z);
    hip.add(down(kind === "ox" ? 0.48 : 0.22, kind === "ox" ? 0.06 : 0.03, dark));
    root.add(hip);
    legs.push(hip);
  }
  root.add(blobShadow());
  let phase = Math.random() * 4;
  return {
    root,
    update(dt, speed) {
      phase += dt * (speed > 0.1 ? speed * 7 : 1.4);
      const s = Math.sin(phase);
      legs.forEach((hip, i) => { hip.rotation.x = Math.sin(phase + (i % 2) * Math.PI) * (speed > 0.1 ? 0.4 : 0.05); });
      head.rotation.x = Math.sin(phase * 0.5) * 0.08;
      head.position.y = (kind === "ox" ? 0.95 : 0.48) + Math.abs(s) * 0.01;
      body.position.y = (kind === "ox" ? 0.85 : 0.42) + Math.abs(s) * 0.015 * (speed > 0.1 ? 1 : 0.3);
    },
  };
}
