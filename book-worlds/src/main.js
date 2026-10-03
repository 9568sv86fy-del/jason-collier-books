import * as THREE from "three";
import { createAudio } from "./audio.js";
import { createInput } from "./input.js";
import { createSim } from "./sim.js";
import { damp, dampAngle, clamp } from "./util.js";
import { createNarration } from "./narration.js";
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
const narrate = createNarration();

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
const direct = ["ford", "play", "gate", "almost", "rope", "bank"].includes(start);
let mode = direct ? "play" : "hub";
let playing = mode === "play";
let station = 0;
let signalClosed = false;
let transitioning = false;
let pullTimer = 0;
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
  pages: document.getElementById("pages"),
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
  hub: document.getElementById("hub"),
  screen: document.getElementById("screen"),
  roll: document.getElementById("roll"),
  freq: document.getElementById("st-freq"),
  stScript: document.getElementById("st-script"),
  stTitle: document.getElementById("st-title"),
  stSub: document.getElementById("st-sub"),
  stBadge: document.getElementById("st-badge"),
  stSoon: document.getElementById("st-soon"),
  stNum: document.getElementById("st-num"),
  tune: document.getElementById("tune-in"),
  knob: document.getElementById("dial-knob"),
};

const STATIONS = [
  { id: "trail", freq: "54.7", script: "On the air", title: "The California Trail", sub: "Jang & Tom · Wagon Masters", live: true },
  { id: "stack", freq: "67.2", script: "No signal", title: "The Rusty Stack", sub: "An airship in another sky", live: false },
  { id: "oldman", freq: "81.4", script: "No signal", title: "Old Man on the Mountain", sub: "A ridge with its own weather", live: false },
  { id: "pulse", freq: "103.0", script: "No signal", title: "The First Pulse", sub: "Space, and the Hum beneath it", live: false },
];

const CARDS = {
  title: {
    script: "Please stand by",
    kicker: "Book Worlds  ·  Station 1",
    title: "The California Trail",
    body: "The Hum is leaking through the broadcast into every book, and it has torn five pages out of this one. The scenes are scrambled. The Keeper has to gather those pages, put the river and the bandits back the way the story remembers, and close the signal. This channel is the wagon road. Jang and Tom, two Philadelphia debtors posing as guides, are pretending they meant to be here. The weapon in the Keeper's hand is a brass skeleton key worn like a saber — the Trail Key.",
    btn: "Step through",
    hint: true,
  },
  outro: {
    script: "End of the trail",
    kicker: "World I",
    title: "The river remembers",
    body: "The stagecoach beast comes apart into static and silt. Jang counts the oxen twice and gets a different number both times. Tom scratches the back of his neck and admits, quietly, that the humming on this channel has thinned. The screen home stays shut until every torn page is back in the book.",
    btn: "Back to the trail",
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

const PAGES = {
  handbills: {
    script: "A torn page",
    title: "Flashy handbills",
    body: "A torn page. Two debtors printed flashy handbills and hired themselves out as guides who had never guided a wagon.",
  },
  dentistry: {
    script: "A torn page",
    title: "Negotiated by dentistry",
    body: "A torn page. Pawnee warriors had the train surrounded. Jang bought the peace with dentistry.",
  },
  bear: {
    script: "A torn page",
    title: "The hunt turns around",
    body: "A torn page. The bear hunt turned inside out. The hunters became the hunted.",
  },
  pendulum: {
    script: "A torn page",
    title: "A human pendulum",
    body: "A torn page. Bandits held the narrows until Tom, the clumsiest human pendulum in the West, cleared them on the backswing.",
  },
  circus: {
    script: "A torn page",
    title: "The floating circus",
    body: "A torn page. The river would not ford, so the crossing became a floating circus of wagons.",
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
  document.body.classList.remove("playing");
  if (id === "title") narrate.say("intro");
}
function showPage(id, n) {
  const c = PAGES[id];
  const spoken = narrate.line("page-" + id) || c.body;
  mode = "page";
  el.script.textContent = c.script;
  el.kicker.textContent = `Story page  ·  ${n} of 5`;
  el.title.textContent = c.title;
  el.body.textContent = spoken;
  el.btn.textContent = "Tuck it back";
  el.hint.hidden = true;
  el.card.hidden = false;
  el.card.dataset.card = "page";
  playing = false;
  input.enabled = false;
  document.body.classList.remove("playing");
  narrate.say("page-" + id);
}

function hideCard() {
  el.card.hidden = true;
  el.hub.hidden = true;
  playing = true;
  input.enabled = true;
  mode = "play";
  document.body.classList.add("playing");
}

function paintStation() {
  const st = STATIONS[station];
  el.screen.classList.remove("is-tuning");
  el.screen.dataset.station = st.id;
  el.screen.classList.toggle("is-static", !st.live);
  el.freq.textContent = st.freq;
  el.stScript.textContent = st.live && signalClosed ? "Story restored" : st.script;
  el.stTitle.textContent = st.title;
  el.stSub.textContent = st.sub;
  el.stNum.textContent = `Station ${station + 1}`;
  el.stSoon.hidden = st.live;
  el.stBadge.textContent = "Story restored";
  el.stBadge.hidden = !(st.live && signalClosed);
  el.tune.disabled = !st.live;
  el.tune.textContent = !st.live ? "Coming soon" : signalClosed ? "Tune in again" : "Tune in";
  el.knob.style.transform = `rotate(${station * 78 - 36}deg)`;
  for (const pic of el.screen.querySelectorAll(".bw-pic")) pic.hidden = pic.dataset.pic !== st.id;
  el.hub.dataset.station = st.id;
  el.hub.dataset.closed = signalClosed ? "1" : "0";
}

function showHub() {
  mode = "hub";
  playing = false;
  input.enabled = false;
  el.card.hidden = true;
  el.hub.hidden = false;
  el.hub.classList.remove("pull", "return", "settle");
  document.body.classList.remove("playing");
  paintStation();
}

function reducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setStation(index, fromUser) {
  if (transitioning || mode !== "hub") return;
  station = (index + STATIONS.length) % STATIONS.length;
  paintStation();
  if (!fromUser) return;
  audio.unlock();
  audio.dial();
  audio.staticBurst();
  el.screen.classList.add("is-tuning");
  clearTimeout(pullTimer);
  pullTimer = window.setTimeout(() => el.screen.classList.remove("is-tuning"), reducedMotion() ? 0 : 460);
}

function finishThrough() {
  el.hub.classList.remove("pull");
  el.hub.hidden = true;
  el.roll.classList.remove("in", "out");
  el.roll.hidden = true;
  transitioning = false;
  sim.resetTrail();
  camYaw = 0.55;
  camPitch = 0.4;
  showCard("title");
}

function pullThrough() {
  if (transitioning || mode !== "hub" || !STATIONS[station].live) return;
  transitioning = true;
  audio.unlock();
  audio.staticBurst();
  if (reducedMotion()) {
    finishThrough();
    return;
  }
  el.roll.hidden = false;
  el.roll.classList.remove("out");
  el.roll.classList.add("in");
  el.hub.classList.add("pull");
  clearTimeout(pullTimer);
  pullTimer = window.setTimeout(finishThrough, 980);
}

function finishBack() {
  el.hub.classList.remove("pull", "return", "settle");
  el.hub.hidden = false;
  el.roll.classList.remove("in", "out");
  el.roll.hidden = true;
  transitioning = false;
  showHub();
}

function pullBack() {
  if (transitioning) return;
  transitioning = true;
  signalClosed = true;
  playing = false;
  input.enabled = false;
  mode = "hub";
  audio.staticBurst();
  el.card.hidden = true;
  document.body.classList.remove("playing");
  narrate.say("restored");
  if (reducedMotion()) {
    finishBack();
    return;
  }
  el.roll.hidden = false;
  el.roll.classList.remove("in", "hold");
  el.roll.classList.add("out");
  el.hub.hidden = false;
  el.hub.classList.remove("pull", "return");
  el.hub.classList.add("settle");
  paintStation();
  clearTimeout(pullTimer);
  pullTimer = window.setTimeout(finishBack, 980);
}

function tryTune() {
  if (transitioning || mode !== "hub") return;
  audio.unlock();
  if (!STATIONS[station].live) {
    audio.staticBurst();
    el.screen.classList.add("is-tuning");
    clearTimeout(pullTimer);
    pullTimer = window.setTimeout(() => el.screen.classList.remove("is-tuning"), 420);
    return;
  }
  pullThrough();
}

document.getElementById("dial-prev").addEventListener("click", () => setStation(station - 1, true));
document.getElementById("dial-next").addEventListener("click", () => setStation(station + 1, true));
el.knob.addEventListener("click", () => setStation(station + 1, true));
el.tune.addEventListener("click", () => tryTune());
window.addEventListener("keydown", (e) => {
  if (mode !== "hub" || transitioning) return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    e.preventDefault();
    setStation(station + 1, true);
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    e.preventDefault();
    setStation(station - 1, true);
  } else if (e.key === "Enter" && !(e.target && e.target.closest && e.target.closest("button"))) {
    e.preventDefault();
    tryTune();
  }
});

el.btn.addEventListener("click", () => {
  audio.unlock();
  if (mode === "title") {
    camYaw = 0;
    camPitch = 0.42;
    sim.begin({ restore: !start });
    hideCard();
    narrate.say("enter");
  } else if (mode === "dead") {
    sim.revive();
    hideCard();
  } else if (mode === "outro" || mode === "page") {
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
} else if (start === "gate") {
  camYaw = 0;
  camPitch = 0.36;
  sim.skipToGate(true);
  hideCard();
  audio.unlock();
} else if (start === "almost") {
  camYaw = 0;
  camPitch = 0.36;
  sim.skipToGate(false);
  hideCard();
  audio.unlock();
} else if (start === "rope") {
  camYaw = 0;
  camPitch = 0.36;
  sim.place(0, 80, 0);
  hideCard();
  audio.unlock();
} else if (start === "bank") {
  camYaw = 0;
  camPitch = 0.42;
  sim.place(0, 96, 0);
  hideCard();
  audio.unlock();
} else if (start === "play") {
  hideCard();
  audio.unlock();
} else {
  showHub();
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

  let dist = 6.3;
  let lookX = snap.player.x;
  let lookY = snap.player.y + 1.35;
  let lookZ = snap.player.z;
  if (snap.lock && mode === "play") {
    const dx = snap.lock.x - snap.player.x;
    const dz = snap.lock.z - snap.player.z;
    const sep = Math.hypot(dx, dz);
    dist = clamp(6.4 + sep * 0.28, 6.4, 10.5);
    lookX = snap.player.x + dx * 0.38;
    lookZ = snap.player.z + dz * 0.38;
    lookY = snap.player.y + 1.25;
  }
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
  lookAt.set(lookX, lookY, lookZ);
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
    else if (ev.type === "hurt") shake = Math.max(shake, 0.35);
    else if (ev.type === "hit") shake = Math.max(shake, ev.heavy ? 0.55 : 0.26);
    else if (ev.type === "level") addFloat(ev.x, ev.y, ev.z, "Lv " + ev.n, true);
    else if (ev.type === "flash") { flashI = 1; shockK = 0.45; el.flash.classList.add("on"); setTimeout(() => el.flash.classList.remove("on"), 160); }
    else if (ev.type === "dead") showCard("dead");
    else if (ev.type === "outro") showCard("outro");
    else if (ev.type === "gate") pullBack();
    else if (ev.type === "page") showPage(ev.id, ev.n);
    else if (ev.type === "bulletin") narrate.say(ev.id);
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
  el.coins.textContent = `${p.coins} coins`;
  el.potions.textContent = p.potions > 0 ? `Tonic ${p.potions}` : "";
  el.pages.textContent = `Pages ${snap.pages || 0}/5`;
  el.obj.textContent = snap.objective;
  el.pips.innerHTML = [1, 2, 3, 4].map((i) => `<i class="${p.combo >= i ? "on" : ""}"></i>`).join("");
  setRing("hp-ring", 40, p.hp / p.hpMax);
  setRing("mp-ring", 28, (p.mp ?? p.hp) / (p.mpMax || p.hpMax));
  const gHp = document.getElementById("g-hp");
  const gMp = document.getElementById("g-mp");
  const gLv = document.getElementById("g-lv");
  const gMini = document.getElementById("g-lv-mini");
  if (gHp) gHp.textContent = String(Math.ceil(p.hp));
  if (gMp) gMp.textContent = String(Math.ceil(p.mp ?? 0));
  if (gLv) gLv.textContent = `Lv ${p.level || 1}`;
  if (gMini) gMini.textContent = `Lv ${p.level || 1}`;
  paintParty(snap);
  renderMenu(snap);
  const showBoss = snap.boss.active && (snap.boss.alive || snap.boss.hp <= 0);
  el.bossbar.hidden = !showBoss || mode !== "play";
  if (showBoss) el.bossFill.style.width = `${clamp(snap.boss.hp / snap.boss.hpMax, 0, 1) * 100}%`;
  const react = snap.reaction;
  const shown = react || snap.prompt;
  if (shown && mode === "play") {
    el.prompt.hidden = false;
    el.prompt.classList.toggle("is-react", !!react);
    el.prompt.textContent = `${shown.label}  ·  ${react ? "F" : "E"}`;
  } else {
    el.prompt.hidden = true;
    el.prompt.classList.remove("is-react");
  }
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
  station: () => station,
  stationId: () => STATIONS[station].id,
  signalClosed: () => signalClosed,
  player: () => {
    const p = sim.player;
    return { x: p.x, y: p.y, z: p.z, hp: p.hp, yaw: p.yaw, hits: sim.hits() };
  },
  enemies: () => sim.enemies.map((e) => ({ id: e.id, kind: e.kind, hp: e.hp, alive: e.alive, x: e.x, z: e.z, pendulum: !!e.pendulum, routed: !!e.routed })),
  bulletin: () => narrate.current(),
  pages: () => sim.pageCount(),
  circus: () => sim.circusDone(),
  floats: () => sim.floats(),
  boss: () => ({ hp: sim.boss.hp, alive: sim.boss.alive, active: sim.boss.active, x: sim.boss.x, z: sim.boss.z }),
  hits: () => sim.hits(),
  mp: () => sim.mp(),
  level: () => sim.level(),
  team: () => sim.team(),
  reaction: () => sim.reaction(),
  lockId: () => sim.lockId(),
};

function setRing(id, radius, pct) {
  const node = document.getElementById(id);
  if (!node) return;
  const circ = 2 * Math.PI * radius;
  node.style.strokeDasharray = String(circ);
  node.style.strokeDashoffset = String(circ * (1 - clamp(pct, 0, 1)));
}

function paintParty(snap) {
  const rows = snap.party || [];
  for (const row of rows) {
    const bar = document.getElementById(row.id + "-hp");
    if (bar) bar.style.width = `${clamp(row.hp / row.hpMax, 0, 1) * 100}%`;
  }
  const team = document.getElementById("team-fill");
  if (team) team.style.width = `${clamp((snap.player.team || 0) / 100, 0, 1) * 100}%`;
}

const MENU = {
  root: [
    { id: "attack", label: "Attack" },
    { id: "magic", label: "Magic" },
    { id: "items", label: "Items" },
    { id: "special", label: "Special" },
  ],
  magic: [
    { id: "flash", label: "Lantern Flash", cost: 25 },
    { id: "devil", label: "Dust Devil", cost: 20 },
    { id: "mend", label: "Trail Mend", cost: 30 },
    { id: "back", label: "Back" },
  ],
  items: [
    { id: "tonic", label: "Tonic" },
    { id: "back", label: "Back" },
  ],
  special: [
    { id: "team", label: "Wagon Toss" },
    { id: "back", label: "Back" },
  ],
};
let menuPane = "root";
let menuIndex = 0;
let menuSig = "";

function menuList() {
  return MENU[menuPane] || MENU.root;
}

function renderMenu(snap) {
  const node = document.getElementById("cmd");
  if (!node) return;
  const list = menuList();
  menuIndex = (menuIndex % list.length + list.length) % list.length;
  const p = snap && snap.player;
  const sig = `${menuPane}|${menuIndex}|${p ? p.potions : 0}|${p ? Math.ceil(p.mp) : 0}|${p ? Math.floor(p.team || 0) : 0}|${mode}`;
  if (sig === menuSig) return;
  menuSig = sig;
  node.innerHTML = `<p class="cmd-kicker">${menuPane === "root" ? "Commands" : menuPane}</p>` + list.map((item, i) => {
    let note = "";
    let disabled = false;
    if (item.cost) note = String(item.cost);
    if (item.id === "tonic") note = "x" + ((p && p.potions) || 0);
    if (item.id === "team") note = p && p.team >= 100 ? "ready" : "meter";
    if (item.id === "flash" || item.id === "devil" || item.id === "mend") disabled = !p || p.mp < item.cost;
    if (item.id === "tonic") disabled = !p || p.potions <= 0;
    if (item.id === "team") disabled = !p || p.team < 100;
    return `<button type="button" data-cmd="${item.id}" class="${i === menuIndex ? "is-on" : ""}" ${disabled ? "disabled" : ""}><span>${item.label}</span><small>${note}</small></button>`;
  }).join("");
}

function activateMenu(id) {
  if (id === "magic" || id === "items" || id === "special") {
    menuPane = id;
    menuIndex = 0;
    menuSig = "";
    return;
  }
  if (id === "back") {
    menuPane = "root";
    menuIndex = 0;
    menuSig = "";
    return;
  }
  if (id === "attack") input.press("attack");
  else if (id === "flash") input.press("flash");
  else if (id === "devil") input.press("devil");
  else if (id === "mend") input.press("mend");
  else if (id === "tonic") input.press("potion");
  else if (id === "team") input.press("special");
}

document.getElementById("cmd").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cmd]");
  if (!btn || mode !== "play") return;
  e.preventDefault();
  e.stopPropagation();
  activateMenu(btn.getAttribute("data-cmd"));
  menuSig = "";
});

window.addEventListener("wheel", (e) => {
  if (mode !== "play" || !playing) return;
  if (e.target.closest && e.target.closest("#hub, #card")) return;
  menuIndex += e.deltaY > 0 ? 1 : -1;
  menuSig = "";
  e.preventDefault();
}, { passive: false });

window.addEventListener("keydown", (e) => {
  if (mode !== "play" || !playing) return;
  const k = e.key.toLowerCase();
  if (k === "[") { menuIndex -= 1; menuSig = ""; e.preventDefault(); }
  else if (k === "]") { menuIndex += 1; menuSig = ""; e.preventDefault(); }
  else if (k === "m") {
    const list = menuList();
    const item = list[(menuIndex % list.length + list.length) % list.length];
    if (item) activateMenu(item.id);
    menuSig = "";
    e.preventDefault();
  } else if (k === "b" || k === "backspace") {
    if (menuPane !== "root") { menuPane = "root"; menuIndex = 0; menuSig = ""; e.preventDefault(); }
  }
});

requestAnimationFrame(frame);
