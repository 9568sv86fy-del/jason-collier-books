import * as THREE from "three";
import { clamp, hash, lerp } from "./util.js";
import { createCritter, softDot, trailKey } from "./rigs.js";

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

  scene.fog = new THREE.FogExp2(0xc4845a, low ? 0.018 : 0.011);
  scene.background = new THREE.Color(0xc4845a);

  const hemi = new THREE.HemisphereLight(0xffd2b0, 0x6a4834, 0.72);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc48a, 2.35);
  sun.position.set(-18, 26, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(low ? 512 : 2048, low ? 512 : 2048);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 86;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
  sun.shadow.camera.right = sun.shadow.camera.top = 22;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.045;
  sun.shadow.radius = low ? 1.4 : 3.2;
  if ("blurSamples" in sun.shadow) sun.shadow.blurSamples = low ? 4 : 8;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xffe4c4, 0.42);
  fill.position.set(12, 8, 18);
  scene.add(fill);

  const skyMat = skyMaterial();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(280, 32, 20), skyMat);
  sky.frustumCulled = false;
  scene.add(sky);
  const camHit = [];
  const camSphere = (x, y, z, r) => camHit.push({ x, y, z, r });

  const ground = buildGround();
  ground.receiveShadow = true;
  scene.add(ground);
  dressTerrain(ground, low);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x8a6844, roughness: 0.18, metalness: 0.08, transparent: true, opacity: 0.78,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(30, 14, 12, 6), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, heightAt(0, 115) + 0.22, 115);
  scene.add(water);

  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.86, metalness: 0.02 });
  const canvas = new THREE.MeshStandardMaterial({ color: 0xe4d2ae, roughness: 0.92, metalness: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2118, roughness: 0.7, metalness: 0.08 });
  dressWood(wood, low);

  const addWagon = (x, z, rot, tilt = 0) => {
    const w = wagon(wood, canvas, dark);
    w.position.set(x, heightAt(x, z), z);
    w.rotation.y = rot;
    w.rotation.z = tilt;
    scene.add(w);
    block(x, z, 1.9);
    return w;
  };
  const w1 = addWagon(-6.2, 1.4, 0.5);
  const w2 = addWagon(6.4, -1.2, -0.7);
  const w3 = addWagon(2.4, 46, 0.4, 0.35);
  for (const w of [w1, w2, w3]) camSphere(w.position.x, w.position.y + 1.2, w.position.z, 1.7);

  const fire = campfire();
  fire.position.set(0.4, heightAt(0.4, 2.4), 2.4);
  scene.add(fire);
  block(0.4, 2.4, 0.7);

  const chests = [];
  chests.push(placeChest(scene, 4.2, 3.6, wood, dark));
  chests.push(placeChest(scene, -2.2, 61, wood, dark));
  chests.forEach((c) => block(c.x, c.z, 0.55));

  sign(scene, -3.4, 6.2, "CALIFORNIA TRAIL", "Experienced navigators");
  sign(scene, 0.2, 26, "RIVER FORD", "Mind the fog");

  scatterRocks(scene, low, camSphere);
  scatterPlants(scene, low);
  mesas(scene, camSphere);

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

  const radio = buildRadio(scene);

  const gate = buildGate();
  gate.root.position.set(0, heightAt(0, 126), 126);
  scene.add(gate.root);

  const ship = airship();
  ship.position.set(1.5, 16, 142);
  scene.add(ship);

  const dust = ambientDust(low ? 80 : 160);
  scene.add(dust);
  const town = buildTown(scene, obstacles, block);

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
    radio,
    town,
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
      skyMat.uniforms.uTime.value = t;
      const calm = focus.z < 7;
      scene.fog.color.setHex(calm ? 0xe7b48a : 0xc4845a);
      if (gate.open) {
        gate.glow.material.opacity = 0.35 + Math.sin(t * 3) * 0.15;
      }
      posePages(pages, t);
      poseRope(rope, t);
      if (radio) {
        radio.glow.material.opacity = 0.4 + Math.sin(t * 3.2) * 0.35;
        radio.glow.scale.setScalar(0.9 + Math.sin(t * 5) * 0.12);
      }
      for (const w of floats) {
        if (!w.floated) continue;
        w.mesh.position.y = heightAt(w.x, w.z) + 0.22 + Math.sin(t * 1.6 + w.x) * 0.06;
        w.mesh.rotation.z = Math.sin(t * 1.3 + w.z) * 0.04;
      }
    },
    pullCamera(focus, desired) {
      const dir = desired.clone().sub(focus);
      let maxDist = dir.length();
      if (maxDist < 0.25) return desired;
      dir.multiplyScalar(1 / maxDist);
      let dist = maxDist;
      for (const s of camHit) {
        const ox = focus.x - s.x;
        const oy = focus.y - s.y;
        const oz = focus.z - s.z;
        const b = ox * dir.x + oy * dir.y + oz * dir.z;
        const c = ox * ox + oy * oy + oz * oz - s.r * s.r;
        const disc = b * b - c;
        if (disc < 0) continue;
        const sd = Math.sqrt(disc);
        const t1 = -b - sd;
        const t2 = -b + sd;
        const tHit = t1 > 0.15 ? t1 : (t2 > 0.15 ? t2 : -1);
        if (tHit > 0 && tHit < dist) dist = Math.max(1.05, tHit - 0.2);
      }
      const steps = 7;
      for (let i = 1; i <= steps; i++) {
        const t = (dist * i) / steps;
        const x = focus.x + dir.x * t;
        const y = focus.y + dir.y * t;
        const z = focus.z + dir.z * t;
        if (y < heightAt(x, z) + 0.5) {
          dist = Math.max(1.1, t * 0.86);
          break;
        }
      }
      dist = Math.max(1.2, Math.min(maxDist, dist));
      const out = focus.clone().addScaledVector(dir, dist);
      const floorY = heightAt(out.x, out.z) + 0.42;
      if (out.y < floorY) out.y = floorY;
      return out;
    },
    resolve(x, z, radius, extra, feetY = null) {
      let px = x;
      let pz = clamp(z, -56, 129.2);
      for (let n = 0; n < 2; n++) {
        const half = halfWidth(pz) - radius;
        px = clamp(px, -half, half);
        const all = extra ? obstacles.concat(extra) : obstacles;
        for (const o of all) {
          if (o.low && (feetY == null || feetY > heightAt(o.x, o.z) + 0.55)) continue;
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
  const geo = new THREE.PlaneGeometry(54, 210, 40, 140);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color(0.96, 0.9, 0.8);
  const path = new THREE.Color(1.08, 1.0, 0.86);
  const rock = new THREE.Color(0.72, 0.66, 0.6);
  const wet = new THREE.Color(0.58, 0.52, 0.44);
  const camp = new THREE.Color(1.02, 0.88, 0.7);
  const dawn = new THREE.Color(1.08, 0.9, 0.7);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const lz = pos.getZ(i);
    const z = lz + 34;
    pos.setZ(i, z);
    pos.setY(i, heightAt(x, z));
    const pathK = Math.exp(-(x * x) / 16);
    const riverK = Math.exp(-((z - 115) * (z - 115)) / 28);
    const campK = Math.exp(-(x * x + (z - 1) * (z - 1)) / 220);
    const dawnK = z < -6 ? clamp((-6 - z) / 28, 0, 0.55) : 0;
    const canyonK = z > 24 && z < 98 ? 0.45 : 0;
    tmp.copy(base).lerp(path, pathK * 0.65).lerp(camp, campK * 0.35).lerp(rock, canyonK * (1 - pathK)).lerp(wet, riverK * 0.7).lerp(dawn, dawnK);
    const n = (hash(i + Math.floor(x * 3) * 13) - 0.5) * 0.08;
    colors[i * 3] = clamp(tmp.r + n, 0, 1.2);
    colors[i * 3 + 1] = clamp(tmp.g + n * 0.7, 0, 1.2);
    colors[i * 3 + 2] = clamp(tmp.b + n * 0.4, 0, 1.2);
  }
  geo.computeVertexNormals();
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * 28, uv.getY(i) * 48);
  }
  uv.needsUpdate = true;
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xffffff, vertexColors: true, roughness: 0.94, metalness: 0.02,
  }));
}

function wagon(wood, canvas, dark) {
  const g = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.28, 2.7), wood);
  bed.position.y = 0.78;
  bed.castShadow = true;
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 2.5), wood);
  sideL.position.set(-0.74, 1.02, 0);
  const sideR = sideL.clone();
  sideR.position.x = 0.74;
  const bowMat = canvas;
  const bonnet = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.05, 16, 1, true, 0, Math.PI), bowMat);
  bonnet.rotation.z = Math.PI / 2;
  bonnet.rotation.y = Math.PI / 2;
  bonnet.position.set(0, 1.55, -0.02);
  bonnet.castShadow = true;
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.3), wood);
  tongue.position.set(0, 0.7, 1.85);
  g.add(bed, sideL, sideR, bonnet, tongue);
  const spokeMat = dark;
  for (const [x, z] of [[-0.82, -0.95], [0.82, -0.95], [-0.82, 0.95], [0.82, 0.95]]) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 6, 16), spokeMat);
    tire.rotation.y = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 8), spokeMat);
    hub.rotation.z = Math.PI / 2;
    wheel.add(tire, hub);
    for (let s = 0; s < 6; s++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.32, 0.02), spokeMat);
      spoke.rotation.z = (s / 6) * Math.PI * 2;
      wheel.add(spoke);
    }
    wheel.position.set(x, 0.38, z);
    wheel.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.add(wheel);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function buildPages(scene) {
  const tex = pageTexture();
  const spots = [
    ["handbills", -5.6, -5.4],
    ["dentistry", 4.3, 36],
    ["bear", -4.5, 58],
    ["pendulum", 3.6, 81],
    ["circus", -8.4, 99.2],
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

function scatterRocks(scene, low, camSphere) {
  const geo = new THREE.IcosahedronGeometry(1, low ? 1 : 2);
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.04 });
  dressRock(mat, low);
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
    col.setHex(i % 3 === 0 ? 0xc4a080 : i % 3 === 1 ? 0xa88868 : 0x8c684c);
    mesh.setColorAt(i, col);
    if (camSphere) camSphere(s[0], heightAt(s[0], s[1]) + s[2] * 0.35, s[1], s[2] * 0.82);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = !low;
  mesh.receiveShadow = true;
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

function mesas(scene, camSphere) {
  const stone = new THREE.MeshStandardMaterial({ color: 0xc48a62, roughness: 0.9, metalness: 0.03 });
  const cap = new THREE.MeshStandardMaterial({ color: 0xd8b088, roughness: 0.86, metalness: 0.02 });
  dressRock(stone, true);
  dressRock(cap, true);
  const spots = [[-28, 30, 10, 7], [30, 55, 12, 8], [-32, 80, 9, 6], [26, 100, 11, 7], [-24, 120, 8, 5]];
  for (const [x, z, h, r] of spots) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r, h, 12, 1), stone);
    m.position.set(x, h * 0.35, z);
    m.castShadow = true;
    m.receiveShadow = true;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.74, r * 0.7, 0.55, 12), cap);
    top.position.y = h * 0.5;
    m.add(top);
    scene.add(m);
    if (camSphere) camSphere(x, h * 0.45, z, r * 0.85);
  }
}

function buildTown(scene, obstacles, block) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a5234, roughness: 0.84, metalness: 0.02 });
  const canvas = new THREE.MeshStandardMaterial({ color: 0xe7d3ae, roughness: 0.9, metalness: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2118, roughness: 0.8, metalness: 0.05 });
  const hayMat = new THREE.MeshStandardMaterial({ color: 0xc6a15a, roughness: 0.96, metalness: 0 });
  const group = new THREE.Group();
  scene.add(group);

  const tent = (x, z, rot) => {
    const g = new THREE.Group();
    const cloth = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.5, 4), canvas);
    cloth.position.y = 0.9;
    cloth.rotation.y = Math.PI / 4;
    cloth.castShadow = true;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 5), dark);
    pole.position.y = 0.85;
    g.add(cloth, pole);
    g.position.set(x, heightAt(x, z), z);
    g.rotation.y = rot;
    group.add(g);
    block(x, z, 0.9);
  };
  tent(-6.5, -46, 0.4);
  tent(6.2, -44, -0.5);
  tent(-5.4, -30, 0.2);

  sign(scene, -3.2, -48.5, "EDGE OF THE BOOK", "Dawn. Color intact.");

  const logs = [];
  for (const x of [-4.6, -2.3, 0, 2.3, 4.6]) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 1.7, 8), wood);
    log.rotation.z = Math.PI / 2;
    log.position.set(x, heightAt(x, -37) + 0.24, -37);
    log.castShadow = true;
    group.add(log);
    const o = { x, z: -37, r: 0.72, low: true };
    obstacles.push(o);
    logs.push(o);
  }
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), dark);
  boulder.position.set(-5.6, heightAt(-5.6, -33.5) + 0.55, -33.5);
  boulder.castShadow = true;
  group.add(boulder);
  block(-5.6, -33.5, 0.95);

  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.7), wood);
  crate.position.set(0.3, heightAt(0.3, -22) + 0.28, -22);
  crate.castShadow = true;
  group.add(crate);
  block(0.3, -22, 0.45);
  const key = trailKey();
  key.position.set(0.3, heightAt(0.3, -22) + 0.7, -22);
  key.rotation.y = 0.6;
  group.add(key);

  const dummies = [];
  for (const x of [-2.1, 0.2, 2.3]) {
    const root = new THREE.Group();
    const bale = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.72, 10), hayMat);
    bale.rotation.z = Math.PI / 2;
    bale.position.y = 0.55;
    bale.castShadow = true;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.35, 6), wood);
    post.position.y = 0.7;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), canvas);
    cap.position.y = 1.35;
    root.add(bale, post, cap);
    const z = -16;
    root.position.set(x, heightAt(x, z), z);
    root.visible = false;
    group.add(root);
    dummies.push({ root, x, z });
  }

  const barn = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ color: 0x6a4330, roughness: 0.88 });
  const shell = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3.4), wall);
  shell.position.y = 1.3;
  shell.castShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.2, 4), dark);
  roof.position.y = 3.05;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.8),
    new THREE.MeshBasicMaterial({ color: 0x140e0c }),
  );
  door.position.set(0, 0.95, 1.72);
  const lamp = new THREE.PointLight(0xffc56a, 0, 9, 1.4);
  lamp.position.set(0, 2.1, 0.4);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x2a241c, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.4 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), windowMat);
  win.position.set(1.15, 1.7, 1.72);
  barn.add(shell, roof, door, lamp, win);
  const bx = 8.2;
  const bz = -18;
  barn.position.set(bx, heightAt(bx, bz), bz);
  group.add(barn);
  block(bx, bz, 1.7);

  const gate = new THREE.Group();
  gate.visible = false;
  const railMat = new THREE.MeshStandardMaterial({ color: 0x8a6844, roughness: 0.8 });
  for (const x of [-6, -3, 0, 3, 6]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 6), wood);
    post.position.set(x, 0.7, 0);
    post.castShadow = true;
    gate.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(13, 0.08, 0.08), railMat);
  rail.position.y = 0.9;
  gate.add(rail);
  const gz = 6.6;
  gate.position.set(0, heightAt(0, gz), gz);
  group.add(gate);
  sign(scene, 2.4, 5.2, "CANYON ROAD", "Closed until the edge is quiet");
  const gateObs = [];

  return {
    key,
    dummies,
    barn: { lamp, windowMat, x: bx, z: bz },
    open() {
      gate.visible = false;
      for (const o of gateObs) {
        const i = obstacles.indexOf(o);
        if (i >= 0) obstacles.splice(i, 1);
      }
      gateObs.length = 0;
    },
    close() {
      gate.visible = true;
      if (gateObs.length) return;
      for (let x = -6.5; x <= 6.5; x += 1.4) {
        const o = { x, z: gz, r: 0.8 };
        obstacles.push(o);
        gateObs.push(o);
      }
    },
    lightBarn() {
      lamp.intensity = 7;
      windowMat.emissive.setHex(0xffc56a);
      windowMat.emissiveIntensity = 0.8;
    },
  };
}

function buildRadio(scene) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6a4328, roughness: 0.72 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xe0c07a, roughness: 0.35, metalness: 0.65 });
  const root = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.42, 0.34), woodMat);
  box.castShadow = true;
  const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.04), brassMat);
  speaker.position.set(-0.16, 0, 0.16);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 10), brassMat);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0.2, -0.02, 0.16);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6), brassMat);
  mast.position.set(0.28, 0.42, 0);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.75 }),
  );
  glow.position.set(0, 0.55, 0);
  root.add(box, speaker, dial, mast, glow);
  const x = 6.2;
  const z = -4.8;
  root.position.set(x, heightAt(x, z) + 0.22, z);
  root.rotation.y = -0.6;
  scene.add(root);
  return { root, glow, x, z };
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

function skyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSun: { value: new THREE.Vector3(-0.48, 0.78, -0.32).normalize() },
      uTime: { value: 0 },
    },
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDir;
      uniform vec3 uSun;
      uniform float uTime;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; }
        return v;
      }
      void main() {
        vec3 n = normalize(vDir);
        float h = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 zenith = vec3(0.16, 0.22, 0.42);
        vec3 mid = vec3(0.72, 0.34, 0.28);
        vec3 hor = vec3(0.98, 0.72, 0.46);
        vec3 ground = vec3(0.45, 0.28, 0.18);
        vec3 col = mix(ground, hor, smoothstep(-0.08, 0.08, n.y));
        col = mix(col, mid, smoothstep(0.02, 0.28, n.y));
        col = mix(col, zenith, smoothstep(0.25, 0.85, n.y));
        float sun = pow(max(dot(n, uSun), 0.0), 1400.0);
        float glow = pow(max(dot(n, uSun), 0.0), 6.0);
        col += vec3(1.0, 0.78, 0.45) * glow * 0.55;
        col += vec3(1.0, 0.96, 0.82) * sun * 1.4;
        float plane = n.y > 0.04 ? 1.0 : 0.0;
        vec2 uv = n.xz / max(n.y, 0.08);
        float c = fbm(uv * 0.35 + vec2(uTime * 0.012, uTime * 0.004));
        float cloud = smoothstep(0.52, 0.74, c) * smoothstep(0.05, 0.22, n.y) * plane;
        col = mix(col, vec3(0.98, 0.94, 0.9), cloud * 0.72);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

function texPath(low, name) {
  return `./assets/tex/${low ? "512" : "1k"}/${name}.jpg`;
}

function loadRepeat(url, colorSpace) {
  const tex = new THREE.TextureLoader().load(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = colorSpace ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function sandFromImage(img) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
    d[i] = Math.min(255, l * 1.05 + 48);
    d[i + 1] = Math.min(255, l * 0.82 + 28);
    d[i + 2] = Math.min(255, l * 0.48 + 12);
  }
  g.putImageData(data, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function dressTerrain(ground, low) {
  const img = new Image();
  img.onload = () => {
    const map = sandFromImage(img);
    ground.material.map = map;
    ground.material.needsUpdate = true;
  };
  img.src = texPath(low, "dirt_col");
  const nrm = loadRepeat(texPath(low, "dirt_nrm"), false);
  const rgh = loadRepeat(texPath(low, "dirt_rgh"), false);
  ground.material.normalMap = nrm;
  ground.material.roughnessMap = rgh;
  ground.material.normalScale = new THREE.Vector2(1.15, 1.15);
}

function dressRock(mat, low) {
  mat.map = loadRepeat(texPath(low, "rock_col"), true);
  mat.normalMap = loadRepeat(texPath(low, "rock_nrm"), false);
  mat.roughnessMap = loadRepeat(texPath(low, "rock_rgh"), false);
  mat.normalScale = new THREE.Vector2(1, 1);
}

function dressWood(mat, low) {
  const map = loadRepeat(texPath(low, "bark_col"), true);
  map.repeat.set(2, 2);
  mat.map = map;
  mat.roughnessMap = loadRepeat(texPath(low, "bark_rgh"), false);
  mat.color.setHex(0xffffff);
}

function scatterPlants(scene, low) {
  const sageGeo = new THREE.SphereGeometry(0.35, 7, 5);
  sageGeo.scale(1.4, 0.55, 1.1);
  const sageMat = new THREE.MeshStandardMaterial({ color: 0x8a8f62, roughness: 0.95, metalness: 0 });
  const sageN = low ? 64 : 170;
  const sage = new THREE.InstancedMesh(sageGeo, sageMat, sageN);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < sageN; i++) {
    const z = -8 + (i * 137.5) % 140;
    const side = i % 2 === 0 ? -1 : 1;
    const span = z > 22 && z < 96 ? 5.2 : 7.5;
    const x = side * (span + hash(i * 3.1) * 4.5);
    dummy.position.set(x, heightAt(x, z) + 0.18, z);
    dummy.scale.setScalar(0.55 + hash(i + 4) * 0.9);
    dummy.rotation.y = hash(i * 9) * 6;
    dummy.updateMatrix();
    sage.setMatrixAt(i, dummy.matrix);
  }
  sage.instanceMatrix.needsUpdate = true;
  sage.receiveShadow = true;
  scene.add(sage);

  const cacGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.15, 7);
  const cacMat = new THREE.MeshStandardMaterial({ color: 0x6e8a48, roughness: 0.8, metalness: 0.02 });
  const cacN = low ? 8 : 18;
  const cac = new THREE.InstancedMesh(cacGeo, cacMat, cacN);
  for (let i = 0; i < cacN; i++) {
    const z = 4 + i * 7.4;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (z > 22 && z < 96 ? 6.2 : 10 + (i % 3));
    dummy.position.set(x, heightAt(x, z) + 0.55, z);
    dummy.scale.set(1, 0.8 + hash(i) * 0.7, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    cac.setMatrixAt(i, dummy.matrix);
  }
  cac.instanceMatrix.needsUpdate = true;
  cac.castShadow = !low;
  scene.add(cac);

  const blade = new THREE.PlaneGeometry(0.18, 0.42);
  blade.translate(0, 0.21, 0);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0xb7a15a, roughness: 1, metalness: 0, side: THREE.DoubleSide,
  });
  const gN = low ? 90 : 240;
  const grass = new THREE.InstancedMesh(blade, grassMat, gN);
  for (let i = 0; i < gN; i++) {
    const z = -6 + (i * 97.3) % 132;
    let x = (hash(i * 1.7) - 0.5) * (z > 24 && z < 96 ? 12 : 22);
    if (Math.abs(x) < 0.9) x = x < 0 ? -1.5 : 1.5;
    dummy.position.set(x, heightAt(x, z), z);
    dummy.rotation.y = hash(i * 2) * Math.PI;
    dummy.scale.setScalar(0.7 + hash(i + 2) * 0.8);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  }
  grass.instanceMatrix.needsUpdate = true;
  scene.add(grass);
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
