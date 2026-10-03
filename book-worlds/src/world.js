import * as THREE from "three";
import { clamp, hash, lerp } from "./util.js";
import { createCritter, softDot } from "./rigs.js";

export function heightAt(x, z) {
  let h = Math.sin(x * 0.13) * 0.1 + Math.cos(z * 0.08) * 0.07 + Math.sin((x + z) * 0.05) * 0.05;
  const path = Math.exp(-(x * x) / 14);
  h *= 1 - path * 0.7;
  const river = Math.exp(-((z - 115) * (z - 115)) / 22);
  h -= river * 0.38;
  return h;
}

export function halfWidth(z) {
  if (z < 20) return 18;
  if (z < 28) return lerp(18, 7.15, (z - 20) / 8);
  if (z < 96) return 7.15;
  if (z < 104) return lerp(7.15, 15.2, (z - 96) / 8);
  return 15.2;
}

export function buildWorld(scene, low) {
  const obstacles = [];
  const block = (x, z, r) => obstacles.push({ x, z, r });

  scene.fog = new THREE.Fog(0xe7b184, low ? 28 : 40, low ? 120 : 165);
  scene.background = new THREE.Color(0xe7b184);

  const hemi = new THREE.HemisphereLight(0xffd0b0, 0x7a5040, 1.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb56e, 2.55);
  sun.position.set(-18, 22, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(low ? 512 : 1024, low ? 512 : 1024);
  sun.shadow.camera.near = 4;
  sun.shadow.camera.far = 70;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -16;
  sun.shadow.camera.right = sun.shadow.camera.top = 16;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xffe0c0, 0.35);
  fill.position.set(10, 8, 16);
  scene.add(fill);

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(280, 28, 18),
    new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, depthWrite: false, fog: false }),
  );
  scene.add(sky);

  const ground = buildGround();
  ground.receiveShadow = true;
  scene.add(ground);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 14),
    new THREE.MeshLambertMaterial({ color: 0x8e7048, transparent: true, opacity: 0.72 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, heightAt(0, 115) + 0.22, 115);
  scene.add(water);

  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const wood = mat(0x6b4a32);
  const canvas = mat(0xd9c7a2);
  const dark = mat(0x3a2a22);

  const addWagon = (x, z, rot, tilt = 0) => {
    const w = wagon(wood, canvas, dark);
    w.position.set(x, heightAt(x, z), z);
    w.rotation.y = rot;
    w.rotation.z = tilt;
    scene.add(w);
    block(x, z, 1.9);
    return w;
  };
  addWagon(-6.2, 1.4, 0.5);
  addWagon(6.4, -1.2, -0.7);
  addWagon(2.4, 46, 0.4, 0.35);

  const fire = campfire();
  fire.position.set(0.4, heightAt(0.4, 2.4), 2.4);
  scene.add(fire);
  block(0.4, 2.4, 0.7);

  const chests = [];
  chests.push(placeChest(scene, 4.2, 3.6, wood, dark));
  chests.push(placeChest(scene, -2.2, 61, wood, dark));
  chests.forEach((c) => block(c.x, c.z, 0.55));

  sign(scene, -3.4, 6.2, "CALIFORNIA TRAIL", "Experienced navigators");
  sign(scene, 0.2, 26, "RIVER FORD", "Mind the hum");

  scatterRocks(scene, low);
  scatterYucca(scene, low);
  mesas(scene);

  const ox = createCritter("ox");
  ox.root.position.set(-8.2, heightAt(-8.2, -1), -1);
  ox.root.rotation.y = 0.8;
  scene.add(ox.root);
  block(-8.2, -1, 1.1);
  const goat = createCritter("goat");
  goat.root.position.set(2.8, heightAt(2.8, -2.4), -2.4);
  scene.add(goat.root);

  const pages = buildPages(scene);
  const floats = buildFloats(scene, wood, canvas, dark);
  const rope = buildRope(scene, wood);
  block(-3.3, rope.z0, 0.5);
  block(3.3, rope.z0, 0.5);

  const gate = buildGate();
  gate.root.position.set(0, heightAt(0, 126), 126);
  scene.add(gate.root);

  const ship = airship();
  ship.position.set(1.5, 16, 142);
  scene.add(ship);

  const dust = ambientDust(low ? 80 : 160);
  scene.add(dust);

  const barrels = new THREE.Group();
  for (const [x, z] of [[-2.2, -1.4], [-2.6, -0.6], [5.2, 3.4]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.55, 8), wood);
    b.position.set(x, heightAt(x, z) + 0.28, z);
    b.castShadow = true;
    barrels.add(b);
    block(x, z, 0.4);
  }
  scene.add(barrels);

  let goatPhase = 0;
  return {
    obstacles,
    chests,
    pages,
    floats,
    rope,
    gate,
    fire,
    sun,
    water,
    update(dt, t, focus) {
      sun.position.set(focus.x - 16, 24, focus.z - 10);
      sun.target.position.set(focus.x, 0, focus.z);
      sun.target.updateMatrixWorld();
      const fl = fire.userData;
      const flick = 0.85 + Math.sin(t * 11) * 0.12 + Math.sin(t * 23) * 0.06;
      fl.light.intensity = 7 * flick;
      fl.outer.scale.y = 0.9 + Math.sin(t * 9) * 0.15;
      fl.inner.scale.y = 1 + Math.sin(t * 13) * 0.2;
      fl.outer.rotation.y = t * 1.4;
      goatPhase += dt;
      const gx = 2.8 + Math.sin(goatPhase * 0.35) * 1.4;
      const gz = -2.4 + Math.cos(goatPhase * 0.28) * 1.1;
      goat.root.position.set(gx, heightAt(gx, gz), gz);
      goat.root.rotation.y = Math.atan2(Math.cos(goatPhase * 0.35) * 0.35, -Math.sin(goatPhase * 0.28) * 0.28);
      goat.update(dt, 0.6);
      ox.update(dt, 0);
      driftDust(dust, t);
      ship.position.y = 16 + Math.sin(t * 0.6) * 0.35;
      ship.rotation.z = Math.sin(t * 0.4) * 0.03;
      water.position.y = heightAt(0, 115) + 0.2 + Math.sin(t * 1.4) * 0.02;
      if (gate.open) {
        gate.glow.material.opacity = 0.35 + Math.sin(t * 3) * 0.15;
      }
      posePages(pages, t);
      poseRope(rope, t);
      for (const w of floats) {
        if (!w.floated) continue;
        w.mesh.position.y = heightAt(w.x, w.z) + 0.22 + Math.sin(t * 1.6 + w.x) * 0.06;
        w.mesh.rotation.z = Math.sin(t * 1.3 + w.z) * 0.04;
      }
    },
    resolve(x, z, radius, extra) {
      let px = x;
      let pz = clamp(z, -10, 129.2);
      for (let n = 0; n < 2; n++) {
        const half = halfWidth(pz) - radius;
        px = clamp(px, -half, half);
        const all = extra ? obstacles.concat(extra) : obstacles;
        for (const o of all) {
          let dx = px - o.x;
          let dz = pz - o.z;
          const d = Math.hypot(dx, dz);
          const min = radius + o.r;
          if (d < min) {
            if (d < 1e-4) { px += min; continue; }
            const push = (min - d) / d;
            px += dx * push;
            pz += dz * push;
          }
        }
      }
      return { x: px, z: pz };
    },
  };
}

function buildGround() {
  const geo = new THREE.PlaneGeometry(54, 158, 50, 110);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const dirt = new THREE.Color("#b57a45");
  const path = new THREE.Color("#e0c08a");
  const rock = new THREE.Color("#8d5b3c");
  const wet = new THREE.Color("#7d6244");
  const camp = new THREE.Color("#c48a52");
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const lz = pos.getZ(i);
    const z = lz + 60;
    pos.setZ(i, z);
    pos.setY(i, heightAt(x, z));
    const pathK = Math.exp(-(x * x) / 16);
    const riverK = Math.exp(-((z - 115) * (z - 115)) / 28);
    const campK = Math.exp(-(x * x + (z - 1) * (z - 1)) / 220);
    const canyonK = z > 24 && z < 98 ? 0.35 : 0;
    tmp.copy(dirt).lerp(path, pathK * 0.75).lerp(camp, campK * 0.4).lerp(rock, canyonK * (1 - pathK)).lerp(wet, riverK);
    const n = hash(i + Math.floor(x * 3) * 13) * 0.06;
    colors[i * 3] = clamp(tmp.r + n, 0, 1);
    colors[i * 3 + 1] = clamp(tmp.g + n * 0.7, 0, 1);
    colors[i * 3 + 2] = clamp(tmp.b + n * 0.4, 0, 1);
  }
  geo.computeVertexNormals();
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
}

function wagon(wood, canvas, dark) {
  const g = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 2.6), wood);
  bed.position.y = 0.85;
  bed.castShadow = true;
  const bonnet = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.9, 12, 1, true, 0, Math.PI), canvas);
  bonnet.rotation.z = Math.PI / 2;
  bonnet.rotation.y = Math.PI / 2;
  bonnet.position.set(0, 1.55, -0.05);
  bonnet.castShadow = true;
  g.add(bed, bonnet);
  for (const [x, z] of [[-0.78, -0.9], [0.78, -0.9], [-0.78, 0.9], [0.78, 0.9]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 10), dark);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.38, z);
    w.castShadow = true;
    g.add(w);
  }
  return g;
}

function buildPages(scene) {
  const tex = pageTexture();
  const spots = [
    ["handbills", -5.6, -5.4],
    ["dentistry", 4.3, 36],
    ["bear", -4.5, 58],
    ["pendulum", 3.6, 81],
    ["circus", -6.2, 100.4],
  ];
  return spots.map(([id, x, z]) => {
    const mat = new THREE.MeshStandardMaterial({
      map: tex, emissive: 0xffe2a8, emissiveIntensity: 0.55,
      roughness: 0.55, metalness: 0.04, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.96), mat);
    const y = heightAt(x, z) + 1.2;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    const glow = new THREE.PointLight(0xffe6b0, 1.6, 5.5, 2);
    glow.position.set(0, 0, 0.15);
    mesh.add(glow);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.5, 18),
      new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = heightAt(x, z) - y + 0.08;
    mesh.add(ring);
    scene.add(mesh);
    return { id, x, z, mesh, got: false, baseY: y };
  });
}

function posePages(pages, t) {
  for (const p of pages) {
    if (p.got) {
      p.mesh.visible = false;
      continue;
    }
    p.mesh.visible = true;
    p.mesh.position.y = p.baseY + Math.sin(t * 2.1 + p.x) * 0.12;
    p.mesh.rotation.y = t * 0.55 + p.z;
    p.mesh.rotation.z = Math.sin(t * 1.4 + p.z) * 0.06;
  }
}

function pageTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 168;
  const g = c.getContext("2d");
  g.clearRect(0, 0, 128, 168);
  g.fillStyle = "#f3e6c8";
  g.beginPath();
  g.moveTo(14, 8);
  g.lineTo(108, 6);
  g.lineTo(120, 22);
  g.lineTo(116, 70);
  g.lineTo(122, 108);
  g.lineTo(110, 156);
  g.lineTo(18, 160);
  g.lineTo(8, 120);
  g.lineTo(12, 48);
  g.closePath();
  g.fill();
  g.strokeStyle = "#8a6238";
  g.lineWidth = 2;
  g.stroke();
  g.strokeStyle = "rgba(90, 58, 32, .35)";
  g.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.moveTo(24, 36 + i * 16);
    g.lineTo(100 - (i % 3) * 8, 36 + i * 16);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildFloats(scene, wood, canvas, dark) {
  return [[-3.5, 99.1], [3.6, 98.4]].map(([x, z]) => {
    const mesh = wagon(wood, canvas, dark);
    mesh.position.set(x, heightAt(x, z), z);
    scene.add(mesh);
    return { mesh, x, z, homeX: x, homeZ: z, drift: false, floated: false };
  });
}

function buildRope(scene, wood) {
  const z0 = 80;
  const postMat = wood;
  for (const x of [-3.3, 3.3]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.3, 6), postMat);
    post.position.set(x, heightAt(x, z0) + 2.15, z0);
    post.castShadow = true;
    scene.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.16, 0.2), postMat);
  beam.position.set(0, heightAt(0, z0) + 4.25, z0);
  beam.castShadow = true;
  scene.add(beam);
  const line = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.08, 1, 6),
    new THREE.MeshLambertMaterial({ color: 0xd7c08a }),
  );
  const bob = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 10),
    new THREE.MeshLambertMaterial({ color: 0x5c3e2c }),
  );
  bob.castShadow = true;
  scene.add(line, bob);
  return { z0, pivotY: heightAt(0, z0) + 4.2, len: 3.15, line, bob, x: 0, y: 1.2, low: false };
}

function poseRope(rope, t) {
  const ang = Math.sin(t * 1.55) * 1.08;
  const x = Math.sin(ang) * rope.len;
  const y = rope.pivotY - Math.cos(ang) * rope.len;
  rope.x = x;
  rope.y = y;
  rope.z = rope.z0;
  rope.low = Math.abs(ang) < 0.36;
  rope.bob.position.set(x, y, rope.z0);
  rope.line.scale.y = rope.len;
  rope.line.position.set(x * 0.5, (y + rope.pivotY) * 0.5, rope.z0);
  rope.line.rotation.z = ang + Math.PI;
}

function campfire() {
  const g = new THREE.Group();
  const logM = new THREE.MeshLambertMaterial({ color: 0x4a3224 });
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.7, 6), logM);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = i * 0.8;
    log.position.y = 0.1;
    g.add(log);
  }
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 7), new THREE.MeshBasicMaterial({ color: 0xff7a32, transparent: true, opacity: 0.85 }));
  outer.position.y = 0.36;
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), new THREE.MeshBasicMaterial({ color: 0xffe2a0 }));
  inner.position.y = 0.34;
  const light = new THREE.PointLight(0xff8a3a, 7, 11, 1.6);
  light.position.y = 0.6;
  g.add(outer, inner, light);
  g.userData = { light, outer, inner };
  return g;
}

function placeChest(scene, x, z, wood, dark) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.38, 0.42), wood);
  body.position.y = 0.32;
  body.castShadow = true;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.12, 0.46), dark);
  lid.geometry.translate(0, 0.06, 0.23);
  lid.position.set(0, 0.51, -0.23);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.48), new THREE.MeshStandardMaterial({ color: 0xc6a15a, metalness: 0.6, roughness: 0.35 }));
  band.position.y = 0.02;
  lid.add(band);
  g.add(body, lid);
  g.position.set(x, heightAt(x, z), z);
  scene.add(g);
  return { mesh: g, lid, x, z, open: false };
}

function sign(scene, x, z, title, sub) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#6a4a30";
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = "#e6d2a8";
  g.strokeRect(6, 6, 244, 116);
  g.fillStyle = "#f3e6c8";
  g.font = "600 28px Georgia";
  g.textAlign = "center";
  g.fillText(title, 128, 58);
  g.font = "italic 16px Georgia";
  g.fillText(sub, 128, 90);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 6), new THREE.MeshLambertMaterial({ color: 0x5a4030 }));
  post.position.set(x, heightAt(x, z) + 0.8, z);
  post.castShadow = true;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65), new THREE.MeshLambertMaterial({ map: tex }));
  board.position.set(x, heightAt(x, z) + 1.55, z);
  board.castShadow = true;
  scene.add(post, board);
}

function scatterRocks(scene, low) {
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const spots = [];
  for (let z = 24; z <= 98; z += low ? 4.2 : 2.8) {
    for (const side of [-1, 1]) {
      const jitter = hash(z * 3 + side) * 1.4;
      const x = side * (8.4 + jitter + hash(z + side * 9) * 1.6);
      spots.push([x, z, 1.3 + hash(z * side) * 1.8, hash(z * 13) * 6]);
      if (!low && hash(z + 4) > 0.45) {
        spots.push([side * (11 + hash(z * 5)), z + 1.2, 1.8 + hash(z) * 2.2, 2 + hash(z)]);
      }
    }
  }
  for (let i = 0; i < (low ? 8 : 14); i++) {
    const a = i / 14 * Math.PI * 2;
    spots.push([Math.cos(a) * (22 + (i % 3)), Math.sin(a) * 10 + (i % 5) * 4, 2 + (i % 4), i]);
  }
  const mesh = new THREE.InstancedMesh(geo, mat, spots.length);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  spots.forEach((s, i) => {
    dummy.position.set(s[0], heightAt(s[0], s[1]) + s[2] * 0.25, s[1]);
    dummy.scale.setScalar(s[2]);
    dummy.rotation.set(s[3], s[3] * 0.7, s[3] * 0.3);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.setHex(i % 3 === 0 ? 0x8a5a3c : i % 3 === 1 ? 0xa86b48 : 0x6e4634);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);
}

function scatterYucca(scene, low) {
  const n = low ? 8 : 14;
  for (let i = 0; i < n; i++) {
    const z = -6 + i * 9.5;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (z > 22 && z < 96 ? 5.4 : 8 + (i % 3));
    if (Math.abs(x) < 1.2) continue;
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.7, 5), new THREE.MeshLambertMaterial({ color: 0x6a7040 }));
    trunk.position.y = 0.35;
    g.add(trunk);
    for (let k = 0; k < 6; k++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.7, 4), new THREE.MeshLambertMaterial({ color: 0x7d8a48 }));
      leaf.position.y = 0.75;
      leaf.rotation.z = 0.5;
      leaf.rotation.y = (k / 6) * Math.PI * 2;
      g.add(leaf);
    }
    g.position.set(x, heightAt(x, z), z);
    scene.add(g);
  }
}

function mesas(scene) {
  const stone = new THREE.MeshLambertMaterial({ color: 0xc48458, flatShading: true });
  const cap = new THREE.MeshLambertMaterial({ color: 0xd8aa78, flatShading: true });
  const spots = [[-28, 30, 10, 7], [30, 55, 12, 8], [-32, 80, 9, 6], [26, 100, 11, 7], [-24, 120, 8, 5]];
  for (const [x, z, h, r] of spots) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, h, 6), stone);
    m.position.set(x, h * 0.35, z);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r * 0.68, 0.6, 6), cap);
    top.position.y = h * 0.5;
    m.add(top);
    scene.add(m);
  }
}

function buildGate() {
  const root = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0xd7b56a, metalness: 0.75, roughness: 0.28 });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.3, 8), brass);
    p.position.set(s * 1.15, 1.65, 0);
    p.castShadow = true;
    root.add(p);
    for (let i = 0; i < 5; i++) {
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), brass);
      rivet.position.set(s * 1.15, 0.4 + i * 0.55, 0.16);
      root.add(rivet);
    }
  }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.14, 8, 18, Math.PI), brass);
  arch.position.y = 3.3;
  arch.rotation.x = Math.PI;
  arch.castShadow = true;
  root.add(arch);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), glowMat);
  glow.position.y = 1.7;
  root.add(glow);
  const plaque = signPlane("THE SET", "Step back");
  plaque.position.set(0, 2.15, 0.18);
  root.add(plaque);
  return { root, glow, open: false, setOpen(v) { this.open = v; glowMat.opacity = v ? 0.45 : 0; } };
}

function signPlane(a, b) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(36,24,14,0.0)";
  g.clearRect(0, 0, 256, 128);
  g.fillStyle = "#f3e6c8";
  g.font = "600 28px Georgia";
  g.textAlign = "center";
  g.fillText(a, 128, 52);
  g.font = "italic 20px Georgia";
  g.fillText(b, 128, 88);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
}

function airship() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 12), new THREE.MeshLambertMaterial({ color: 0x8a7568 }));
  hull.scale.set(1, 0.62, 2.1);
  const bag = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 6.5, 10), new THREE.MeshLambertMaterial({ color: 0xa89078 }));
  bag.rotation.x = Math.PI / 2;
  bag.position.y = 1.8;
  const gondola = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 2.4), new THREE.MeshLambertMaterial({ color: 0x5a4034 }));
  gondola.position.y = -1.5;
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.3, 8), new THREE.MeshLambertMaterial({ color: 0x6a4a32 }));
  stack.position.set(0, -0.6, -0.4);
  const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), new THREE.MeshBasicMaterial({ color: 0x4a403c, transparent: true, opacity: 0.45 }));
  smoke.position.set(0, 0.3, -0.4);
  g.add(hull, bag, gondola, stack, smoke);
  g.scale.setScalar(1.35);
  return g;
}

function ambientDust(n) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = 0.4 + Math.random() * 3.5;
    pos[i * 3 + 2] = Math.random() * 140;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xf0d2a4, size: 0.12, map: softDot(), transparent: true, depthWrite: false, opacity: 0.45, sizeAttenuation: true,
  }));
}

function driftDust(pts, t) {
  const arr = pts.geometry.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] += 0.004;
    arr[i + 1] += Math.sin(t + i) * 0.001;
    if (arr[i] > 16) arr[i] = -16;
  }
  pts.geometry.attributes.position.needsUpdate = true;
  pts.position.z = 0;
}

function skyTex() {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#2e243c");
  grd.addColorStop(0.28, "#6a3a48");
  grd.addColorStop(0.48, "#d36a3c");
  grd.addColorStop(0.66, "#f0a85c");
  grd.addColorStop(0.82, "#f6d7a4");
  grd.addColorStop(1, "#f3e0bc");
  g.fillStyle = grd;
  g.fillRect(0, 0, 16, 256);
  g.fillStyle = "rgba(255, 236, 196, 0.9)";
  g.beginPath();
  g.arc(8, 168, 14, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}
