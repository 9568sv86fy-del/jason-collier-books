// Sky dome, stars, moon, and two rings of distant ridges that take the light.
import * as THREE from "three";
import { rng } from "./util.js";

export function buildSky(scene) {
  const uniforms = {
    top: { value: new THREE.Color() },
    horizon: { value: new THREE.Color() },
    glow: { value: new THREE.Color() },
    glowAmt: { value: 0 },
    sunDir: { value: new THREE.Vector3(0, 0.2, -1) },
    fogCol: { value: new THREE.Color() },
    fogAmt: { value: 0 },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1400, 32, 16),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 glow; uniform float glowAmt; uniform vec3 sunDir; uniform vec3 fogCol; uniform float fogAmt;
        varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 c = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55));
          float s = max(dot(normalize(vec3(vDir.x, 0.0, vDir.z)), normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0);
          float band = exp(-max(h, 0.0) * 7.0);
          c += glow * glowAmt * band * (0.35 + 0.65 * pow(s, 3.0));
          c = mix(c, fogCol, fogAmt * exp(-max(h, 0.0) * 5.0));
          if (h < 0.0) c = mix(c, fogCol, clamp(-h * 6.0, 0.0, 1.0));
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  dome.renderOrder = -10;
  scene.add(dome);

  // stars
  const r = rng(5);
  const N = 900;
  const sp = new Float32Array(N * 3), ss = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = r(), v = 0.06 + r() * 0.94;
    const a = u * Math.PI * 2, y = v;
    const k = Math.sqrt(1 - y * y);
    sp.set([Math.cos(a) * k * 1300, y * 1300, Math.sin(a) * k * 1300], i * 3);
    ss[i] = 0.4 + r() ** 3 * 2.2;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  sg.setAttribute("size", new THREE.BufferAttribute(ss, 1));
  const starU = { alpha: { value: 0 }, px: { value: 1 }, time: { value: 0 } };
  const stars = new THREE.Points(
    sg,
    new THREE.ShaderMaterial({
      uniforms: starU,
      transparent: true,
      depthWrite: false,
      fog: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute float size; uniform float px; uniform float time; varying float vTw;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * px; vTw = 0.7 + 0.3 * sin(time * 2.0 + position.x * 0.13 + position.z * 0.07); }`,
      fragmentShader: `uniform float alpha; varying float vTw; void main(){ vec2 d = gl_PointCoord - 0.5; float k = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vec3(0.85,0.9,1.0), k * alpha * vTw); }`,
    }),
  );
  stars.renderOrder = -9;
  scene.add(stars);

  // moon: a disc sprite with a soft halo
  const mc = document.createElement("canvas");
  mc.width = mc.height = 128;
  const g = mc.getContext("2d");
  const halo = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  halo.addColorStop(0, "rgba(230,236,255,1)");
  halo.addColorStop(0.22, "rgba(220,228,250,0.95)");
  halo.addColorStop(0.26, "rgba(170,190,230,0.25)");
  halo.addColorStop(1, "rgba(120,140,200,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "rgba(150,160,180,0.35)";
  for (const [x, y, rr] of [[58, 58, 4], [70, 66, 3], [62, 72, 2.5]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(mc), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
  moon.scale.set(160, 160, 1);
  moon.renderOrder = -8;
  scene.add(moon);

  // distant ridges: jagged rings, coloured each frame
  const ridge = (radius, base, amp, seed, segs) => {
    const rr = rng(seed);
    const pos = [], idx = [];
    const peaks = [];
    for (let i = 0; i <= segs; i++) peaks.push(rr());
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const n = (peaks[i % segs] * 0.6 + Math.sin(a * 3 + seed) * 0.25 + Math.sin(a * 7.3 + seed * 2) * 0.15) * amp;
      // the north (−z) range is higher: the mountain the hunt climbs
      const north = Math.max(0, -Math.sin(a)) * amp * 0.9;
      const x = Math.cos(a) * radius, z = Math.sin(a) * radius;
      pos.push(x, base - 120, z, x, base + n + north, z);
      if (i < segs) {
        const k = i * 2;
        idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    const mat = new THREE.MeshBasicMaterial({ color: 0x445566, fog: false, side: THREE.DoubleSide, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = -7;
    return m;
  };
  const far = ridge(1150, 60, 190, 3, 140);
  const near = ridge(950, 30, 120, 8, 110);
  near.renderOrder = -6;
  scene.add(far, near);
  // snowcaps: lighter rim on the far range
  return {
    dome, stars, moon, far, near, uniforms, starU,
    follow(cam) {
      dome.position.copy(cam.position);
      stars.position.copy(cam.position);
      far.position.set(cam.position.x, 0, cam.position.z);
      near.position.set(cam.position.x, 0, cam.position.z);
    },
  };
}
