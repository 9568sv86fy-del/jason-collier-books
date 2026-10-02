// PBR materials built from bundled CC0 textures (Poly Haven, see CREDITS.md).
import * as THREE from "three";
import { Q } from "./quality.js";

const loader = new THREE.TextureLoader();
const cache = new Map();
export function tex(name, srgb = false) {
  const key = name + srgb;
  if (cache.has(key)) return cache.get(key);
  const t = loader.load(`./assets/tex/${Q.texDir}/${name}.jpg`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = Q.high ? 8 : 4;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  cache.set(key, t);
  return t;
}

/** Terrain: snow / frozen dirt / rock splatted by a per-vertex `splat` attribute (x snow, y dirt, z rock)
 *  with two-scale snow to hide tiling, blended normal maps and roughness. uv is world xz / 4 m. */
export function terrainMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  m.map = tex("snow_col", true);
  m.normalMap = tex("snow_nrm");
  m.normalScale = new THREE.Vector2(0.9, 0.9);
  m.roughnessMap = tex("snow_rgh");
  const U = {
    tDirt: { value: tex("dirt_col", true) }, tDirtN: { value: tex("dirt_nrm") },
    tRock: { value: tex("rock_col", true) }, tRockN: { value: tex("rock_nrm") },
  };
  m.userData.uniforms = U;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 splat;\nvarying vec3 vSplat;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvSplat = splat;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
varying vec3 vSplat;
uniform sampler2D tDirt, tDirtN, tRock, tRockN;
vec3 wSplat() { vec3 s = max(vSplat, 0.0); return s / max(s.x + s.y + s.z, 1e-3); }`)
      .replace("#include <map_fragment>", `
vec3 sw = wSplat();
vec2 uvA = vMapUv;
vec3 snowA = texture2D(map, uvA).rgb;
vec3 snowB = texture2D(map, uvA * 0.173 + 0.31).rgb;
vec3 snowC = mix(snowA, snowB, 0.45) * vec3(1.22, 1.26, 1.32);
vec3 dirtC = texture2D(tDirt, uvA * 0.9).rgb; dirtC = mix(vec3(dot(dirtC, vec3(0.3, 0.59, 0.11))), dirtC, 0.55) * 0.8; // frozen: greyer, darker
vec3 rockC = texture2D(tRock, uvA * 0.6).rgb; rockC = mix(vec3(dot(rockC, vec3(0.3, 0.59, 0.11))), rockC, 0.35) * vec3(0.92, 0.96, 1.02);
vec3 albedo = snowC * sw.x + dirtC * sw.y + rockC * sw.z;
diffuseColor.rgb *= albedo;`)
      .replace("#include <roughnessmap_fragment>", `
float roughnessFactor = roughness;
float rS = texture2D(roughnessMap, vRoughnessMapUv).g;
roughnessFactor *= mix(0.62, 0.95, rS) * sw.x + 0.95 * sw.y + 0.85 * sw.z;`)
      .replace("#include <normal_fragment_maps>", `
vec3 nS = texture2D(normalMap, vNormalMapUv).xyz * 2.0 - 1.0;
vec3 nD = texture2D(tDirtN, vNormalMapUv * 0.9).xyz * 2.0 - 1.0;
vec3 nR = texture2D(tRockN, vNormalMapUv * 0.6).xyz * 2.0 - 1.0;
vec3 mapN = normalize(nS * vec3(0.7, 0.7, 1.0) * sw.x + nD * sw.y + nR * vec3(1.4, 1.4, 1.0) * sw.z);
mapN.xy *= normalScale;
normal = normalize( tbn * mapN );`);
  };
  return m;
}

/** bark with normal map, for trunks, logs, the wall and deadfall */
export function barkMaterial(extra = {}) {
  return new THREE.MeshStandardMaterial({ map: tex("bark_col", true), normalMap: tex("bark_nrm"), roughnessMap: tex("bark_rgh"), roughness: 1, metalness: 0, ...extra });
}
export function rockMaterial(extra = {}) {
  return new THREE.MeshStandardMaterial({ map: tex("rock_col", true), normalMap: tex("rock_nrm"), roughnessMap: tex("rock_rgh"), roughness: 1, metalness: 0, ...extra });
}
