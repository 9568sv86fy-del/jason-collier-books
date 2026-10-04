// Skinned humans on the Quaternius CC0 rig (see CREDITS.md).
// One body is loaded, cloned per person, dyed, and dressed. Locomotion clips crossfade;
// jumps, swings, and rolls layer on that skeleton.
import * as THREE from "three";
import { GLTFLoader } from "three/addons";
import { createHuman as createCapsule, trailKey, handbillMesh, softDot } from "./rigs.js";

const NATIVE = { Walk_Loop: 1.15, Jog_Fwd_Loop: 2.55, Sprint_Loop: 4.35, Crouch_Fwd_Loop: 0.82 };
const LOCO = ["Walk_Loop", "Jog_Fwd_Loop", "Sprint_Loop"];
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

let assetsReady = null;
let loading = null;
const queue = [];

function modelUrl(file) {
  return new URL("../assets/models/" + file, import.meta.url).href;
}

function loadGLB(file) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => loader.load(modelUrl(file), resolve, undefined, reject));
}

function ensure() {
  if (!loading) {
    loading = Promise.all([loadGLB("body.glb"), loadGLB("anims.glb"), loadGLB("head.glb"), loadGLB("hair.glb")])
      .then(([body, anims, head, hair]) => {
        for (const clip of anims.animations) {
          for (const track of clip.tracks) {
            if (!/pelvis\.position$/.test(track.name)) continue;
            const v = track.values;
            const x0 = v[0];
            const z0 = v[2];
            for (let i = 0; i < v.length; i += 3) {
              v[i] = x0;
              v[i + 2] = z0;
            }
          }
        }
        assetsReady = { body: body.scene, clips: anims.animations, head: head.scene, hair: hair.scene };
        for (const api of queue) dress(api, assetsReady);
        queue.length = 0;
        return assetsReady;
      })
      .catch((err) => {
        console.warn("Book Worlds rig failed; using the standby figure.", err);
        for (const api of queue) api._fail();
        queue.length = 0;
        throw err;
      });
  }
  return loading;
}

export function whenCastReady() {
  return ensure().catch(() => null);
}

function cloneSkinned(source) {
  const clone = source.clone(true);
  const srcOf = new Map();
  const cloneOf = new Map();
  const walk = (a, b) => {
    srcOf.set(b, a);
    cloneOf.set(a, b);
    for (let i = 0; i < a.children.length; i++) walk(a.children[i], b.children[i]);
  };
  walk(source, clone);
  clone.traverse((node) => {
    if (!node.isSkinnedMesh) return;
    const src = srcOf.get(node);
    node.skeleton = src.skeleton.clone();
    node.bindMatrix.copy(src.bindMatrix);
    node.skeleton.bones = src.skeleton.bones.map((bone) => cloneOf.get(bone));
    node.bind(node.skeleton, node.bindMatrix);
    const mats = Array.isArray(src.material) ? src.material : [src.material];
    const cloned = mats.map((m) => m.clone());
    node.material = Array.isArray(src.material) ? cloned : cloned[0];
    node.castShadow = true;
    node.frustumCulled = false;
  });
  return clone;
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function addEuler(bone, x, y, z) {
  if (!bone) return;
  _q.setFromEuler(_e.set(x, y, z, "XYZ"));
  bone.quaternion.multiply(_q);
}

function gradeMesh(root, test, hex, rough = 0.86) {
  root.traverse((o) => {
    if (!o.isMesh || !test(o.name || "")) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of list) {
      if (!m || !m.color) continue;
      m.color.setHex(hex);
      if (m.roughness != null) m.roughness = rough;
      if (m.metalness != null) m.metalness = 0.04;
      m.flatShading = false;
    }
  });
}

function put(model, bone, obj, x, y, z, rx = 0, ry = 0, rz = 0) {
  obj.position.set(x, y, z);
  obj.rotation.set(rx, ry, rz);
  model.add(obj);
  model.updateMatrixWorld(true);
  bone.attach(obj);
  obj.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = !(o.material && o.material.transparent);
      o.frustumCulled = false;
    }
  });
  return obj;
}

// Head and hair glbs are authored in character space. Bake them into the head bone
// so they sit on the skull and follow the neck.
function weldToBone(model, bone, source) {
  model.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(bone.matrixWorld).invert();
  source.updateMatrixWorld(true);
  const added = [];
  source.traverse((o) => {
    if (!o.isMesh) return;
    const mesh = new THREE.Mesh(o.geometry.clone(), o.material.clone());
    mesh.name = o.name || "";
    mesh.geometry.applyMatrix4(o.matrixWorld);
    mesh.geometry.applyMatrix4(inv);
    mesh.castShadow = true;
    mesh.frustumCulled = false;
    bone.add(mesh);
    added.push(mesh);
  });
  return added;
}

function clothMat(hex, rough = 0.88) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0.02 });
}

export function createHuman(spec) {
  const root = new THREE.Group();
  const spin = new THREE.Group();
  root.add(spin);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({ map: softDot(), transparent: true, depthWrite: false, opacity: 0.32, color: 0x000000 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  shadow.renderOrder = 1;
  root.add(shadow);

  const api = {
    root,
    hand: null,
    glow: null,
    neck: null,
    skinned: false,
    update() { return { step: false }; },
    _fail() {
      const cap = createCapsule(spec);
      spin.add(cap.root);
      api.hand = cap.hand;
      api.glow = cap.glow;
      api.neck = cap.neck;
      api.update = (dt, a) => cap.update(dt, a);
    },
    _spec: spec,
    _spin: spin,
  };
  if (assetsReady) dress(api, assetsReady);
  else {
    queue.push(api);
    ensure();
  }
  return api;
}

function dress(api, assets) {
  const spec = api._spec;
  const model = cloneSkinned(assets.body);
  const bones = {};
  model.traverse((o) => { if (o.isBone) bones[o.name] = o; });
  const B = (n) => bones[n];

  gradeMesh(model, (n) => /Arms/.test(n), spec.sleeves || spec.coat || spec.cloth || 0xc4a574);
  gradeMesh(model, (n) => /Body/.test(n), spec.cloth || 0xc4a574, 0.9);
  gradeMesh(model, (n) => /Legs/.test(n), spec.pants || 0x4a453c, 0.92);
  gradeMesh(model, (n) => /Feet/.test(n), spec.boots || 0x2c2118, 0.78);

  const headMeshes = weldToBone(model, B("Head"), assets.head.clone(true));
  for (const mesh of headMeshes) {
    if (!mesh.material) continue;
    if (mesh.material.color && /head|brows/i.test(mesh.name)) mesh.material.color.setHex(spec.skin || 0xd2a07c);
    if (/eyes/i.test(mesh.name)) {
      mesh.material.roughness = 0.25;
      mesh.material.metalness = 0.04;
    }
  }
  const headBox = new THREE.Box3();
  for (const mesh of headMeshes) {
    if (/^head$/i.test(mesh.name)) headBox.expandByObject(mesh);
  }
  if (headBox.isEmpty()) headBox.setFromObject(B("Head"));
  const crown = headBox.max.y;
  const faceZ = headBox.max.z;

  if (!spec.bandana) {
    const hairMeshes = weldToBone(model, B("Head"), assets.hair.clone(true));
    for (const mesh of hairMeshes) mesh.material = clothMat(spec.hair || 0x3a2a22, 1);
  }

  const hatHex = spec.hat == null ? null : spec.hat;
  if (hatHex != null) {
    const hat = new THREE.Group();
    const hatM = clothMat(hatHex, 0.9);
    const bandM = clothMat(spec.hatBand || 0x3a2418, 0.7);
    const bowler = !!spec.bowler;
    const brimR = bowler ? 0.16 : (spec.wideHat ? 0.26 : 0.2);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(brimR, brimR + 0.006, 0.014, 22), hatM);
    brim.scale.z = bowler ? 1 : 1.15;
    hat.add(brim);
    if (bowler) {
      const crownMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hatM);
      crownMesh.position.y = 0.03;
      hat.add(crownMesh);
    } else {
      const crownMesh = new THREE.Mesh(new THREE.CylinderGeometry(spec.wideHat ? 0.12 : 0.1, 0.125, spec.wideHat ? 0.12 : 0.14, 16), hatM);
      crownMesh.position.y = 0.07;
      crownMesh.scale.z = 1.12;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.13, 0.026, 16), bandM);
      band.position.y = 0.02;
      band.scale.z = 1.12;
      hat.add(crownMesh, band);
    }
    put(model, B("Head"), hat, 0, crown + 0.01, 0.01, spec.hatPitch || 0.06, 0, spec.hatTilt || 0);
  }

  if (spec.mustache) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.028), clothMat(spec.hair || 0x1c1612, 1));
    put(model, B("Head"), m, 0, crown - 0.16, faceZ + 0.02);
  }
  if (spec.bandana) {
    const ban = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.04), clothMat(0x6a2420, 0.8));
    put(model, B("Head"), ban, 0, crown - 0.14, faceZ + 0.01);
  }
  if (spec.coat) {
    const coat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.4, 0.92, 18, 1, true, 0.55, Math.PI * 1.55),
      new THREE.MeshStandardMaterial({ color: spec.coat, roughness: 0.9, metalness: 0.02, side: THREE.DoubleSide }),
    );
    put(model, B("pelvis"), coat, 0, 1.02, -0.04);
  }
  if (spec.waistcoat) {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.1), clothMat(spec.cloth2 || 0x2c3338, 0.72));
    put(model, B("spine_03"), vest, 0, 1.32, 0.14);
  }
  if (spec.suspenders) {
    for (const s of [-1, 1]) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.46, 0.02), clothMat(0x6a3a28, 0.8));
      put(model, B("spine_02"), strap, s * 0.08, 1.28, 0.13, -0.08, 0, s * -0.06);
    }
  }
  if (spec.neckerchief) {
    const necker = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 6), clothMat(spec.neckerchief, 0.75));
    put(model, B("spine_03"), necker, 0, 1.52, 0.12, Math.PI, 0, 0);
  }
  let glow = null;
  if (spec.lantern) {
    const lamp = new THREE.Group();
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 8), clothMat(0x3a342c, 0.45));
    cage.material.metalness = 0.55;
    glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffc56a }),
    );
    glow.position.y = 0.01;
    lamp.add(cage, glow);
    put(model, B("spine_01"), lamp, -0.18, 1.05, 0.16);
  }
  model.updateMatrixWorld(true);
  const grip = new THREE.Vector3();
  if (spec.key) {
    B("hand_r").getWorldPosition(grip);
    const key = trailKey();
    key.scale.setScalar(0.7);
    put(model, B("hand_r"), key, grip.x, grip.y, grip.z, -0.95, 0.25, 0.35);
    api.hand = B("hand_r");
  }
  if (spec.club) {
    B("hand_r").getWorldPosition(grip);
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.62, 7), clothMat(0x5a4030, 0.85));
    put(model, B("hand_r"), club, grip.x, grip.y + 0.18, grip.z, 0.35, 0, 0.15);
  }
  if (spec.bills) {
    B("hand_l").getWorldPosition(grip);
    const stack = handbillMesh();
    stack.scale.setScalar(0.85);
    put(model, B("hand_l"), stack, grip.x, grip.y, grip.z + 0.06, -0.6, 0.3, 0.2);
  }

  model.scale.set(spec.bulk || 1, spec.height || 1, spec.bulk || 1);
  api._spin.add(model);

  const mixer = new THREE.AnimationMixer(model);
  const acts = {};
  const weight = {};
  for (const clip of assets.clips) {
    const action = mixer.clipAction(clip);
    action.enabled = true;
    action.setEffectiveWeight(0);
    action.play();
    if (clip.name === "Death01" || clip.name === "Hit_Chest") {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }
    acts[clip.name] = action;
    weight[clip.name] = 0;
  }
  weight.Idle_Loop = 1;
  acts.Idle_Loop?.setEffectiveWeight(1);

  let phase = 0;
  let hitT = 0;
  let prevHurt = 0;
  api.glow = glow;
  api.neck = B("neck_01");
  api.skinned = true;

  api.update = (dt, a) => {
    const speed = a.speed || 0;
    if ((a.hurt || 0) > prevHurt + 0.15) hitT = 0.42;
    prevHurt = a.hurt || 0;
    hitT = Math.max(0, hitT - dt);
    const moving = speed > 0.35 && !a.air && a.action !== "dodge" && a.action !== "death";
    const tgt = {};
    const set = (n, w) => { if (acts[n]) tgt[n] = (tgt[n] || 0) + w; };
    if (a.action === "death") set("Death01", 1);
    else if (hitT > 0.05 && a.action !== "attack") set("Hit_Chest", 1);
    else if (a.action === "guard") set("Crouch_Idle_Loop", 1);
    else if (a.action === "dodge") set("Crouch_Fwd_Loop", 1);
    else if (a.air) {
      set("Crouch_Idle_Loop", 0.72);
      set("Idle_Loop", 0.28);
    } else if (!moving) set("Idle_Loop", 1);
    else {
      const jog = smoothstep(1.55, 3.15, speed);
      const sprint = smoothstep(3.4, 5.3, speed);
      set("Walk_Loop", (1 - jog) * (1 - sprint));
      set("Jog_Fwd_Loop", jog * (1 - sprint));
      set("Sprint_Loop", sprint);
    }
    const rate = 1 - Math.exp(-8 * dt);
    let sum = 0;
    for (const n of Object.keys(acts)) {
      weight[n] += ((tgt[n] || 0) - weight[n]) * rate;
      if (weight[n] < 0.004) weight[n] = 0;
      sum += weight[n];
    }
    for (const n of Object.keys(acts)) acts[n].setEffectiveWeight(sum > 0 ? weight[n] / sum : 0);

    if (moving && a.action !== "death") {
      const names = LOCO.filter((n) => acts[n] && weight[n] > 0.02);
      if (names.length) {
        let stride = 0;
        let wsum = 0;
        for (const n of names) {
          const w = weight[n];
          stride += w * NATIVE[n] * acts[n].getClip().duration;
          wsum += w;
        }
        stride = Math.max(0.45, stride / wsum);
        const cps = Math.max(0.35, Math.min(1.7, speed / stride));
        for (const n of names) acts[n].timeScale = cps * acts[n].getClip().duration;
        let lead = names[0];
        for (const n of names) if (weight[n] > weight[lead]) lead = n;
        const dur = acts[lead].getClip().duration;
        const lt = (acts[lead].time % dur) / dur;
        for (const n of names) if (n !== lead) acts[n].time = lt * acts[n].getClip().duration;
      }
    } else {
      for (const n of Object.keys(acts)) if (!LOCO.includes(n)) acts[n].timeScale = a.action === "death" ? 1 : 1;
    }

    mixer.update(dt);
    gesture(bones, a);
    const dodge = a.action === "dodge";
    if (dodge) {
      const spins = Math.min(1, a.actionT || 0) * Math.PI * 2;
      if (Math.abs(a.dodgeSide || 0) > 0.45) {
        api._spin.rotation.z = -(a.dodgeSide) * spins;
        api._spin.rotation.x = 0;
      } else {
        api._spin.rotation.x = spins;
        api._spin.rotation.z = 0;
      }
      api._spin.position.y = -Math.sin(Math.min(1, a.actionT || 0) * Math.PI) * 0.28;
    } else {
      api._spin.rotation.set(0, 0, 0);
      api._spin.position.y = 0;
    }
    if (api.neck) addEuler(api.neck, a.air ? -0.15 : 0, a.look || 0, 0);

    phase += dt * (moving ? 2.2 : 0);
    const step = moving && acts.Walk_Loop && weight.Walk_Loop + weight.Jog_Fwd_Loop + weight.Sprint_Loop > 0.4
      && Math.sin(phase) > 0 && Math.sin(phase - dt * 2.2) <= 0;
    return { step: !!step };
  };
}

function gesture(bones, a) {
  const B = (n) => bones[n];
  if (a.action === "attack") {
    const p = Math.min(1, a.actionT || 0);
    const sw = Math.sin(p * Math.PI);
    const combo = a.combo || 1;
    if (combo >= 3) {
      addEuler(B("upperarm_r"), -2.1 * sw, 0.15, -0.2);
      addEuler(B("lowerarm_r"), -0.9 * sw, 0, 0);
      addEuler(B("spine_02"), 0.35 * sw, 0.2, 0);
    } else if (combo === 2) {
      addEuler(B("upperarm_r"), -0.4, 0.2, 1.3 * sw);
      addEuler(B("lowerarm_r"), -0.55 * sw, 0, 0);
      addEuler(B("spine_02"), 0, -0.55 * sw, 0);
    } else {
      addEuler(B("upperarm_r"), -0.55 - sw * 0.4, -0.2, -1.25 * sw);
      addEuler(B("lowerarm_r"), -0.7 * sw, 0, 0);
      addEuler(B("spine_02"), 0, 0.5 * sw, 0);
    }
    addEuler(B("upperarm_l"), -0.7, 0, 0.35);
  } else if (a.action === "flash") {
    const p = Math.sin(Math.min(1, a.actionT || 0) * Math.PI);
    addEuler(B("upperarm_l"), -2.2 * p, 0, 0.4);
    addEuler(B("upperarm_r"), -2.2 * p, 0, -0.4);
  } else if (a.action === "shove") {
    const p = Math.sin(Math.min(1, a.actionT || 0) * Math.PI);
    addEuler(B("upperarm_l"), -1.3 * p, 0, 0.2);
    addEuler(B("upperarm_r"), -1.3 * p, 0, -0.2);
    addEuler(B("spine_02"), 0.25 * p, 0, 0);
  } else if (a.action === "throw") {
    const p = Math.min(1, a.actionT || 0);
    addEuler(B("upperarm_r"), -0.4 - Math.sin(p * Math.PI) * 1.7, 0.2, -0.3);
    addEuler(B("lowerarm_r"), -0.4, 0, 0);
  } else if (a.action === "guard") {
    addEuler(B("upperarm_l"), -1.15, 0.4, 0.55);
    addEuler(B("upperarm_r"), -1.15, -0.4, -0.55);
    addEuler(B("lowerarm_l"), -1.1, 0, 0);
    addEuler(B("lowerarm_r"), -1.1, 0, 0);
  } else if (a.air) {
    addEuler(B("upperarm_l"), -0.9, 0, 0.25);
    addEuler(B("upperarm_r"), -0.9, 0, -0.25);
  }
}
