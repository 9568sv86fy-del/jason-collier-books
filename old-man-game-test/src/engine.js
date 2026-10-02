// Renderer, scene graph, lighting, props and effects. No game rules in here.
import * as THREE from "three";
import { buildSky } from "./sky.js";
import { BOUNDS, CREEK, PLACES, PLACE_IDS, TRAILS, buildCreekWater, buildGround, heightAt, normalAt, trailDist } from "./terrain.js";
import { buildForest, collide, logGeometry, occlusion, occlude, paint, rockGeometry } from "./forest.js";
import { buildHarlan } from "./harlan.js";
import { buildElk, buildWalker } from "./creatures.js";
import { clamp, damp, dampAngle, hash2, lerp, rng, smooth, wrapPi } from "./util.js";

THREE.ColorManagement.enabled = false;

export const CAM_SPOTS = {
  saddle: { x: PLACES.saddle.x - 16, z: PLACES.saddle.z - 10, face: "meadow", label: "the saddle trail" },
  meadow: { x: PLACES.meadow.x + 22, z: PLACES.meadow.z + 20, face: "meadow", label: "the seep" },
  timber: { x: PLACES.timber.x + 10, z: PLACES.timber.z - 14, face: "timber", label: "the timber trail" },
};
export const CAMP_FIRE = { x: PLACES.camp.x + 1.5, z: PLACES.camp.z - 1.5 };

export function createEngine(canvas) {
  const lowEnd = /iPhone|iPad|Android/i.test(navigator.userAgent) || Math.min(screen.width, screen.height) < 500;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowEnd || devicePixelRatio < 2, powerPreference: "high-performance", preserveDrawingBuffer: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  let quality = 1;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x9aa4ae, 0.008);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1700);
  scene.add(camera);

  // lights
  const hemi = new THREE.HemisphereLight(0xdde6f0, 0x50555a, 1.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2e0, 1.6);
  scene.add(sun, sun.target);
  const lamp = new THREE.SpotLight(0xfff1d8, 0, 34, 0.42, 0.7, 1.3);
  const lampFill = new THREE.PointLight(0xffe2c0, 0, 7, 1.6);
  const fireLight = new THREE.PointLight(0xff8a3a, 0, 26, 1.25);
  scene.add(lamp, lamp.target, lampFill, fireLight);

  const sky = buildSky(scene);
  const ground = buildGround();
  scene.add(ground);
  scene.add(buildCreekWater());
  const forest = buildForest(scene);

  // ---------- props ----------
  const mat = (c, o) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...o });
  const snowM = mat(0xe4e9ef), woodM = mat(0x4d3524), darkWood = mat(0x2e2219), stoneM = mat(0x5b5955), redM = mat(0x6a1f18), canvasM = mat(0x7d7256), orange = mat(0xd9631e);
  const at = (x, z, dy = 0) => new THREE.Vector3(x, heightAt(x, z) + dy, z);
  const propColliders = [];

  // the truck: old pickup on the forest road, snow on the cab
  const truck = new THREE.Group();
  {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 5.0), redM);
    body.position.y = 0.95;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 1.7), redM);
    cab.position.set(0, 1.75, -0.6);
    const cabSnow = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.14, 1.75), snowM);
    cabSnow.position.set(0, 2.24, -0.6);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.05), mat(0x1a2026));
    glass.position.set(0, 1.85, -1.46);
    const bedSnow = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 2.0), snowM);
    bedSnow.position.set(0, 1.38, 1.4);
    truck.add(body, cab, cabSnow, glass, bedSnow);
    for (const [x, z] of [[-0.95, -1.6], [0.95, -1.6], [-0.95, 1.6], [0.95, 1.6]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10), mat(0x151515));
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.42, z);
      truck.add(w);
    }
    const p = at(PLACES.truck.x + 5, PLACES.truck.z + 4);
    truck.position.copy(p);
    truck.rotation.y = Math.PI / 2 - 0.08;
    scene.add(truck);
    forest_block(p.x, p.z, 3.2);
  }
  function forest_block(x, z, r) {
    propColliders.push({ x, z, r });
  }

  // signposts with carved names at every place
  const signTex = (text) => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#5a3d27"; g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(0,0,0,${0.08 + (i % 3) * 0.04})`; g.fillRect(0, i * 7 + 2, 256, 2); }
    g.fillStyle = "#e9dcc2"; g.font = "600 34px 'Barlow Condensed', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, 128, 34);
    const t = new THREE.CanvasTexture(c);
    return t;
  };
  const posts = {};
  for (const id of PLACE_IDS) {
    const P = PLACES[id];
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.2, 6), woodM);
    post.position.y = 1.1;
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.32, 0.05), [woodM, woodM, woodM, woodM, new THREE.MeshLambertMaterial({ map: signTex(P.short) }), new THREE.MeshLambertMaterial({ map: signTex(P.short) })]);
    board.position.y = 1.85;
    const blaze = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.1), orange);
    blaze.position.y = 2.25;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.12), snowM);
    cap.position.y = 2.04;
    // stone cairn at the foot
    const cairn = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 - k * 0.05, 0), stoneM);
      s.position.set((k % 2) * 0.08, 0.15 + k * 0.2, 0);
      cairn.add(s);
    }
    cairn.position.set(0.45, 0, 0.1);
    g.add(post, board, blaze, cap, cairn);
    // place it on the trail side, facing the incoming trail
    const tr = TRAILS.find((t) => t.a === id || t.b === id);
    let fx = 0, fz = 1;
    if (tr) {
      const pts = tr.a === id ? tr.pts : [...tr.pts].reverse();
      fx = pts[1].x - pts[0].x; fz = pts[1].z - pts[0].z;
      const l = Math.hypot(fx, fz); fx /= l; fz /= l;
    }
    const px = P.x + fx * 4 - fz * 2.6, pz = P.z + fz * 4 + fx * 2.6;
    g.position.copy(at(px, pz, -0.05));
    g.rotation.y = Math.atan2(fx, fz);
    scene.add(g);
    posts[id] = g;
  }
  // trail stakes with orange flagging every ~22 m so the way reads in fog and dark
  {
    const stakeGeo = new THREE.CylinderGeometry(0.035, 0.04, 1.3, 5);
    stakeGeo.translate(0, 0.65, 0);
    const tapeGeo = new THREE.PlaneGeometry(0.06, 0.32);
    tapeGeo.translate(0.03, 1.1, 0);
    const list = [];
    for (const tr of TRAILS) {
      let acc = 0;
      for (let k = 0; k < tr.pts.length - 1; k++) {
        const a = tr.pts[k], b = tr.pts[k + 1];
        const L = Math.hypot(b.x - a.x, b.z - a.z);
        for (let s = 0; s < L; s += 2) {
          acc += 2;
          if (acc > 22) {
            acc = 0;
            const t = s / L;
            const x = lerp(a.x, b.x, t), z = lerp(a.z, b.z, t);
            const side = hash2(Math.floor(x), Math.floor(z)) > 0.5 ? 1 : -1;
            const nx = -(b.z - a.z) / L, nz = (b.x - a.x) / L;
            list.push([x + nx * 2.1 * side, z + nz * 2.1 * side]);
          }
        }
      }
    }
    const stakes = new THREE.InstancedMesh(stakeGeo, woodM, list.length);
    const tapeMat = new THREE.MeshLambertMaterial({ color: 0xff6a1a, emissive: 0x3a1000, side: THREE.DoubleSide });
    const tapes = new THREE.InstancedMesh(tapeGeo, tapeMat, list.length);
    const m4 = new THREE.Matrix4();
    list.forEach(([x, z], i) => {
      m4.makeRotationY(hash2(i, 3) * 6.28);
      m4.setPosition(x, heightAt(x, z) - 0.05, z);
      stakes.setMatrixAt(i, m4);
      tapes.setMatrixAt(i, m4);
    });
    scene.add(stakes, tapes);
    var trailTapes = tapes;
  }

  // camp: tent, fire ring, log wall slots, a stump
  const camp = new THREE.Group();
  const fireP = at(CAMP_FIRE.x, CAMP_FIRE.z);
  {
    const tent = new THREE.Group();
    const tg = new THREE.CylinderGeometry(1.25, 1.25, 2.4, 3, 1);
    const t = new THREE.Mesh(tg, canvasM);
    t.rotation.z = Math.PI / 2;
    t.rotation.x = Math.PI / 2;
    t.position.y = 0.62;
    const ts = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 2.5), snowM);
    ts.position.y = 1.86;
    tent.add(t, ts);
    tent.position.copy(at(PLACES.camp.x - 3.5, PLACES.camp.z + 2.2));
    tent.rotation.y = 0.5;
    scene.add(tent);
    propColliders.push({ x: tent.position.x, z: tent.position.z, r: 1.4 });
    // ring of stones
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), stoneM);
      s.position.set(fireP.x + Math.cos(a) * 0.62, fireP.y + 0.08, fireP.z + Math.sin(a) * 0.62);
      s.scale.y = 0.7;
      scene.add(s);
    }
  }
  // fire: logs + additive flame cones + embers, all toggled together
  const fire = new THREE.Group();
  fire.position.copy(fireP);
  scene.add(fire);
  const fireLogs = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.9, 6), darkWood);
    l.rotation.z = Math.PI / 2 - 0.35;
    l.rotation.y = (i / 4) * Math.PI;
    l.position.y = 0.16;
    fireLogs.add(l);
  }
  fire.add(fireLogs);
  const flameMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: 0 }, k: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide,
    vertexShader: `uniform float t; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; float w = sin(t*7.0 + p.y*6.0 + position.x*9.0)*0.06*p.y; p.x += w; p.z += cos(t*5.0+p.y*5.0)*0.05*p.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
    fragmentShader: `uniform float t; uniform float k; varying vec2 vUv; void main(){ float y = vUv.y; vec3 c = mix(vec3(1.0,0.85,0.4), vec3(0.9,0.25,0.05), y); float a = (1.0 - y) * (0.55 + 0.45*sin(t*13.0 + vUv.x*20.0)) * k; gl_FragColor = vec4(c * a, a); }`,
  });
  const flames = [];
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.28 - i * 0.04, 0.9 + i * 0.15, 8, 4, true), flameMat);
    f.position.set((i - 1.5) * 0.08, 0.5 + i * 0.05, (i % 2) * 0.06);
    f.rotation.y = i;
    fire.add(f);
    flames.push(f);
  }
  const emberGeo = new THREE.BufferGeometry();
  const EM = 60;
  const emberPos = new Float32Array(EM * 3), emberLife = new Float32Array(EM);
  emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(emberGeo, new THREE.PointsMaterial({ color: 0xffa040, size: 0.07, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  fire.add(embers);
  for (let i = 0; i < EM; i++) emberLife[i] = Math.random();

  // log wall: four segments in an arc on the open (south) front of the knoll
  const wallSegs = [];
  {
    const lg = logGeometry();
    const lm = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    for (let i = 0; i < 4; i++) {
      const a = -0.95 + i * 0.63;
      const r = 6.2;
      const cx = PLACES.camp.x + Math.sin(a) * r, cz = PLACES.camp.z + Math.cos(a) * r;
      const seg = new THREE.Group();
      for (let k = 0; k < 3; k++) {
        const l = new THREE.Mesh(lg, lm);
        l.scale.set(3.6, 0.95, 0.95);
        l.position.y = 0.22 + k * 0.4;
        l.rotation.y = (k % 2) * 0.06;
        seg.add(l);
      }
      seg.position.copy(at(cx, cz, -0.05));
      seg.rotation.y = a + Math.PI / 2;
      seg.visible = false;
      scene.add(seg);
      wallSegs.push({ g: seg, x: cx, z: cz, a });
    }
  }
  // deadfall trap (book: a half-cut dead spruce wedged high, dropped by a cord)
  const deadfall = new THREE.Group();
  {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 9, 7), mat(0x3d3127));
    trunk.position.y = 4.5;
    deadfall.add(trunk);
    deadfall.position.copy(at(PLACES.camp.x + 4.5, PLACES.camp.z + 9));
    deadfall.rotation.z = -0.5;
    deadfall.visible = false;
    scene.add(deadfall);
  }
  // trail cameras
  const camMeshes = {};
  for (const [id, s] of Object.entries(CAM_SPOTS)) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4, 7), mat(0x3a2a1e));
    trunk.position.y = 2;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.1), mat(0x3b4030));
    box.position.set(0, 1.1, -0.26);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.015, 4, 12), mat(0x111111));
    strap.rotation.x = Math.PI / 2;
    strap.position.y = 1.1;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 5, 4), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
    led.position.set(0.05, 1.17, -0.32);
    box.userData.led = led;
    g.add(trunk, box, strap, led);
    g.position.copy(at(s.x, s.z, -0.1));
    const F = PLACES[s.face];
    g.rotation.y = Math.atan2(-(F.x - s.x), -(F.z - s.z));
    scene.add(g);
    propColliders.push({ x: s.x, z: s.z, r: 0.45 });
    camMeshes[id] = { g, box, strap, led };
    box.visible = strap.visible = led.visible = false;
  }

  // firewood pickups
  const stickGeo = (() => {
    const g = new THREE.CylinderGeometry(0.05, 0.065, 1.3, 5);
    g.rotateZ(Math.PI / 2);
    const b = new THREE.CylinderGeometry(0.025, 0.03, 0.45, 4);
    b.rotateZ(0.9);
    b.translate(0.2, 0.12, 0);
    const out = new THREE.BufferGeometry();
    const a1 = g.index ? g.toNonIndexed() : g, a2 = b.index ? b.toNonIndexed() : b;
    const pos = new Float32Array([...a1.attributes.position.array, ...a2.attributes.position.array]);
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    out.computeVertexNormals();
    return out;
  })();
  const stickMat = new THREE.MeshLambertMaterial({ color: 0x6a4a30, emissive: 0x140800 });
  const sticks = new Map(); // id -> mesh
  const glintTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,220,170,0.9)");
    gr.addColorStop(1, "rgba(255,200,140,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  })();
  function setSticks(list, glint) {
    for (const [id, m] of sticks) if (!list.find((s) => s.id === id)) { scene.remove(m); sticks.delete(id); }
    for (const s of list) {
      if (sticks.has(s.id)) continue;
      const g = new THREE.Group();
      const m = new THREE.Mesh(stickGeo, stickMat);
      m.rotation.y = hash2(s.id, 1) * 6.28;
      g.add(m);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.0 }));
      sp.scale.set(1.2, 1.2, 1);
      sp.position.y = 0.3;
      g.add(sp);
      g.userData.glint = sp;
      g.position.copy(at(s.x, s.z, 0.05));
      scene.add(g);
      sticks.set(s.id, g);
    }
    for (const g of sticks.values()) g.userData.glint.material.opacity = glint ? 0.55 : 0;
  }

  // ---------- creatures ----------
  const harlan = buildHarlan();
  scene.add(harlan.root);
  lamp.position.set(0, 0, 0);
  const bull = buildElk({ bull: true });
  bull.root.visible = false;
  scene.add(bull.root);
  const cows = [0, 1, 2].map(() => {
    const c = buildElk({ bull: false });
    c.root.scale.setScalar(0.88);
    c.root.visible = false;
    scene.add(c.root);
    return c;
  });
  const walker = buildWalker();
  walker.root.visible = false;
  scene.add(walker.root);

  // ---------- tracks (Harlan's prints, elk line, walker's parallel line) ----------
  function trackLayer(n, w, l, color, opacity) {
    const geo = new THREE.PlaneGeometry(w, l);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const im = new THREE.InstancedMesh(geo, m, n);
    im.count = 0;
    im.frustumCulled = false;
    scene.add(im);
    let head = 0, used = 0;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
    return {
      mesh: im,
      add(x, z, yaw, scale = 1) {
        const nrm = normalAt(x, z);
        q.setFromUnitVectors(up, nrm);
        const q2 = new THREE.Quaternion().setFromAxisAngle(up, yaw);
        q.multiply(q2);
        s.set(scale, 1, scale);
        m4.compose(new THREE.Vector3(x, heightAt(x, z) + 0.03, z), q, s);
        im.setMatrixAt(head, m4);
        head = (head + 1) % n;
        used = Math.min(n, used + 1);
        im.count = used;
        im.instanceMatrix.needsUpdate = true;
      },
      clear() { head = 0; used = 0; im.count = 0; },
    };
  }
  const prints = trackLayer(260, 0.16, 0.3, 0x5d6878, 0.32);
  const elkTracks = trackLayer(400, 0.14, 0.18, 0x3c3630, 0.5);
  const walkerTracks = trackLayer(160, 0.15, 0.5, 0x26282c, 0.62);
  const blood = trackLayer(120, 0.22, 0.22, 0x8a1a12, 0.85);

  // ---------- snow + breath ----------
  const SN = 2600;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(SN * 3);
  const sr = rng(9);
  for (let i = 0; i < SN; i++) snowPos.set([(sr() - 0.5) * 50, sr() * 24, (sr() - 0.5) * 50], i * 3);
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snowU = { t: { value: 0 }, origin: { value: new THREE.Vector3() }, wind: { value: new THREE.Vector2(0.6, 0.2) }, alpha: { value: 0.6 }, px: { value: 1 }, tint: { value: new THREE.Color(1, 1, 1) } };
  const snow = new THREE.Points(snowGeo, new THREE.ShaderMaterial({
    uniforms: snowU, transparent: true, depthWrite: false, fog: false,
    vertexShader: `uniform float t; uniform vec3 origin; uniform vec2 wind; uniform float px; varying float vA;
      void main(){
        vec3 p = position;
        p.y = mod(p.y - t * (1.1 + fract(position.x*3.7)*0.6), 24.0);
        p.x = mod(p.x + wind.x * t * 1.4 + sin(t*0.7 + position.z)*0.6 - origin.x + 25.0, 50.0) - 25.0;
        p.z = mod(p.z + wind.y * t * 1.4 + cos(t*0.5 + position.x)*0.6 - origin.z + 25.0, 50.0) - 25.0;
        vec3 w = vec3(origin.x + p.x, origin.y - 6.0 + p.y, origin.z + p.z);
        vec4 mv = modelViewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = -mv.z;
        gl_PointSize = clamp(px * 16.0 / d, 1.5, 12.0 * px);
        vA = smoothstep(32.0, 4.0, d) * smoothstep(0.3, 1.5, d);
      }`,
    fragmentShader: `uniform float alpha; uniform vec3 tint; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float k = smoothstep(0.5, 0.1, length(d)); gl_FragColor = vec4(tint, k * vA * alpha); }`,
  }));
  snow.frustumCulled = false;
  scene.add(snow);

  const puffTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,0.55)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const puffs = [];
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.userData.life = 0;
    scene.add(s);
    puffs.push(s);
  }
  // smoke over the fire
  const smoke = [];
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: 0x9a9a9a }));
    s.userData.life = i / 8;
    scene.add(s);
    smoke.push(s);
  }
  // ground mist sheets that drift (dawn, dusk, night)
  const mistTex = (() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    const g = c.getContext("2d");
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256, y = 20 + Math.random() * 30, r = 15 + Math.random() * 30;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255,0.18)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 64);
    }
    return new THREE.CanvasTexture(c);
  })();
  const mists = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, depthWrite: false, opacity: 0, color: 0xffffff }));
    m.scale.set(26, 6, 1);
    m.userData.off = new THREE.Vector3((Math.random() - 0.5) * 80, 0, (Math.random() - 0.5) * 80);
    scene.add(m);
    mists.push(m);
  }

  // ---------- camera rig ----------
  const rig = { yaw: 0, pitch: 0.12, dist: 4.6, height: 2.35, x: 0, y: 0, z: 0, mode: "follow", fov: 60, shake: 0, firstPerson: 0, lookYaw: 0, lookPitch: 0 };
  const _v = new THREE.Vector3();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, lowEnd ? 2 : 1.75) * quality;
    // cap pixels on phones (~1.6 MP)
    const maxPx = lowEnd ? 1.6e6 : 2.6e6;
    const scale = Math.min(dpr, Math.sqrt(maxPx / (w * h)));
    renderer.setPixelRatio(scale);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    sky.starU.px.value = scale;
    snowU.px.value = scale * Math.min(1.4, h / 700);
  }

  // ---------- lighting ----------
  const C = (a) => new THREE.Color(a[0] / 255, a[1] / 255, a[2] / 255);
  function applyLight(L, minutes, o) {
    const dark = L.dark;
    const amb = new THREE.Color(L.amb[0], L.amb[1], L.amb[2]);
    // sun path: rises east ~06:30, sets west ~18:10
    const dayT = (minutes - 390) / (1090 - 390);
    const sunUp = dayT > -0.05 && dayT < 1.05;
    const ang = dayT * Math.PI;
    const sx = Math.cos(ang) * 0.9, sy = Math.max(0.05, Math.sin(ang)) * 0.8, sz = -0.25;
    const sunDir = new THREE.Vector3(sx, sy, sz).normalize();
    const moonDir = new THREE.Vector3(-0.4, 0.75, -0.5).normalize();
    const p = harlan.root.position;
    const dir = sunUp && dark < 0.6 ? sunDir : moonDir;
    sun.position.set(p.x + dir.x * 100, p.y + dir.y * 100, p.z + dir.z * 100);
    sun.target.position.copy(p);
    const dayK = 1 - dark;
    sun.color.copy(amb).lerp(new THREE.Color(1, 0.95, 0.85), 0.3);
    if (dark > 0.6) sun.color.setRGB(0.55, 0.65, 0.9);
    sun.intensity = sunUp && dark < 0.6 ? 1.35 * dayK * (1 - o.storm * 0.55) : 0.1 + o.moon * 0.22;
    hemi.color.copy(C(L.skyTop)).lerp(amb, 0.6);
    hemi.groundColor.copy(amb).multiplyScalar(0.45);
    hemi.intensity = lerp(1.25, 0.2 + o.moon * 0.14, smooth(0, 0.95, dark)) * (1 - o.storm * 0.1);
    // fog
    const fogC = C(L.fog);
    scene.fog.color.copy(fogC);
    scene.fog.density = 0.0026 + L.fogDensity * 0.0065 + o.snow * 0.011 + dark * 0.02;
    // sky
    sky.uniforms.top.value.copy(C(L.skyTop));
    sky.uniforms.horizon.value.copy(C(L.skyHorizon));
    sky.uniforms.glow.value.copy(C(L.glowColor));
    sky.uniforms.glowAmt.value = L.glow;
    sky.uniforms.sunDir.value.copy(sunDir);
    sky.uniforms.fogCol.value.copy(fogC);
    sky.uniforms.fogAmt.value = clamp(L.fogDensity * 0.5 + o.snow * 0.6, 0, 0.95);
    sky.starU.alpha.value = smooth(0.45, 0.85, dark) * (1 - o.snow * 0.85);
    sky.moon.material.opacity = smooth(0.4, 0.8, dark) * (1 - o.snow * 0.7) * (0.4 + o.moon * 0.6);
    sky.moon.position.set(camera.position.x + moonDir.x * 1200, camera.position.y + moonDir.y * 1200, camera.position.z + moonDir.z * 1200);
    sky.far.material.color.copy(C(L.ridgeFar)).lerp(fogC, clamp(o.snow * 0.8 + L.fogDensity * 0.25, 0, 0.9));
    sky.near.material.color.copy(C(L.ridgeNear)).lerp(fogC, clamp(o.snow * 0.6 + L.fogDensity * 0.15, 0, 0.8));
    // snow tint follows the light
    snowU.tint.value.copy(amb).lerp(new THREE.Color(0.6, 0.65, 0.75), dark * 0.6);
    snowU.alpha.value = o.snow * (0.85 - dark * 0.35) + (dark > 0.6 ? 0.05 : 0);
    return { dark, sunDir };
  }

  // ---------- per-frame visuals ----------
  let fireOn = false, fireK = 0;
  function setFire(on) { fireOn = on; }
  function updateFire(dt, t) {
    fireK = damp(fireK, fireOn ? 1 : 0, 1.5, dt);
    fire.visible = fireK > 0.02 || true;
    flames.forEach((f, i) => {
      f.visible = fireK > 0.05;
      f.scale.set(1, (0.8 + Math.sin(t * (6 + i) + i) * 0.18) * fireK, 1);
    });
    flameMat.uniforms.t.value = t;
    flameMat.uniforms.k.value = fireK;
    const fl = 0.85 + Math.sin(t * 11) * 0.08 + Math.sin(t * 23.3) * 0.06 + Math.sin(t * 3.1) * 0.05;
    fireLight.position.set(fireP.x, fireP.y + 1.0, fireP.z);
    fireLight.intensity = 9 * fireK * fl;
    fireLight.distance = 26;
    embers.visible = fireK > 0.05;
    for (let i = 0; i < EM; i++) {
      emberLife[i] += dt * (0.35 + (i % 5) * 0.08);
      if (emberLife[i] > 1) emberLife[i] = 0;
      const l = emberLife[i];
      emberPos[i * 3] = Math.sin(i * 12.9 + t * 0.7) * 0.3 * l + Math.sin(t + i) * 0.1;
      emberPos[i * 3 + 1] = 0.3 + l * 3.2;
      emberPos[i * 3 + 2] = Math.cos(i * 7.1 + t * 0.6) * 0.3 * l;
    }
    emberGeo.attributes.position.needsUpdate = true;
    smoke.forEach((s, i) => {
      s.userData.life += dt * 0.08;
      if (s.userData.life > 1) s.userData.life = 0;
      const l = s.userData.life;
      s.position.set(fireP.x + Math.sin(l * 4 + i) * 0.4 + l * 1.5, fireP.y + 1.2 + l * 7, fireP.z + l * 0.6);
      s.scale.setScalar(1 + l * 4);
      s.material.opacity = Math.sin(l * Math.PI) * 0.22 * fireK;
    });
    return fl;
  }

  function puff(x, y, z, fx, fz) {
    const p = puffs.find((s) => s.userData.life <= 0);
    if (!p) return;
    p.userData.life = 1;
    p.userData.v = new THREE.Vector3(fx * 0.5, 0.25, fz * 0.5);
    p.position.set(x, y, z);
    p.scale.setScalar(0.25);
  }
  function updatePuffs(dt, cold) {
    for (const p of puffs) {
      if (p.userData.life <= 0) { p.material.opacity = 0; continue; }
      p.userData.life -= dt * 0.7;
      p.position.addScaledVector(p.userData.v, dt);
      p.scale.setScalar(0.25 + (1 - p.userData.life) * 0.9);
      p.material.opacity = Math.max(0, p.userData.life) * 0.45 * cold;
    }
  }
  function updateMist(dt, t, amount, color) {
    const p = harlan.root.position;
    mists.forEach((m, i) => {
      const o = m.userData.off;
      o.x += dt * 0.6;
      if (o.x > 45) o.x -= 90;
      const x = p.x + o.x, z = p.z + o.z;
      if (Math.hypot(o.x, o.z) < 10) o.z = (o.z < 0 ? -1 : 1) * 12;
      m.position.set(x, heightAt(x, z) + 1.2 + Math.sin(t * 0.2 + i) * 0.3, z);
      m.material.opacity = amount * 0.55;
      m.material.color.copy(color);
    });
  }

  function worldToScreen(x, y, z) {
    _v.set(x, y, z).project(camera);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return { x: (_v.x * 0.5 + 0.5) * w, y: (-_v.y * 0.5 + 0.5) * h, behind: _v.z > 1 || _v.z < -1, ndcX: _v.x };
  }

  // in-world IR trail-camera photo (book: "a faint smudge near the left edge…")
  const cardRT = new THREE.WebGLRenderTarget(480, 320);
  const cardCam = new THREE.PerspectiveCamera(58, 480 / 320, 0.1, 400);
  function renderCard(spotId, setup) {
    const s = CAM_SPOTS[spotId];
    const F = PLACES[s.face];
    const dx = F.x - s.x, dz = F.z - s.z;
    const l = Math.hypot(dx, dz);
    const p = at(s.x + (dx / l) * 0.7, s.z + (dz / l) * 0.7, 1.15);
    cardCam.position.copy(p);
    cardCam.lookAt(p.x + (dx / l) * 10, heightAt(p.x + (dx / l) * 10, p.z + (dz / l) * 10) + 0.9, p.z + (dz / l) * 10);
    const camHidden = Object.values(camMeshes).map((m) => [m.g, m.g.visible]);
    camHidden.forEach(([g]) => (g.visible = false));
    const restore = setup(cardCam, s) || (() => {});
    const prevFog = scene.fog.density, prevFogC = scene.fog.color.clone();
    const prevHemi = hemi.intensity, prevSun = sun.intensity, prevLamp = lamp.intensity;
    scene.fog.density = 0.03;
    scene.fog.color.setRGB(0.05, 0.05, 0.05);
    hemi.intensity = 0.25;
    sun.intensity = 0.1;
    lamp.intensity = 0;
    // IR flash from the camera
    const flash = new THREE.PointLight(0xffffff, 14, 45, 1.1);
    flash.position.copy(p);
    scene.add(flash);
    const oc = occlusion.uCam.value.clone(), op = occlusion.uPlayer.value.clone();
    occlusion.uCam.value.copy(p);
    occlusion.uPlayer.value.copy(p).add(new THREE.Vector3(0, 0.01, 0));
    occlusion.uOn.value = 1;
    const hv = harlan.root.visible;
    harlan.root.visible = false;
    renderer.setRenderTarget(cardRT);
    renderer.render(scene, cardCam);
    renderer.setRenderTarget(null);
    harlan.root.visible = hv;
    occlusion.uCam.value.copy(oc); occlusion.uPlayer.value.copy(op);
    camHidden.forEach(([g, v]) => (g.visible = v));
    scene.remove(flash);
    scene.fog.density = prevFog;
    scene.fog.color.copy(prevFogC);
    hemi.intensity = prevHemi; sun.intensity = prevSun; lamp.intensity = prevLamp;
    restore();
    const buf = new Uint8Array(480 * 320 * 4);
    renderer.readRenderTargetPixels(cardRT, 0, 0, 480, 320, buf);
    const c = document.createElement("canvas");
    c.width = 480; c.height = 320;
    const g = c.getContext("2d");
    const img = g.createImageData(480, 320);
    for (let y = 0; y < 320; y++)
      for (let x = 0; x < 480; x++) {
        const si = ((319 - y) * 480 + x) * 4, di = (y * 480 + x) * 4;
        let v = buf[si] * 0.3 + buf[si + 1] * 0.59 + buf[si + 2] * 0.11;
        v = Math.pow(v / 255, 0.75) * 255 * 1.45 + (Math.random() - 0.5) * 38;
        const vig = 1 - Math.pow(Math.hypot(x / 480 - 0.5, y / 320 - 0.5) * 1.35, 2.2);
        v *= clamp(vig, 0.15, 1);
        img.data[di] = img.data[di + 1] = img.data[di + 2] = clamp(v, 0, 255);
        img.data[di + 3] = 255;
      }
    g.putImageData(img, 0, 0);
    return c;
  }

  return {
    renderer, scene, camera, rig, harlan, bull, cows, walker, sky, lamp, lampFill, fireLight, hemi, sun,
    prints, elkTracks, walkerTracks, blood, wallSegs, deadfall, camMeshes, posts, truck, propColliders, forest,
    resize, applyLight, updateFire, setFire, puff, updatePuffs, updateMist, worldToScreen, renderCard, setSticks, sticks, snowU,
    fireP,
    setQuality(q) { quality = q; resize(); },
    get quality() { return quality; },
    lowEnd,
  };
}
