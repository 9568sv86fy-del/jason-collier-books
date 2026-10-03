// Trees, snags, rocks, willows and deadfall. Instanced in chunks for culling.
// Every tree material shares an occlusion shader: anything between the camera and
// Harlan dissolves (dithered), so a trunk or bough never hides him.
import * as THREE from "three";
import { BOUNDS, PLACES, VIEWS, clearing, creekDist, heightAt, roadDist, trailDist } from "./terrain.js";
import { clamp, fbm, hash2, rng, smooth } from "./util.js";
import { Q } from "./quality.js";
import { tex } from "./materials.js";

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
          if (dc < 1.85) discard;
          if (dc < 4.4 && nz > smoothstep(1.85, 4.4, dc)) discard;
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
    tmp.convertSRGBToLinear(); // palettes are authored as display values
    c[i * 3] = tmp.r; c[i * 3 + 1] = tmp.g; c[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return geo;
}

/** a spruce, unit height (1), base at y=0. Separate drooping boughs (not cones): a snowy
 *  ridge on top, dark needles underneath, gaps between limbs so a close camera never
 *  fills the frame with one flat face. */
function spruceGeometry(seed, snowy = 0.55, detail = Q.tier) {
  const rnd = rng(seed);
  const hi = detail === "high", lo = detail === "low";
  const tiers = hi ? 7 : lo ? 5 : 6;
  const branches = hi ? 6 : 5;
  const segs = hi ? 3 : lo ? 2 : 3;
  const pos = [], nor = [], col = [];
  const ink = new THREE.Color();
  const emit = (a, b, c, nx, ny, nz) => {
    for (const p of [a, b, c]) {
      ink.setRGB(p[3], p[4], p[5]).convertSRGBToLinear();
      pos.push(p[0], p[1], p[2]);
      nor.push(nx, ny, nz);
      col.push(ink.r, ink.g, ink.b);
    }
  };
  const face = (a, b, c, up) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    if (ny * up < 0) emit(a, c, b, -nx, -ny, -nz);
    else emit(a, b, c, nx, ny, nz);
  };
  const mix = (g, s, k) => {
    const r = g[0] + (s[0] - g[0]) * k, gg = g[1] + (s[1] - g[1]) * k, b = g[2] + (s[2] - g[2]) * k;
    return [r, gg, b];
  };
  for (let k = 0; k < tiers; k++) {
    const t = k / Math.max(1, tiers - 1);
    const y0 = 0.14 + t * 0.8 + (rnd() - 0.5) * 0.01;
    const reach = (0.38 * Math.pow(1 - t * 0.9, 0.85) + 0.018) * (0.88 + rnd() * 0.22);
    const droop = 0.035 + 0.12 * (1 - t);
    const rot = rnd() * Math.PI * 2;
    const nb = branches + (rnd() < 0.4 ? 1 : 0);
    for (let b = 0; b < nb; b++) {
      const ang = rot + (b / nb) * Math.PI * 2 + (rnd() - 0.5) * 0.22;
      const len = reach * (0.78 + rnd() * 0.32);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const sx = -sa, sz = ca;
      const rings = [];
      for (let s = 0; s <= segs; s++) {
        const u = s / segs;
        const rr = len * Math.pow(Math.max(u, 0.02), 0.78);
        const y = y0 + 0.01 - droop * u * u;
        const hw = (0.05 * (1 - t * 0.35) + 0.01) * (1.05 - u * 0.86);
        const lift = hw * 0.62;
        const x = ca * rr, z = sa * rr;
        const n = hash2(Math.floor(x * 50 + seed + b), Math.floor(z * 50 + k * 3));
        const snowK = clamp(snowy * (1.05 - u * 0.62) * (0.55 + 0.45 * (1 - t)) + (n - 0.45) * 0.2, 0, 1);
        const shade = 0.42 + 0.58 * u;
        const needle = [0.045 * shade, (0.11 + n * 0.03) * shade, 0.055 * shade];
        const snow = [0.78 + n * 0.06, 0.82 + n * 0.04, 0.88 + n * 0.03];
        const dark = [needle[0] * 0.35, needle[1] * 0.4, needle[2] * 0.38];
        const rc = mix(needle, snow, snowK);
        const ec = mix(dark, snow, snowK * 0.22);
        rings.push({
          ridge: [x, y + lift, z, ...rc],
          left: [x + sx * hw, y - lift * 0.35, z + sz * hw, ...ec],
          right: [x - sx * hw, y - lift * 0.35, z - sz * hw, ...ec],
        });
      }
      for (let s = 0; s < segs; s++) {
        const A = rings[s], B = rings[s + 1];
        face(A.ridge, B.ridge, B.left, 1); face(A.ridge, B.left, A.left, 1);
        face(A.ridge, B.right, B.ridge, 1); face(A.ridge, A.right, B.right, 1);
        face(A.left, B.left, B.right, -1); face(A.left, B.right, A.right, -1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return geo;
}
function trunkGeometry() {
  const g = new THREE.CylinderGeometry(0.014, 0.042, 1, 8, 4, true);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) + 0.5;
    const flare = y < 0.12 ? 1 + (0.12 - y) * 2.2 : 1;
    p.setX(i, p.getX(i) * flare);
    p.setZ(i, p.getZ(i) * flare);
  }
  g.translate(0, 0.5, 0);
  g.computeVertexNormals();
  return paint(g, (x, y, z, nx, ny, nz, c) => c.setRGB(0.22, 0.15, 0.11));
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
  // rounded, lumpy boulder (subdivided, noise-displaced by position so shared corners never crack),
  // smooth normals, and a snow cap that feathers down the sides instead of a flat white facet
  const g = new THREE.IcosahedronGeometry(1, 2);
  const p = g.attributes.position, nr = g.attributes.normal;
  const d = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const k = 0.8 + 0.35 * fbm(d.x * 1.7 + seed, d.z * 1.7 + d.y * 1.3, 3);
    nr.setXYZ(i, d.x, d.y / 0.75, d.z);
    p.setXYZ(i, d.x * k, Math.max(-0.25, d.y * k * 0.62), d.z * k * 1.05);
  }
  for (let i = 0; i < nr.count; i++) { d.set(nr.getX(i), nr.getY(i), nr.getZ(i)).normalize(); nr.setXYZ(i, d.x, d.y, d.z); }
  return paint(g, (x, y, z, nx, ny, nz, c, i) => {
    const n = hash2(Math.floor(x * 9 + 40), Math.floor(z * 9 + 40));
    const snow = smooth(0.35, 0.7, ny + (n - 0.5) * 0.25);
    const rk = 0.33 + n * 0.08;
    c.setRGB(rk + (0.84 - rk) * snow, rk * 0.98 + (0.87 - rk * 0.98) * snow, rk * 0.95 + (0.92 - rk * 0.95) * snow);
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
function tuftGeometry(seed) {
  // dead grass and sedge poking through the snow: pale straw blades, darker at the base
  const r = rng(seed);
  const parts = [];
  for (let k = 0; k < 11; k++) {
    const h = 0.5 + r() * 0.6;
    const b = new THREE.CylinderGeometry(0.003, 0.012, h, 3, 2, true);
    b.translate(0, h / 2, 0);
    b.rotateZ((r() - 0.5) * 0.9);
    b.rotateY(r() * 6.28);
    b.translate((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25);
    parts.push(b);
  }
  return paint(merge(parts), (x, y, z, nx, ny, nz, c) => { const k = Math.min(1, y * 1.6); c.setRGB(0.32 + k * 0.4, 0.26 + k * 0.33, 0.16 + k * 0.2); });
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
// spruce crowns as cones, for keeping the follow camera out of the boughs
const crowns = new Map(); // cell key -> [{x, z, y0, h, r}]
const CRC = 8;
function addCrown(x, z, y0, h, r) {
  const k = `${Math.floor(x / CRC)},${Math.floor(z / CRC)}`;
  let a = crowns.get(k);
  if (!a) crowns.set(k, (a = []));
  a.push({ x, z, y0, h, r });
}
/** how deep a point sits inside a crown or trunk (m); 0 when clear */
export function crownDepth(x, y, z, pad = 0.35) {
  const cx = Math.floor(x / CRC), cz = Math.floor(z / CRC);
  let worst = 0;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const a = crowns.get(`${cx + i},${cz + j}`);
      if (!a) continue;
      for (const c of a) {
        const f = (y - c.y0) / c.h;
        if (f > 1) continue;
        const rr = (f < 0 ? 0.35 : c.r * (1 - f) + 0.35) + pad;
        const d = Math.hypot(x - c.x, z - c.z);
        if (d < rr) worst = Math.max(worst, rr - d);
      }
    }
  return worst;
}
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
  // faceted shading reads crisper on snow-loaded boughs than smooth normals (tried both, 08:40)
  const foliageMat = occlude(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  const woodMat = occlude(new THREE.MeshLambertMaterial({ vertexColors: true }));
  // bark on spruce trunks (CC0 Poly Haven bark, tiled up the trunk); low tier stays flat colour
  let barkMat = woodMat;
  if (Q.tier !== "low") {
    const bc = tex("bark_col", true).clone(), bn = tex("bark_nrm").clone();
    for (const t of [bc, bn]) t.repeat.set(1, 10); // clones share the Source, which updates when the jpg arrives
    barkMat = occlude(new THREE.MeshLambertMaterial({ vertexColors: true, map: bc, normalMap: bn }));
    barkMat.color.setScalar(2.4); // the trunk's vertex colour is authored as the final tone; the map is ~0.4
  }
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
        addCrown(jx, jz, y + H * 0.05, H * 0.98, W * 0.55);
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
  // undergrowth: snowed-under spruce saplings along the timber edges, dead grass tufts in the open
  const UNDER = Q.tier === "high" ? 5200 : Q.tier === "medium" ? 2600 : 700;
  for (let i = 0; i < UNDER; i++) {
    const x = BOUNDS.x0 + r() * (BOUNDS.x1 - BOUNDS.x0), z = BOUNDS.z0 + r() * (BOUNDS.z1 - BOUNDS.z0);
    if (trailDist(x, z) < 1.6 || roadDist(x, z) < 5 || Math.hypot(x - PLACES.camp.x, z - PLACES.camp.z) < 9) continue;
    const { kind } = densityAt(x, z);
    const y = heightAt(x, z);
    q.setFromAxisAngle(up, r() * 6.28);
    if (kind === "spruce" && r() < 0.5) {
      const H = 0.7 + r() * 1.6;
      s.set(H * 0.7, H, H * 0.7); p.set(x, y - 0.15, z);
      mtx.compose(p, q, s); bucket(x, z, "sapling", mtx.clone());
    } else if (kind !== "spruce" || r() < 0.25) {
      const H = 0.5 + r() * 0.7;
      s.set(H, H, H); p.set(x, y - 0.12, z);
      mtx.compose(p, q, s); bucket(x, z, "tuft" + (i % 2), mtx.clone());
    }
  }
  const geos = { trunk: trunkGeo, snag: snagGeo, rock: rockGeo, willow: willowGeo, log: logGeo, sapling: spruceGeometry(901, 0.75), tuft0: tuftGeometry(5), tuft1: tuftGeometry(9) };
  spruceGeos.forEach((g, i) => (geos["spruce" + i] = g));
  // distance LOD: beyond LOD_D a chunk's spruce swap to the 6-whorl version (same silhouette, ~1/5 the verts)
  const LOD_D = 34; // metres from the camera to the chunk's nearest edge
  const spruceLo = Q.tier === "low" ? null : spruceGeos.map((_, i) => spruceGeometry(11 + i * 17, 0.55, "low"));
  const meshes = [];
  for (const c of chunks.values()) {
    const group = new THREE.Group();
    for (const [type, list] of Object.entries(c.items)) {
      const geo = geos[type];
      const mat = type.startsWith("spruce") || type === "sapling" ? foliageMat : type === "trunk" ? barkMat : woodMat;
      const mk = (g) => {
        const im = new THREE.InstancedMesh(g, mat, list.length);
        list.forEach((m, i) => im.setMatrixAt(i, m));
        im.instanceMatrix.needsUpdate = true;
        im.computeBoundingSphere();
        im.frustumCulled = true;
        im.castShadow = !type.startsWith("tuft");
        group.add(im);
        return im;
      };
      const im = mk(geo);
      if (spruceLo && type.startsWith("spruce")) {
        const lo = mk(spruceLo[+type.slice(6)]);
        lo.visible = false;
        (group.userData.lod ||= []).push([im, lo]);
      }
    }
    group.userData.cx = c.cx;
    group.userData.cz = c.cz;
    scene.add(group);
    meshes.push(group);
  }
  return {
    count,
    update(camX, camZ, far) {
      for (const g of meshes) {
        const d = Math.hypot(g.userData.cx - camX, g.userData.cz - camZ);
        g.visible = d < far + CHUNK * 0.75;
        if (g.visible && g.userData.lod) { const ex = Math.max(0, Math.abs(g.userData.cx - camX) - CHUNK / 2), ez = Math.max(0, Math.abs(g.userData.cz - camZ) - CHUNK / 2); const near = Math.hypot(ex, ez) < LOD_D; for (const [h, l] of g.userData.lod) { h.visible = near; l.visible = !near; } }
      }
    },
    materials: [foliageMat, woodMat, barkMat],
  };
}
export { spruceGeometry, logGeometry, rockGeometry, paint, merge };
