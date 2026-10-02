// The mountain: places, trails, height field and the ground mesh.
import * as THREE from "three";
import { terrainMaterial } from "./materials.js";
import { clamp, distToSeg, fbm, hash2, lerp, rng, smooth } from "./util.js";

/** Named places (meters). y comes from the height field. */
export const PLACES = {
  truck: { name: "The truck", short: "TRUCK", x: 0, z: 0, r: 16, blurb: "Forest road. The way home." },
  spur: { name: "The spur", short: "SPUR", x: -8, z: -88, r: 14, blurb: "Where the trail splits." },
  camp: { name: "Camp", short: "CAMP", x: 72, z: -122, r: 13, blurb: "A spruce knoll, sheltered from the north." },
  knob: { name: "The knob", short: "KNOB", x: 96, z: -214, r: 15, blurb: "Bare rock. You can see the whole park from here." },
  burn: { name: "The burn", short: "BURN", x: -92, z: -178, r: 18, blurb: "Old fire. Grey snags and open snow." },
  creek: { name: "The creek", short: "CREEK", x: -122, z: -276, r: 15, blurb: "Willows, a seep, open water steaming." },
  timber: { name: "The timber", short: "TIMBER", x: -24, z: -300, r: 16, blurb: "Black old growth. Where he beds." },
  saddle: { name: "The saddle", short: "SADDLE", x: 92, z: -330, r: 15, blurb: "High saddle. Looks down on the meadow." },
  meadow: { name: "The meadow", short: "MEADOW", x: -8, z: -420, r: 30, blurb: "The high park. Elk sign everywhere." },
};
export const PLACE_IDS = Object.keys(PLACES);
export const OVERLOOKS = ["knob", "saddle"];
/** where each overlook can see (for glassing) */
export const VIEWS = { knob: ["burn", "timber", "meadow", "camp", "spur"], saddle: ["meadow", "timber", "creek"] };

export const EDGES = [
  ["truck", "spur"],
  ["spur", "camp"],
  ["camp", "knob"],
  ["spur", "burn"],
  ["burn", "creek"],
  ["burn", "timber"],
  ["creek", "timber"],
  ["timber", "meadow"],
  ["knob", "saddle"],
  ["saddle", "meadow"],
  ["creek", "meadow"],
];

export const BOUNDS = { x0: -230, x1: 230, z0: -540, z1: 60 };

// --- trails as wobbly polylines -------------------------------------------------
export const TRAILS = EDGES.map(([a, b], i) => {
  const A = PLACES[a], B = PLACES[b];
  const r = rng(101 + i * 7);
  const n = 9;
  const pts = [];
  const dx = B.x - A.x, dz = B.z - A.z;
  const len = Math.hypot(dx, dz);
  const nx = -dz / len, nz = dx / len;
  const amp = Math.min(14, len * 0.08);
  const ph = r() * 6.28, f2 = 1 + Math.floor(r() * 2);
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const wob = Math.sin(t * Math.PI) * (Math.sin(t * Math.PI * f2 + ph) * amp);
    pts.push({ x: A.x + dx * t + nx * wob, z: A.z + dz * t + nz * wob });
  }
  return { a, b, pts, len };
});
const SEGS = [];
for (const tr of TRAILS) for (let k = 0; k < tr.pts.length - 1; k++) SEGS.push([tr.pts[k], tr.pts[k + 1], tr]);

// forest road along the bottom
const ROAD = [{ x: -260, z: 8 }, { x: -80, z: 10 }, { x: 0, z: 6 }, { x: 90, z: 2 }, { x: 260, z: 6 }];

function rawTrailDist(x, z) {
  let best = 1e9;
  for (const [p, q] of SEGS) {
    const { d } = distToSeg(x, z, p.x, p.z, q.x, q.z);
    if (d < best) best = d;
  }
  return best;
}
function rawRoadDist(x, z) {
  let best = 1e9;
  for (let k = 0; k < ROAD.length - 1; k++) {
    const { d } = distToSeg(x, z, ROAD[k].x, ROAD[k].z, ROAD[k + 1].x, ROAD[k + 1].z);
    if (d < best) best = d;
  }
  return best;
}

// precomputed trail-distance grid (2 m cells) so per-frame queries are cheap
const GC = 2;
const GW = Math.ceil((BOUNDS.x1 - BOUNDS.x0) / GC) + 1;
const GH = Math.ceil((BOUNDS.z1 - BOUNDS.z0) / GC) + 1;
const trailGrid = new Float32Array(GW * GH);
const roadGrid = new Float32Array(GW * GH);
for (let j = 0; j < GH; j++)
  for (let i = 0; i < GW; i++) {
    const x = BOUNDS.x0 + i * GC, z = BOUNDS.z0 + j * GC;
    trailGrid[j * GW + i] = Math.min(rawTrailDist(x, z), 60);
    roadGrid[j * GW + i] = Math.min(rawRoadDist(x, z), 60);
  }
function sampleGrid(g, x, z) {
  const fx = clamp((x - BOUNDS.x0) / GC, 0, GW - 1.001), fz = clamp((z - BOUNDS.z0) / GC, 0, GH - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const a = g[j * GW + i], b = g[j * GW + i + 1], c = g[(j + 1) * GW + i], d = g[(j + 1) * GW + i + 1];
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export const trailDist = (x, z) => sampleGrid(trailGrid, x, z);
export const roadDist = (x, z) => sampleGrid(roadGrid, x, z);

const gauss = (x, z, cx, cz, r) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));

/** creek channel polyline */
export const CREEK = [{ x: -200, z: -150 }, { x: -150, z: -215 }, { x: -128, z: -262 }, { x: -118, z: -300 }, { x: -96, z: -360 }, { x: -60, z: -405 }];
export function creekDist(x, z) {
  let best = 1e9;
  for (let k = 0; k < CREEK.length - 1; k++) {
    const { d } = distToSeg(x, z, CREEK[k].x, CREEK[k].z, CREEK[k + 1].x, CREEK[k + 1].z);
    if (d < best) best = d;
  }
  return best;
}

export function heightAt(x, z) {
  let h = Math.max(0, -z) * 0.105;
  h += fbm(x / 70 + 3.1, z / 70 - 1.7, 4) * 7;
  const tr = trailDist(x, z);
  const rough = smooth(2, 7, tr);
  h += fbm(x / 13, z / 13, 3) * 1.4 * rough;
  h += gauss(x, z, PLACES.knob.x, PLACES.knob.z, 34) * 17;
  h += gauss(x, z, PLACES.knob.x + 40, PLACES.knob.z - 20, 40) * 8;
  h += gauss(x, z, PLACES.saddle.x + 35, PLACES.saddle.z, 40) * 18;
  h += gauss(x, z, PLACES.saddle.x - 10, PLACES.saddle.z - 40, 34) * 10;
  h += gauss(x, z, PLACES.camp.x, PLACES.camp.z, 16) * 4;
  h += gauss(x, z, PLACES.burn.x, PLACES.burn.z, 40) * 3;
  // creek drainage
  const cd = creekDist(x, z);
  h -= (1 - smooth(4, 26, cd)) * 7;
  // meadow: an open bowl
  const md = Math.hypot(x - PLACES.meadow.x, (z - PLACES.meadow.z) * 0.8);
  const mBlend = 1 - smooth(30, 70, md);
  h = lerp(h, 44 - 1.5 * (1 - md / 70), mBlend * 0.85);
  // walls of the basin
  const ax = Math.abs(x);
  if (ax > 150) h += Math.pow(ax - 150, 1.35) * 0.35;
  if (z < -470) h += Math.pow(-470 - z, 1.3) * 0.5;
  if (z > 12) h -= (z - 12) * 0.3;
  // road bed
  const rd = roadDist(x, z);
  h = lerp(h, Math.max(0, -z) * 0.105 + fbm(x / 70 + 3.1, z / 70 - 1.7, 4) * 7 * 0.3, 1 - smooth(3, 9, rd));
  return h;
}
export function normalAt(x, z) {
  const e = 0.8;
  const hx = heightAt(x + e, z) - heightAt(x - e, z);
  const hz = heightAt(x, z + e) - heightAt(x, z - e);
  const n = new THREE.Vector3(-hx, 2 * e, -hz);
  return n.normalize();
}
export function placeAt(x, z, pad = 0) {
  for (const id of PLACE_IDS) {
    const p = PLACES[id];
    if (Math.hypot(x - p.x, z - p.z) < p.r + pad) return id;
  }
  return null;
}
export function nearestPlace(x, z) {
  let best = null, bd = 1e9;
  for (const id of PLACE_IDS) {
    const p = PLACES[id];
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < bd) { bd = d; best = id; }
  }
  return { id: best, d: bd };
}
/** clearings where trees must not grow */
export function clearing(x, z) {
  let c = 0;
  for (const id of PLACE_IDS) {
    const p = PLACES[id];
    const r = id === "meadow" ? 58 : id === "burn" ? 0 : id === "knob" ? 26 : id === "camp" ? 9 : p.r * 0.9;
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < r) c = Math.max(c, 1 - d / r);
  }
  return c;
}

/** BFS route between places over the trail graph; returns place ids */
export function route(from, to) {
  if (from === to) return [from];
  const prev = { [from]: null };
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    for (const [a, b] of EDGES) {
      const nb = a === cur ? b : b === cur ? a : null;
      if (nb && !(nb in prev)) {
        prev[nb] = cur;
        if (nb === to) {
          const path = [to];
          let p = cur;
          while (p) { path.unshift(p); p = prev[p]; }
          return path;
        }
        q.push(nb);
      }
    }
  }
  return [from, to];
}
export function trailBetween(a, b) {
  const t = TRAILS.find((tr) => (tr.a === a && tr.b === b) || (tr.a === b && tr.b === a));
  if (!t) return null;
  return t.a === a ? t.pts : [...t.pts].reverse();
}

// --- ground mesh -------------------------------------------------------------------
export function buildGround() {
  const group = new THREE.Group();
  const TILE = 4; // tiles per axis -> frustum culling per tile
  const W = BOUNDS.x1 - BOUNDS.x0 + 40, H = BOUNDS.z1 - BOUNDS.z0 + 40;
  const x0 = BOUNDS.x0 - 20, z0 = BOUNDS.z0 - 20;
  const res = 2.5;
  const tw = W / TILE, th = H / TILE;
  const mat = terrainMaterial();
  const col = new THREE.Color();
  for (let ty = 0; ty < TILE; ty++)
    for (let tx = 0; tx < TILE; tx++) {
      const sx = Math.round(tw / res), sz = Math.round(th / res);
      const geo = new THREE.PlaneGeometry(tw, th, sx, sz);
      geo.rotateX(-Math.PI / 2);
      const cx = x0 + tw * (tx + 0.5), cz = z0 + th * (ty + 0.5);
      geo.translate(cx, 0, cz);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const splat = new Float32Array(pos.count * 3);
      const uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const y = heightAt(x, z);
        pos.setY(i, y);
        uv.setXY(i, x / 4, -z / 4);
        groundColor(x, z, y, col);
        // the old palette becomes a gentle tint over the textures (snow ~ 1.0)
        colors[i * 3] = clamp(col.r / 0.88, 0.5, 1.08); colors[i * 3 + 1] = clamp(col.g / 0.9, 0.5, 1.08); colors[i * 3 + 2] = clamp(col.b / 0.94, 0.5, 1.08);
        const d = groundDirt(x, z);
        splat[i * 3] = 1 - d; splat[i * 3 + 1] = d; splat[i * 3 + 2] = 0;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();
      // steep faces: rock shows through the snow
      const nrm = geo.attributes.normal;
      for (let i = 0; i < pos.count; i++) {
        const ny = nrm.getY(i);
        const rock = (1 - smooth(0.62, 0.82, ny)) * 0.85;
        if (rock > 0) {
          splat[i * 3] *= 1 - rock; splat[i * 3 + 1] *= 1 - rock; splat[i * 3 + 2] = rock;
          colors[i * 3] = lerp(colors[i * 3], 1, rock); colors[i * 3 + 1] = lerp(colors[i * 3 + 1], 1, rock); colors[i * 3 + 2] = lerp(colors[i * 3 + 2], 1, rock);
        }
      }
      geo.setAttribute("splat", new THREE.BufferAttribute(splat, 3));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  return group;
}

/** how much frozen dirt / trodden ground shows through the snow, 0..1 */
function groundDirt(x, z) {
  let d = 0;
  const tr = trailDist(x, z);
  const t = 1 - smooth(0.5, 2.2, tr);
  if (t > 0) d = Math.max(d, t * clamp(0.35 + fbm(x / 2.2, z / 2.2, 2) * 0.9, 0, 0.85));
  const rd = roadDist(x, z);
  const rt = 1 - smooth(2.5, 5, rd);
  if (rt > 0) d = Math.max(d, rt * (Math.abs(Math.sin(rd * 1.6)) < 0.3 ? 0.9 : 0.45));
  const md = Math.hypot(x - PLACES.meadow.x, z - PLACES.meadow.z);
  if (md < 75) d = Math.max(d, clamp((fbm(x / 4, z / 4, 3) + 0.1) * 1.6, 0, 0.75) * (1 - smooth(40, 75, md)));
  const bd = Math.hypot(x - PLACES.burn.x, z - PLACES.burn.z);
  if (bd < 70) d = Math.max(d, clamp((fbm(x / 5 + 4, z / 5, 3) + 0.05) * 1.2, 0, 0.38) * (1 - smooth(30, 70, bd)));
  const cd = Math.hypot(x - PLACES.camp.x, z - PLACES.camp.z);
  if (cd < 9) d = Math.max(d, (1 - smooth(2, 9, cd)) * 0.7);
  return d;
}

function groundColor(x, z, y, out) {
  // fresh snow, faintly blue in the hollows
  const n = fbm(x / 6, z / 6, 2);
  const big = fbm(x / 35 + 9, z / 35, 3);
  let r = 0.86 + n * 0.03, g = 0.89 + n * 0.03, b = 0.94 + n * 0.02;
  r -= big * 0.03; g -= big * 0.02;
  // trails: packed, trodden, a little dirt
  const tr = trailDist(x, z);
  const t = 1 - smooth(0.6, 2.4, tr);
  if (t > 0) {
    const dirt = clamp(0.5 + fbm(x / 2.2, z / 2.2, 2) * 0.8, 0, 1) * (1 - smooth(0.2, 1.3, tr));
    r = lerp(r, 0.72 - dirt * 0.2, t); g = lerp(g, 0.71 - dirt * 0.22, t); b = lerp(b, 0.72 - dirt * 0.26, t);
  }
  const rd = roadDist(x, z);
  const rt = 1 - smooth(2.5, 5, rd);
  if (rt > 0) {
    const rut = Math.abs(Math.sin(rd * 1.6)) < 0.25 ? 0.12 : 0;
    r = lerp(r, 0.66 - rut, rt); g = lerp(g, 0.64 - rut, rt); b = lerp(b, 0.63 - rut, rt);
  }
  // meadow grass through thin snow
  const md = Math.hypot(x - PLACES.meadow.x, z - PLACES.meadow.z);
  if (md < 75) {
    const grass = clamp((fbm(x / 4, z / 4, 3) + 0.15) * 2.2, 0, 1) * (1 - smooth(40, 75, md));
    r = lerp(r, 0.62, grass * 0.7); g = lerp(g, 0.56, grass * 0.7); b = lerp(b, 0.4, grass * 0.7);
  }
  // burn: ash and char
  const bd = Math.hypot(x - PLACES.burn.x, z - PLACES.burn.z);
  if (bd < 70) {
    const ash = clamp((fbm(x / 5 + 4, z / 5, 3) + 0.1) * 2, 0, 1) * (1 - smooth(30, 70, bd));
    r = lerp(r, 0.45, ash * 0.55); g = lerp(g, 0.44, ash * 0.55); b = lerp(b, 0.44, ash * 0.55);
  }
  // creek: dark wet stones near water
  const cd = creekDist(x, z);
  if (cd < 6) {
    const wet = 1 - smooth(1.5, 6, cd);
    r = lerp(r, 0.3, wet * 0.8); g = lerp(g, 0.32, wet * 0.8); b = lerp(b, 0.33, wet * 0.8);
  }
  // knob: wind-scoured rock
  const kd = Math.hypot(x - PLACES.knob.x, z - PLACES.knob.z);
  if (kd < 22) {
    const rock = clamp((fbm(x / 3, z / 3, 2) + 0.2) * 2, 0, 1) * (1 - smooth(10, 22, kd));
    r = lerp(r, 0.46, rock * 0.6); g = lerp(g, 0.45, rock * 0.6); b = lerp(b, 0.44, rock * 0.6);
  }
  out.setRGB(r, g, b);
  return out;
}

export function buildCreekWater() {
  // dark ribbon of open water following the channel
  const pts = [];
  for (let k = 0; k < CREEK.length - 1; k++) {
    for (let s = 0; s < 12; s++) {
      const t = s / 12;
      pts.push({ x: lerp(CREEK[k].x, CREEK[k + 1].x, t), z: lerp(CREEK[k].z, CREEK[k + 1].z, t) });
    }
  }
  pts.push(CREEK[CREEK.length - 1]);
  const pos = [];
  const idx = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    const dx = q.x - o.x, dz = q.z - o.z;
    const l = Math.hypot(dx, dz) || 1;
    const w = 1.1 + Math.sin(i * 0.7) * 0.35;
    const nx = (-dz / l) * w, nz = (dx / l) * w;
    const y = Math.min(heightAt(p.x + nx, p.z + nz), heightAt(p.x - nx, p.z - nz), heightAt(p.x, p.z)) + 0.12;
    pos.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz);
    if (i < pts.length - 1) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.MeshPhongMaterial({ color: 0x1b2328, specular: 0x8899aa, shininess: 60 });
  return new THREE.Mesh(geo, mat);
}
