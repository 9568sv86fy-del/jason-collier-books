import * as THREE from "three";
import { createAudio } from "./audio.js";
import { createInput } from "./input.js";
import { createSim } from "./sim.js";
import { damp, dampAngle, clamp } from "./util.js";
import { buildWorld } from "./world.js";

const canvas = document.getElementById("view");
const app = document.getElementById("app");
const low = Math.min(window.innerWidth, window.innerHeight) < 520;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, powerPreference: "high-performance" });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.6));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, 1, 0.12, 400);
scene.add(camera);
const audio = createAudio();
const world = buildWorld(scene, low);
const sim = createSim(scene, world, audio);
const input = createInput(app);

const flashLight = new THREE.PointLight(0xffe6b8, 0, 16, 1.5);
scene.add(flashLight);
const shock = new THREE.Mesh(
  new THREE.RingGeometry(0.4, 0.55, 28),
  new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0, side: THREE.DoubleSide }),
);
shock.rotation.x = -Math.PI / 2;
scene.add(shock);

const params = new URLSearchParams(location.search);
const start = params.get("start");
let mode = start === "ford" || start === "play" ? "play" : "title";
let playing = mode === "play";
let ready = false;
let camYaw = 0.25;
let camPitch = 0.42;
const camPos = new THREE.Vector3(0, 3, -10);
const lookAt = new THREE.Vector3();
let flashI = 0;
let shockK = 0;
let shake = 0;
let bubble = null;
let bubbleT = 0;
const floats = [];
const v = new THREE.Vector3();

const el = {
  card: document.getElementById("card"),
  script: document.getElementById("card-script"),
  kicker: document.getElementById("card-kicker"),
  title: document.getElementById("card-title"),
  body: document.getElementById("card-body"),
  btn: document.getElementById("card-btn"),
  hint: document.getElementById("card-hint"),
  boot: document.getElementById("boot"),
  hp: document.getElementById("hp-fill"),
  hpNum: document.getElementById("hp-num"),
  lantern: document.getElementById("lantern-fill"),
  coins: document.getElementById("coins"),
  potions: document.getElementById("potions"),
  obj: document.getElementById("obj"),
  bossbar: document.getElementById("bossbar"),
  bossFill: document.getElementById("boss-fill"),
  pips: document.getElementById("pips"),
  prompt: document.getElementById("prompt"),
  reticle: document.getElementById("reticle"),
  bubbles: document.getElementById("bubbles"),
  floaters: document.getElementById("floats"),
  flash: document.getElementById("flash"),
  hurt: document.getElementById("hurt"),
  hud: document.getElementById("hud"),
};

const CARDS = {
  title: {
    script: "Please stand by",
    kicker: "Book Worlds  ·  World I",
    title: "The California Trail",
    body: "A young drifter called the Keeper comes down the ridge with a brass skeleton key worn like a saber — the Trail Key. In the wagon camp, Jang and Tom, two Philadelphia debtors posing as guides, are pretending the dust is not humming. It is. Something from another book is leaking through.",
    btn: "Take the trail",
    hint: true,
  },
  outro: {
    script: "End of the trail",
    kicker: "World I",
    title: "The river remembers",
    body: "The stagecoach beast comes apart into static and silt. Jang counts the oxen twice and gets a different number both times. Tom scratches the back of his neck and admits, quietly, that the humming has stopped. North of the ford, a door of riveted brass stands where no door should.",
    btn: "Approach the door",
    hint: false,
  },
  soon: {
    script: "Coming soon",
    kicker: "World II",
    title: "The Rusty Stack",
    body: "The door is shut from the other side. Through the brass waits the shadow of an airship this trail has not earned yet — the ugliest freight hauler in the sky, and a sky that belongs to another book.",
    btn: "Return to the ford",
    hint: false,
  },
  dead: {
    script: "Dust settles",
    kicker: "The trail keeps your boots",
    title: "Not yet",
    body: "The Keeper hits the dirt. Jang is already composing the handbill. Tom offers a hand the size of a skillet.",
    btn: "Get up",
    hint: false,
  },
};

function showCard(id) {
  const c = CARDS[id];
  mode = id;
  el.script.textContent = c.script;
  el.kicker.textContent = c.kicker;
  el.title.textContent = c.title;
  el.body.textContent = c.body;
  el.btn.textContent = c.btn;
  el.hint.hidden = !c.hint;
  el.card.hidden = false;
  el.card.dataset.card = id;
  playing = false;
  input.enabled = false;
}
function hideCard() {
  el.card.hidden = true;
  playing = true;
  input.enabled = true;
  mode = "play";
}

el.btn.addEventListener("click", () => {
  audio.unlock();
  if (mode === "title") {
    camYaw = 0;
    camPitch = 0.42;
    sim.begin();
    hideCard();
  } else if (mode === "dead") {
    sim.revive();
    hideCard();
  } else if (mode === "outro") {
    hideCard();
  } else if (mode === "soon") {
    hideCard();
  }
});

if (start === "ford") {
  camYaw = 0;
  camPitch = 0.36;
  sim.place(0, 104, 0);
  sim.wakeBoss();
  hideCard();
  audio.unlock();
} else if (start === "play") {
  hideCard();
  audio.unlock();
} else {
  showCard("title");
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  document.body.classList.toggle("touch", w < 820 || navigator.maxTouchPoints > 0 || matchMedia("(pointer: coarse)").matches);
}
window.addEventListener("resize", resize);
resize();

function project(x, y, z) {
  v.set(x, y, z);
  v.project(camera);
  if (v.z > 1) return null;
  const r = canvas.getBoundingClientRect();
  return { x: (v.x * 0.5 + 0.5) * r.width, y: (-v.y * 0.5 + 0.5) * r.height };
}

function say(who, text) {
  bubble = { who, text };
  bubbleT = 3.6;
  el.bubbles.hidden = false;
}

function addFloat(x, y, z, text, coin) {
  const node = document.createElement("span");
  node.className = coin ? "floater coin" : "floater";
  node.textContent = coin ? `+${text}` : String(text);
  el.floaters.appendChild(node);
  floats.push({ x, y, z, t: 0, node });
}

let last = performance.now();
function frame(now) {
  const raw = Math.min(0.3, Math.max(0.001, (now - last) / 1000));
  last = now;
  if (mode === "title") {
    camYaw = 0.62 + Math.sin(now / 1000 * 0.18) * 0.08;
    camPitch = 0.4;
  } else {
    const look = input.consumeLook();
    camYaw -= look.dx * 0.005;
    camPitch = clamp(camPitch + look.dy * 0.003, 0.2, 1.05);
  }

  const step = 1 / 60;
  let left = raw;
  let snap = null;
  let fresh = true;
  let guard = 0;
  while (left > 0.0004 && guard < 20) {
    const dt = Math.min(step, left);
    snap = sim.update(dt, input, camYaw, playing && mode === "play", fresh);
    fresh = false;
    left -= dt;
    guard++;
    if (snap.lock && mode === "play") {
      const ang = Math.atan2(snap.lock.x - snap.player.x, snap.lock.z - snap.player.z);
      camYaw = dampAngle(camYaw, ang, 5, dt);
    }
  }

  const dist = 6.3;
  const horiz = Math.cos(camPitch * 0.55) * dist;
  const lift = 1.7 + Math.sin(camPitch) * 2.1;
  let cx = snap.player.x - Math.sin(camYaw) * horiz;
  let cz = snap.player.z - Math.cos(camYaw) * horiz;
  const half = Math.abs(cz) > 0 ? (function () {
    const z = cz;
    if (z < 20) return 17;
    if (z < 28) return 17 - (z - 20) * 1.2;
    if (z < 96) return 6.4;
    return 14;
  })() : 17;
  if (Math.abs(cx) > half) cx = Math.sign(cx) * half;
  const bob = Math.sin(now / 1000 * 1.6) * 0.015;
  camPos.x = damp(camPos.x, cx, 5.5, raw);
  camPos.y = damp(camPos.y, snap.player.y + lift + bob, 5.5, raw);
  camPos.z = damp(camPos.z, cz, 5.5, raw);
  shake = Math.max(0, shake - raw);
  lookAt.set(snap.player.x, snap.player.y + 1.35, snap.player.z);
  camera.position.copy(camPos);
  camera.position.x += Math.sin(now / 40) * shake * 0.12;
  camera.position.y += Math.cos(now / 35) * shake * 0.08;
  camera.lookAt(lookAt);

  world.update(raw, now / 1000, snap.player);
  flashI = Math.max(0, flashI - raw * 2.2);
  flashLight.intensity = flashI * 16;
  flashLight.position.set(snap.player.x, snap.player.y + 1.4, snap.player.z);
  if (shockK > 0) {
    shockK = Math.max(0, shockK - raw);
    shock.position.set(snap.player.x, snap.player.y + 0.05, snap.player.z);
    shock.scale.setScalar(1 + (1 - shockK / 0.45) * 6);
    shock.material.opacity = shockK * 1.2;
  } else shock.material.opacity = 0;

  for (const ev of snap.events) {
    if (ev.type === "say") say(ev.who, ev.text);
    else if (ev.type === "dmg") addFloat(ev.x, ev.y, ev.z, ev.n, ev.coin);
    else if (ev.type === "hurt") shake = 0.35;
    else if (ev.type === "flash") { flashI = 1; shockK = 0.45; el.flash.classList.add("on"); setTimeout(() => el.flash.classList.remove("on"), 160); }
    else if (ev.type === "dead") showCard("dead");
    else if (ev.type === "outro") showCard("outro");
    else if (ev.type === "gate") showCard("soon");
    else if (ev.type === "boss") shake = 0.2;
  }

  paintHud(snap);
  renderer.render(scene, camera);
  if (!ready) {
    ready = true;
    el.boot.classList.add("gone");
    window.__BOOKWORLDS.ready = true;
  }
  requestAnimationFrame(frame);
}

function paintHud(snap) {
  const p = snap.player;
  el.hud.classList.toggle("on", mode === "play");
  el.hp.style.width = `${clamp(p.hp / p.hpMax, 0, 1) * 100}%`;
  el.hpNum.textContent = String(Math.ceil(p.hp));
  el.lantern.style.width = `${clamp(p.flash, 0, 1) * 100}%`;
  el.coins.textContent = String(p.coins);
  el.potions.textContent = p.potions > 0 ? `Potion ${p.potions}` : "";
  el.obj.textContent = snap.objective;
  el.pips.innerHTML = [1, 2, 3].map((i) => `<i class="${p.combo >= i ? "on" : ""}"></i>`).join("");
  const showBoss = snap.boss.active && (snap.boss.alive || snap.boss.hp <= 0);
  el.bossbar.hidden = !showBoss || mode !== "play";
  if (showBoss) el.bossFill.style.width = `${clamp(snap.boss.hp / snap.boss.hpMax, 0, 1) * 100}%`;
  if (snap.prompt && mode === "play") {
    el.prompt.hidden = false;
    el.prompt.textContent = `${snap.prompt.label}  ·  E`;
  } else el.prompt.hidden = true;
  if (snap.lock && mode === "play") {
    const pt = project(snap.lock.x, snap.lock.y, snap.lock.z);
    if (pt) {
      el.reticle.hidden = false;
      el.reticle.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
    } else el.reticle.hidden = true;
  } else el.reticle.hidden = true;
  el.hurt.style.opacity = String(Math.max(0, (p.hp < 35 ? 0.18 : 0) + (shake > 0 ? 0.25 : 0)));

  bubbleT -= 0.016;
  if (bubble && bubbleT > 0) {
    const head = snap.heads[bubble.who];
    const pt = head && project(head.x, head.y, head.z);
    if (pt) {
      el.bubbles.hidden = false;
      el.bubbles.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
      el.bubbles.innerHTML = `<b>${bubble.who === "jang" ? "Jang" : "Tom"}</b><span>${bubble.text}</span>`;
    }
  } else el.bubbles.hidden = true;

  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i];
    f.t += 0.016;
    f.y += 0.016 * 0.8;
    const pt = project(f.x, f.y, f.z);
    if (!pt || f.t > 0.9) {
      f.node.remove();
      floats.splice(i, 1);
      continue;
    }
    f.node.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
    f.node.style.opacity = String(1 - f.t / 0.9);
  }
}

window.__BOOKWORLDS = {
  ready: false,
  mode: () => mode,
  player: () => {
    const p = sim.player;
    return { x: p.x, y: p.y, z: p.z, hp: p.hp, yaw: p.yaw, hits: sim.hits() };
  },
  enemies: () => sim.enemies.map((e) => ({ id: e.id, kind: e.kind, hp: e.hp, alive: e.alive, x: e.x, z: e.z })),
  boss: () => ({ hp: sim.boss.hp, alive: sim.boss.alive, active: sim.boss.active, x: sim.boss.x, z: sim.boss.z }),
  hits: () => sim.hits(),
};

requestAnimationFrame(frame);
