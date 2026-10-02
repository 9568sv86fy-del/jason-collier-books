// Trees, snags, rocks, willows and deadfall. Instanced in chunks for culling.
// Every tree material shares an occlusion shader: anything between the camera and
// Harlan dissolves (dithered), so a trunk or bough never hides him.
import * as THREE from "three";
import { BOUNDS, PLACES, VIEWS, clearing, creekDist, heightAt, roadDist, trailDist } from "./terrain.js";
import { clamp, fbm, hash2, rng, smooth } from "./util.js";

export const occlusion = {
  uCam: { value: new THREE.Vector3() },
  uPlayer: { value: new THREE.Vector3() },
  uOn: { value: 1 },
};

export function occlude(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uCam = occlusion.uCam;
    sh.uniforms.uPlayer = occlusion.uPlayer;
    sh.uniforms.uOn = occlusion.uOn;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOccW;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 occW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        occW = instanceMatrix * occW;
        #endif
        vOccW = (modelMatrix * occW).xyz;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vOccW;\nuniform vec3 uCam;\nuniform vec3 uPlayer;\nuniform float uOn;")
      .replace(
        "void main() {",
        `void main() {
        if (uOn > 0.5) {
          float nz = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          vec3 seg = uPlayer - uCam;
          float L = length(seg);
          vec3 dir = seg / max(L, 0.001);
          float t = dot(vOccW - uCam, dir);
          if (t > 0.0 && t < L + 0.4) {
            float d = length(vOccW - (uCam + dir * t));
            float r = 0.9 + 0.9 * clamp(t / L, 0.0, 1.0);
            if (d < r && nz > smoothstep(r * 0.45, r, d) * 0.92) discard;
          }
          float dc = length(vOccW - uCam);
          if (dc < 5.5 && nz > smoothstep(2.0, 5.5, dc)) discard;
        }`,
      );
  };
  mat.customProgramCacheKey = () => "occlude";
  return mat;
}

// --- geometry helpers ---------------------------------------------------------------
function merge(geos) {
  let n = 0;
  const parts = geos.map((g) => {
    const ng = g.index ? g.toNonIndexed() : g;
    n += ng.attributes.position.count;
    return ng;
  });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.color) col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return out;
}
function paint(geo, fn) {
  const p = geo.attributes.position, nrm = geo.attributes.normal;
  const c = new Float32Array(p.count * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    fn(p.getX(i), p.getY(i), p.getZ(i), nrm.getX(i), nrm.getY(i), nrm.getZ(i), tmp, i);
    c[i * 3] = tmp.r; c[i * 3 + 1] = tmp.g; c[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return geo;
}

/** a spruce, unit height (1), base at y=0. Tiers of drooping cones with snow on top. */
function spruceGeometry(seed, snowy = 0.55) {
  const r = rng(seed);
  const tiers = 6;
  const parts = [];
  for (let k = 0; k < tiers; k++) {
    const t = k / (tiers - 1);
    const base = 0.16 + t * 0.66;
    const h = 0.3 - t * 0.08;
    const rad = 0.27 * (1 - t * 0.78) + 0.03;
    const g = new THREE.ConeGeometry(rad, h, 9, 1, true);
    // droop the rim + jitter so it reads as boughs, not a party hat
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y < 0) {
        const a = Math.atan2(p.getZ(i), p.getX(i));
        const j = 1 + (Math.sin(a * 5 + seed + k) * 0.12 + (r() - 0.5) * 0.1);
        p.setX(i, p.getX(i) * j);
        p.setZ(i, p.getZ(i) * j);
        p.setY(i, y - 0.03 - r() * 0.03);
      }
    }
    g.translate(0, base + h / 2, 0);
    g.computeVertexNormals();
    parts.push(g);
  }
  const geo = merge(parts);
  geo.computeVertexNormals();
  return paint(geo, (x, y, z, nx, ny, nz, c) => {
    const n = hash2(Math.floor(x * 97 + seed), Math.floor(y * 131 + z * 71));
    const snow = ny > 0.25 && n < snowy + ny * 0.25;
    if (snow) c.setRGB(0.83 + n * 0.08, 0.87 + n * 0.07, 0.92 + n * 0.05);
    else {
      const d = 0.65 + n * 0.45;
      c.setRGB(0.1 * d, 0.24 * d, 0.16 * d);
    }
  });
}
function trunkGeometry() {
  const g = new THREE.CylinderGeometry(0.012, 0.03, 1, 6, 1, true);
  g.translate(0, 0.5, 0);
  return paint(g, (x, y, z, nx, ny, nz, c) => c.setRGB(0.25, 0.18, 0.13));
}
function snagGeometry(seed) {
  const r = rng(seed);
  const parts = [];
  const t = new THREE.CylinderGeometry(0.012, 0.035, 1, 6, 4, true);
  // a little crooked
  const p = t.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) + 0.5;
    p.setX(i, p.getX(i) + Math.sin(y * 3 + seed) * 0.02 * y);
  }
  t.translate(0, 0.5, 0);
  t.computeVertexNormals();
  parts.push(t);
  for (let k = 0; k < 7; k++) {
    const y = 0.35 + r() * 0.55;
    const len = 0.06 + r() * 0.12;
    const b = new THREE.CylinderGeometry(0.003, 0.007, len, 4, 1, true);
    b.translate(0, len / 2, 0);
    b.rotateZ(-1.0 - r() * 0.5);
    b.rotateY(r() * Math.PI * 2);
    b.translate(0, y, 0);
    parts.push(b);
  }
  const geo = merge(parts);
  return paint(geo, (x, y, z, nx, ny, nz, c) => {
    const n = hash2(Math.floor(y * 200), seed);
    const charred = y < 0.3 ? 0.55 : 1;
    c.setRGB((0.42 + n * 0.08) * charred, (0.4 + n * 0.07) * charred, (0.38 + n * 0.06) * charred);
    if (ny > 0.6) c.setRGB(0.88, 0.9, 0.94);
  });
}
function rockGeometry(seed) {
  const g = new THREE.DodecahedronGeometry(1, 0);
  const r = rng(seed);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 0.75 + r() * 0.5;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.65, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return paint(g.index ? g.toNonIndexed() : g, (x, y, z, nx, ny, nz, c) => {
    if (ny > 0.55) c.setRGB(0.87, 0.9, 0.94);
    else c.setRGB(0.38, 0.37, 0.36);
  });
}
function willowGeometry(seed) {
  const r = rng(seed);
  const parts = [];
  for (let k = 0; k < 9; k++) {
    const h = 0.6 + r() * 0.5;
    const b = new THREE.CylinderGeometry(0.008, 0.02, h, 3, 1, true);
    b.translate(0, h / 2, 0);
    b.rotateZ((r() - 0.5) * 0.7);
    b.rotateY(r() * 6.28);
    b.translate((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3);
    parts.push(b);
  }
  return paint(merge(parts), (x, y, z, nx, ny, nz, c) => c.setRGB(0.42 + y * 0.12, 0.22 + y * 0.05, 0.14));
}
function logGeometry() {
  const g = new THREE.CylinderGeometry(0.22, 0.26, 1, 7, 1);
  g.rotateZ(Math.PI / 2);
  return paint(g.index ? g.toNonIndexed() : g, (x, y, z, nx, ny, nz, c) => {
    if (ny > 0.5) c.setRGB(0.86, 0.89, 0.93);
    else if (Math.abs(nx) > 0.9) c.setRGB(0.55, 0.42, 0.28);
    else c.setRGB(0.27, 0.2, 0.15);
  });
}

// --- placement --------------------------------------------------------------------
const CHUNK = 64;
export const colliders = new Map(); // cell key -> [{x,z,r}]
const CC = 4;
function addCollider(x, z, r) {
  const k = `${Math.floor(x / CC)},${Math.floor(z / CC)}`;
  let a = colliders.get(k);
  if (!a) colliders.set(k, (a = []));
  a.push({ x, z, r });
}
export function collide(x, z, rad) {
  // push a circle out of trunks/rocks; returns corrected position
  let px = x, pz = z;
  const cx = Math.floor(x / CC), cz = Math.floor(z / CC);
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const a = colliders.get(`${cx + i},${cz + j}`);
      if (!a) continue;
      for (const c of a) {
        const dx = px - c.x, dz = pz - c.z;
        const d = Math.hypot(dx, dz);
        const m = c.r + rad;
        if (d < m && d > 1e-4) {
          px = c.x + (dx / d) * m;
          pz = c.z + (dz / d) * m;
        }
      }
    }
  return { x: px, z: pz };
}
/** list of trunks near a point (for the walker to hide behind) */
export function trunksNear(x, z, radius) {
  const out = [];
  const n = Math.ceil(radius / CC);
  const cx = Math.floor(x / CC), cz = Math.floor(z / CC);
  for (let j = -n; j <= n; j++)
    for (let i = -n; i <= n; i++) {
      const a = colliders.get(`${cx + i},${cz + j}`);
      if (a) for (const c of a) if (c.r > 0.25 && Math.hypot(c.x - x, c.z - z) < radius) out.push(c);
    }
  return out;
}

// sight lines from the overlooks: nothing may stand tall enough to cut them
const SIGHT = [];
for (const [from, tos] of Object.entries(VIEWS)) {
  const a = PLACES[from];
  for (const to of tos) {
    const b = PLACES[to];
    SIGHT.push({ ax: a.x, az: a.z, bx: b.x, bz: b.z, h0: heightAt(a.x, a.z) + 1.6, h1: heightAt(b.x, b.z) + 1.2, len: Math.hypot(b.x - a.x, b.z - a.z) });
  }
}
function blocksView(x, z, top) {
  for (const s of SIGHT) {
    const dx = s.bx - s.ax, dz = s.bz - s.az;
    const t = ((x - s.ax) * dx + (z - s.az) * dz) / (s.len * s.len);
    if (t < 0.02 || t > 0.97) continue;
    const lat = Math.abs((x - s.ax) * dz - (z - s.az) * dx) / s.len;
    if (lat > 6 + t * s.len * 0.07) continue;
    const los = s.h0 + (s.h1 - s.h0) * t;
    if (top > los - 1.5) return true;
  }
  return false;
}

function densityAt(x, z) {
  const tr = trailDist(x, z);
  if (tr < 3.4) return { kind: "none", d: 0 };
  const rd = roadDist(x, z);
  if (rd < 7) return { kind: "none", d: 0 };
  const clr = clearing(x, z);
  if (clr > 0) return { kind: "none", d: 0 };
  let d = 0.42 + fbm(x / 60, z / 60, 3) * 0.3;
  const near = smooth(3.4, 11, tr);
  d *= 0.55 + 0.45 * near;
  const td = Math.hypot(x - PLACES.timber.x, z - PLACES.timber.z);
  d += (1 - smooth(25, 85, td)) * 0.45;
  const cd = Math.hypot(x - PLACES.camp.x, z - PLACES.camp.z);
  if (cd < 30) d += (1 - smooth(9, 30, cd)) * 0.5;
  const bd = Math.hypot(x - PLACES.burn.x, z - PLACES.burn.z);
  if (bd < 75) return { kind: "snag", d: 0.28 * (1 - smooth(50, 75, bd)) + 0.06 };
  const kd = Math.hypot(x - PLACES.knob.x, z - PLACES.knob.z);
  if (kd < 40) d *= smooth(24, 40, kd) * 0.6 + 0.1;
  const crk = creekDist(x, z);
  if (crk < 9) return { kind: "willow", d: crk < 2.2 ? 0 : 0.5 };
  const md = Math.hypot(x - PLACES.meadow.x, z - PLACES.meadow.z);
  if (md < 90) d *= smooth(56, 90, md);
  if (Math.abs(x) > 160 || z < -480) d = 0.85;
  if (z > 22) d = 0.6;
  return { kind: "spruce", d: clamp(d, 0, 0.95) };
}

export function buildForest(scene) {
  const SPRUCE_V = 4;
  const spruceGeos = Array.from({ length: SPRUCE_V }, (_, i) => spruceGeometry(11 + i * 17));
  const trunkGeo = trunkGeometry();
  const snagGeo = snagGeometry(5);
  const rockGeo = rockGeometry(9);
  const willowGeo = willowGeometry(3);
  const logGeo = logGeometry();
  const foliageMat = occlude(new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  const woodMat = occlude(new THREE.MeshLambertMaterial({ vertexColors: true }));
  const chunks = new Map();
  const bucket = (x, z, type, m) => {
    const k = `${Math.floor(x / CHUNK)},${Math.floor(z / CHUNK)}`;
    let c = chunks.get(k);
    if (!c) chunks.set(k, (c = { cx: (Math.floor(x / CHUNK) + 0.5) * CHUNK, cz: (Math.floor(z / CHUNK) + 0.5) * CHUNK, items: {} }));
    (c.items[type] ||= []).push(m);
  };
  const r = rng(77);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const STEP = 4.2;
  let count = 0;
  for (let z = BOUNDS.z0 - 30; z < BOUNDS.z1 + 30; z += STEP)
    for (let x = BOUNDS.x0 - 30; x < BOUNDS.x1 + 30; x += STEP) {
      const jx = x + (r() - 0.5) * STEP * 0.9, jz = z + (r() - 0.5) * STEP * 0.9;
      const { kind, d } = densityAt(jx, jz);
      if (kind === "none" || r() > d) continue;
      const y = heightAt(jx, jz);
      const rot = r() * Math.PI * 2;
      if (kind === "spruce") {
        const td = Math.hypot(jx - PLACES.timber.x, jz - PLACES.timber.z);
        const cd = Math.hypot(jx - PLACES.camp.x, jz - PLACES.camp.z);
        const old = td < 70 || cd < 30 ? 1.4 : 1;
        const H = (9 + r() * 10) * old;
        const W = H * (0.55 + r() * 0.2);
        // keep boughs off the trail: clearance grows with the tree
        if (trailDist(jx, jz) < 2.4 + W * 0.3) continue;
        if (cd < 16 + W * 0.25) continue;
        if (blocksView(jx, jz, y + H)) continue;
        q.setFromAxisAngle(up, rot);
        s.set(W, H, W);
        p.set(jx, y - 0.3, jz);
        mtx.compose(p, q, s);
        bucket(jx, jz, "spruce" + Math.floor(r() * SPRUCE_V), mtx.clone());
        bucket(jx, jz, "trunk", mtx.clone());
        addCollider(jx, jz, Math.max(0.3, W * 0.045));
        count++;
      } else if (kind === "snag") {
        const H = 7 + r() * 9;
        if (blocksView(jx, jz, y + H)) continue;
        q.setFromAxisAngle(up, rot);
        s.set(H, H, H);
        p.set(jx, y - 0.2, jz);
        mtx.compose(p, q, s);
        bucket(jx, jz, "snag", mtx.clone());
        addCollider(jx, jz, Math.max(0.25, H * 0.035));
        count++;
      } else if (kind === "willow") {
        const H = 1.6 + r() * 1.4;
        q.setFromAxisAngle(up, rot);
        s.set(H * 1.6, H, H * 1.6);
        p.set(jx, y - 0.1, jz);
        mtx.compose(p, q, s);
        bucket(jx, jz, "willow", mtx.clone());
      }
    }
  // rocks + deadfall, sparser, off trail
  for (let i = 0; i < 900; i++) {
    const x = BOUNDS.x0 + r() * (BOUNDS.x1 - BOUNDS.x0), z = BOUNDS.z0 + r() * (BOUNDS.z1 - BOUNDS.z0);
    if (trailDist(x, z) < 3 || roadDist(x, z) < 7 || clearing(x, z) > 0.3) continue;
    const kd = Math.hypot(x - PLACES.knob.x, z - PLACES.knob.z);
    const y = heightAt(x, z);
    if (r() < 0.55 || kd < 40) {
      const sc = 0.4 + r() * (kd < 40 ? 1.8 : 1.1);
      q.setFromAxisAngle(up, r() * 6.28);
      s.set(sc * (1 + r() * 0.6), sc, sc);
      p.set(x, y + sc * 0.1, z);
      mtx.compose(p, q, s);
      bucket(x, z, "rock", mtx.clone());
      if (sc > 0.7) addCollider(x, z, sc * 0.9);
    } else {
      const len = 4 + r() * 6;
      const a = r() * 6.28;
      q.setFromAxisAngle(up, a);
      s.set(len, 0.8 + r() * 0.6, 0.8 + r() * 0.6);
      p.set(x, y + 0.15, z);
      mtx.compose(p, q, s);
      bucket(x, z, "log", mtx.clone());
    }
  }
  const geos = { trunk: trunkGeo, snag: snagGeo, rock: rockGeo, willow: willowGeo, log: logGeo };
  spruceGeos.forEach((g, i) => (geos["spruce" + i] = g));
  const meshes = [];
  for (const c of chunks.values()) {
    const group = new THREE.Group();
    for (const [type, list] of Object.entries(c.items)) {
      const geo = geos[type];
      const mat = type.startsWith("spruce") ? foliageMat : woodMat;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((m, i) => im.setMatrixAt(i, m));
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      im.frustumCulled = true;
      group.add(im);
    }
    group.userData.cx = c.cx;
    group.userData.cz = c.cz;
    scene.add(group);
    meshes.push(group);
  }
  return {
    count,
    update(camX, camZ, far) {
      for (const g of meshes) g.visible = Math.hypot(g.userData.cx - camX, g.userData.cz - camZ) < far + CHUNK * 0.75;
    },
    materials: [foliageMat, woodMat],
  };
}
export { spruceGeometry, logGeometry, rockGeometry, paint, merge };
