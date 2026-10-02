// Flint and steel: strike sparks onto char cloth, nurse the ember with your breath, feed kindling then sticks.
// A close-up canvas scene in the overlay card. Harder in wind, wet snow, at night and with a racing heart.
// opts: { wind 0..1, wet 0..1, dark 0..1, fear 0..1, learned bool, auto bool (tests) }
// onDone(true) when the fire takes; onDone(false) if the player backs out.
import { createHands } from "./hands3d.js";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function fireGame(hud, opts, onDone, sfx = {}) {
  const card = hud.overlay(`
    <div class="fg" id="fg">
      <div class="fg-top"><b id="fgStage">STRIKE</b><span id="fgTip"></span></div>
      <canvas id="fgC" width="720" height="460"></canvas>
      <div class="fg-row">
        <button id="fgBlow" class="fg-btn">BLOW</button>
        <button id="fgKind" class="fg-btn">KINDLING</button>
        <button id="fgSticks" class="fg-btn">STICKS</button>
      </div>
      <div class="fg-row small"><button id="fgBack" class="fg-btn ghost">PUT IT DOWN</button>${opts.learned ? '<button id="fgSkip" class="fg-btn ghost">LIGHT IT (SKIP)</button>' : ""}</div>
    </div>`, { clear: false });
  card.addEventListener("click", (e) => e.stopPropagation());
  const $ = (id) => card.querySelector("#" + id);
  const cv = $("fgC"), g = cv.getContext("2d");
  let hands = null;
  try { hands = createHands(cv, "flint"); } catch (e) { hands = null; }
  const W = cv.width, H = cv.height;
  const diff = clamp(opts.wind * 0.45 + opts.wet * 0.3 + opts.dark * 0.15 + opts.fear * 0.25, 0, 0.9);
  const st = { stage: "strike", t: 0, swing: 0, heat: 0, lungs: 1, blowing: false, flame: 0, kindling: false, sticks: false, sparks: [], smoke: [], msg: "", msgT: 0, gust: 0, done: false, okT: 0, strikes: 0 };
  const cloth = { x: W * 0.5, y: H * 0.72, w: 70, h: 44 };
  const tips = {
    strike: "Swipe down the flint, or tap / SPACE when the steel is at the edge.",
    blow: "Hold BLOW (or SPACE) in long, gentle breaths. Let go before your lungs run out.",
    feed: "Feed it: KINDLING when the flame stands up, then STICKS. Too soon and you smother it.",
  };
  const say = (m) => { st.msg = m; st.msgT = 2.2; };
  const setStage = (s) => { st.stage = s; $("fgStage").textContent = s === "strike" ? "STRIKE" : s === "blow" ? "NURSE THE EMBER" : "FEED IT"; $("fgTip").textContent = tips[s]; sync(); };
  function sync() {
    $("fgBlow").disabled = st.stage === "strike";
    $("fgKind").disabled = st.stage !== "feed" || st.kindling;
    $("fgSticks").disabled = st.stage !== "feed" || !st.kindling || st.sticks;
  }
  // ---- strike: steel swings across the flint edge; timing decides the shower ----
  function strike(power = 1) {
    if (st.stage !== "strike" || st.done) return;
    st.strikes++;
    const edge = Math.abs(Math.sin(st.swing)); // 1 = at the flint edge
    const q = clamp(edge * power, 0, 1);
    const n = Math.round(6 + q * 34);
    for (let i = 0; i < n; i++) st.sparks.push({ x: W * 0.5 + 60, y: H * 0.38, vx: -60 - Math.random() * 220, vy: 40 + Math.random() * 260, life: 0.5 + Math.random() * 0.6, hot: 1 });
    sfx.strike?.();
    const pCatch = q * 0.5 * (1 - opts.wind * 0.55) * (1 - opts.wet * 0.5) * (1 - opts.fear * 0.3) + (opts.auto ? 1 : 0);
    if (Math.random() < pCatch || (st.strikes >= 9 && q > 0.6)) {
      setTimeout(() => { if (st.stage === "strike") { st.heat = 22; setStage("blow"); say("A spark holds on the char cloth. A dull orange point."); sfx.catch?.(); } }, 350);
    } else say(q < 0.45 ? "A glancing blow. Hit the edge." : opts.wind > 0.5 ? "The wind takes the sparks." : "Sparks, but nothing holds.");
  }
  // input
  let sy = null;
  cv.addEventListener("pointerdown", (e) => { sy = e.clientY; cv.setPointerCapture?.(e.pointerId); });
  cv.addEventListener("pointerup", (e) => {
    if (st.stage !== "strike") return;
    const dy = sy == null ? 0 : e.clientY - sy;
    strike(dy > 30 ? 1.1 : 0.85);
    sy = null;
  });
  const blowOn = () => { if (st.stage !== "strike") st.blowing = true; };
  const blowOff = () => { st.blowing = false; };
  $("fgBlow").addEventListener("pointerdown", blowOn);
  for (const ev of ["pointerup", "pointerleave", "pointercancel"]) $("fgBlow").addEventListener(ev, blowOff);
  $("fgKind").onclick = () => {
    if (st.flame < 38) { st.flame = Math.max(0, st.flame - 30); say("Too soon. The kindling sits on it and it gutters."); return; }
    st.kindling = true; st.flame = Math.min(100, st.flame + 12); say("The kindling catches along its edges."); sfx.crackle?.(); sync();
  };
  $("fgSticks").onclick = () => {
    if (st.flame < 58) { st.flame = Math.max(0, st.flame - 34); say("Too heavy, too soon. It sulks under the sticks."); return; }
    st.sticks = true; say("You lean the four sticks in. The fire takes them."); sfx.crackle?.(); sync();
  };
  $("fgBack").onclick = () => finish(false);
  if (opts.learned) $("fgSkip").onclick = () => finish(true);
  const key = (e) => {
    if (e.code !== "Space") return;
    e.preventDefault(); e.stopPropagation();
    if (e.type === "keydown") { if (e.repeat) return; if (st.stage === "strike") strike(1); else blowOn(); }
    else blowOff();
  };
  addEventListener("keydown", key, true); addEventListener("keyup", key, true);

  function finish(ok) {
    if (st.done) return;
    st.done = true;
    removeEventListener("keydown", key, true); removeEventListener("keyup", key, true);
    setTimeout(() => { if (cv.isConnected) hud.closeOverlay(); onDone(ok); }, ok ? 700 : 0);
  }

  // ---- simulation + drawing ----
  let last = performance.now();
  setStage("strike");
  function loop(now) {
    if (!cv.isConnected) { hands?.dispose(); hands = null; return; }
    // real time, sub-stepped, so a slow phone plays at the same pace
    const real = Math.min(0.5, (now - last) / 1000); last = now;
    const n = Math.max(1, Math.ceil(real / 0.04));
    for (let i = 0; i < n; i++) step(real / n);
    draw();
    requestAnimationFrame(loop);
  }
  function step(dt) {
    st.t += dt;
    st.swing += dt * (2.6 + diff * 2.6);
    st.msgT -= dt;
    // gusts
    if (Math.random() < dt * (0.15 + opts.wind * 0.6)) st.gust = 0.6 + Math.random() * 0.6;
    st.gust = Math.max(0, st.gust - dt);
    if (opts.auto && !st.done) {
      if (st.stage === "strike" && st.t > 0.4 && st.strikes === 0) strike(1);
      // long breaths with a full refill in between (hysteresis), like a careful player
      if (st.lungs > 0.95) st.autoBreath = true; else if (st.lungs < 0.12) st.autoBreath = false;
      if (st.stage === "blow") st.blowing = !!st.autoBreath;
      if (st.stage === "feed") { if (!st.kindling && st.flame > 45) $("fgKind").onclick(); else if (st.kindling && !st.sticks && st.flame > 62) $("fgSticks").onclick(); st.blowing = st.flame < 75 && !!st.autoBreath; }
    }
    // lungs: a long gentle breath is ~1.6 s; they refill in ~1 s
    if (st.blowing) st.lungs = Math.max(0, st.lungs - dt / 1.6); else st.lungs = Math.min(1, st.lungs + dt / 1.0);
    const puff = st.blowing && st.lungs > 0;
    if (st.stage === "blow") {
      st.heat += puff ? dt * (34 - diff * 12) : -dt * (5 + opts.wind * 10 + st.gust * 18);
      if (st.blowing && st.lungs <= 0) st.heat -= dt * 10; // gasping scatters it
      if (st.heat >= 100) { st.flame = 30; setStage("feed"); say("Flame. A little tongue of it, licking the bark."); sfx.flame?.(); }
      if (st.heat <= 0) { st.heat = 0; setStage("strike"); say("The ember dies. Strike again."); }
    } else if (st.stage === "feed") {
      const fuel = st.sticks ? 0.6 : st.kindling ? 1.4 : 3.2;
      st.flame += (puff ? dt * 22 : 0) - dt * (fuel + opts.wind * 4 + st.gust * 10 + opts.wet * 3);
      st.flame = clamp(st.flame, 0, 100);
      if (st.flame <= 0) { st.kindling = st.sticks = false; st.heat = 40; setStage("blow"); say("It drops back to an ember. Breathe on it."); }
      if (st.sticks && st.flame > 50) { st.okT += dt; if (st.okT > 1) { say("The fire takes. Small. Enough."); finish(true); } }
    }
    for (const s of st.sparks) { s.vy += 520 * dt; s.vx += (opts.wind * -120 + st.gust * -200) * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; }
    st.sparks = st.sparks.filter((s) => s.life > 0 && s.y < H);
    if (st.stage !== "strike" && Math.random() < dt * (4 + st.flame * 0.1)) st.smoke.push({ x: cloth.x + (Math.random() - 0.5) * 30, y: cloth.y - 10, a: 0.35, r: 6 });
    for (const p of st.smoke) { p.y -= dt * 40; p.x -= dt * (10 + opts.wind * 60); p.r += dt * 14; p.a -= dt * 0.18; }
    st.smoke = st.smoke.filter((p) => p.a > 0);
  }
  function draw() {
    const fl = st.stage === "feed" ? st.flame / 100 : 0, em = st.stage === "blow" ? st.heat / 100 : fl > 0 ? 1 : 0;
    const glow = Math.max(em * 0.5, fl);
    g.fillStyle = "#07080a"; g.fillRect(0, 0, W, H);
    // firelight on the snow and stones
    const rg = g.createRadialGradient(cloth.x, cloth.y, 10, cloth.x, cloth.y, 260 + fl * 200);
    rg.addColorStop(0, `rgba(255,140,60,${0.05 + glow * 0.45})`); rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = "#1a1d22"; g.fillRect(0, H * 0.62, W, H * 0.38);
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    // stones
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + i * 0.112); g.fillStyle = `rgb(${50 + glow * 70},${48 + glow * 40},${46 + glow * 20})`; g.beginPath(); g.ellipse(cloth.x + Math.cos(a) * 210, H * 0.8 + Math.sin(a) * 40, 34, 20, 0, 0, Math.PI * 2); g.fill(); }
    // tinder nest: birch bark curls + dry grass
    g.strokeStyle = "#d8cfbf"; g.lineWidth = 3;
    for (let i = 0; i < 14; i++) { const a = i * 0.45; g.beginPath(); g.arc(cloth.x + Math.cos(a) * 46, cloth.y + 8 + Math.sin(a) * 12, 12, a, a + 2.4); g.stroke(); }
    g.strokeStyle = "#8d7a52"; g.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) { const a = i * 0.37; g.beginPath(); g.moveTo(cloth.x + Math.cos(a) * 20, cloth.y + 12); g.lineTo(cloth.x + Math.cos(a) * 70, cloth.y + 4 + Math.sin(a * 3) * 10); g.stroke(); }
    // char cloth
    g.fillStyle = "#16120f"; g.fillRect(cloth.x - cloth.w / 2, cloth.y - cloth.h / 2, cloth.w, cloth.h);
    if (em > 0) { const eg = g.createRadialGradient(cloth.x, cloth.y, 1, cloth.x, cloth.y, 10 + em * 26); eg.addColorStop(0, `rgba(255,${150 + em * 80},80,${0.6 + em * 0.4})`); eg.addColorStop(1, "rgba(255,60,0,0)"); g.fillStyle = eg; g.fillRect(cloth.x - 60, cloth.y - 60, 120, 120); }
    // kindling + sticks
    g.strokeStyle = "#5a3f28"; g.lineCap = "round";
    if (st.kindling) { g.lineWidth = 5; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(cloth.x + i * 14, cloth.y + 18); g.lineTo(cloth.x + i * 3, cloth.y - 60); g.stroke(); } }
    if (st.sticks) { g.lineWidth = 12; for (const i of [-1.6, -0.5, 0.5, 1.6]) { g.beginPath(); g.moveTo(cloth.x + i * 50, cloth.y + 24); g.lineTo(cloth.x + i * 6, cloth.y - 110); g.stroke(); } }
    // flame
    if (fl > 0) {
      for (let k = 0; k < 3; k++) {
        const h = (60 + fl * 160) * (1 - k * 0.25) * (0.9 + Math.sin(st.t * (9 + k * 3)) * 0.1), w = (26 + fl * 40) * (1 - k * 0.25);
        const fg = g.createLinearGradient(0, cloth.y, 0, cloth.y - h);
        fg.addColorStop(0, k === 2 ? "rgba(255,250,220,0.95)" : "rgba(255,170,60,0.9)"); fg.addColorStop(1, "rgba(255,60,10,0)");
        g.fillStyle = fg; g.beginPath(); g.moveTo(cloth.x - w, cloth.y); g.quadraticCurveTo(cloth.x - w * 0.3 - st.gust * 30, cloth.y - h * 0.6, cloth.x - st.gust * 40 + Math.sin(st.t * 7) * 6, cloth.y - h); g.quadraticCurveTo(cloth.x + w * 0.3, cloth.y - h * 0.6, cloth.x + w, cloth.y); g.fill();
      }
    }
    for (const p of st.smoke) { g.fillStyle = `rgba(150,150,150,${p.a})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill(); }
    // hands: left holds the flint over the cloth, right swings the steel striker
    const sx = W * 0.5 + 70, syy = H * 0.36;
    if (hands) {
      const a = Math.sin(st.swing);
      if (st.stage === "strike") hands.update({ show: true, lx: sx - 10, ly: syy + 34, rx: sx + 110 + a * 10, ry: syy - 18 + a * 60, swing: a, glow });
      else if (st.stage === "blow") hands.update({ show: true, props: false, pose: "cup", lx: cloth.x - 92, ly: cloth.y + 6, rx: cloth.x + 92, ry: cloth.y + 6, glow });
      else hands.update({ show: false, glow });
      if (st.stage === "strike") { g.strokeStyle = `rgba(255,200,120,${0.25 + Math.abs(a) * 0.5})`; g.lineWidth = 2; g.beginPath(); g.arc(sx + 20, syy, 18 + Math.abs(a) * 8, 0, Math.PI * 2); g.stroke(); }
    } else if (st.stage === "strike") {
      g.fillStyle = "#3b2c20"; g.beginPath(); g.ellipse(sx - 10, syy + 30, 46, 30, 0.3, 0, Math.PI * 2); g.fill(); // gloved left fist
      g.fillStyle = "#6f6d68"; g.beginPath(); g.moveTo(sx - 20, syy - 8); g.lineTo(sx + 26, syy - 20); g.lineTo(sx + 14, syy + 16); g.closePath(); g.fill(); // flint
      const a = Math.sin(st.swing);
      const rx = sx + 70 + a * 10, ry = syy - 60 + a * 70;
      g.fillStyle = "#3b2c20"; g.beginPath(); g.ellipse(rx + 36, ry + 8, 40, 26, -0.4, 0, Math.PI * 2); g.fill(); // right fist
      g.strokeStyle = "#a9adb3"; g.lineWidth = 9; g.beginPath(); g.moveTo(rx - 30, ry + 4); g.lineTo(rx + 20, ry + 10); g.stroke(); // steel
      // timing cue: the edge zone
      g.strokeStyle = `rgba(255,200,120,${0.25 + Math.abs(a) * 0.5})`; g.lineWidth = 2; g.beginPath(); g.arc(sx + 20, syy, 18 + Math.abs(a) * 8, 0, Math.PI * 2); g.stroke();
    } else if (st.blowing) {
      g.fillStyle = "rgba(200,210,220,0.08)"; g.beginPath(); g.ellipse(cloth.x + 120, cloth.y - 40, 90, 30, 0.4, 0, Math.PI * 2); g.fill();
    }
    for (const s of st.sparks) { g.fillStyle = `rgba(255,${200 + Math.random() * 55},${120 * s.life},${Math.min(1, s.life * 2)})`; g.fillRect(s.x, s.y, 3, 3); }
    // meters
    g.fillStyle = "rgba(236,230,218,0.75)"; g.font = "13px sans-serif";
    if (st.stage !== "strike") {
      g.fillText("BREATH", 20, 28); g.fillStyle = "rgba(236,230,218,0.2)"; g.fillRect(90, 18, 160, 10); g.fillStyle = st.lungs < 0.2 ? "#d9631e" : "#ece6da"; g.fillRect(90, 18, 160 * st.lungs, 10);
      g.fillStyle = "rgba(236,230,218,0.75)"; g.fillText(st.stage === "blow" ? "EMBER" : "FLAME", 20, 50); g.fillStyle = "rgba(236,230,218,0.2)"; g.fillRect(90, 40, 160, 10); g.fillStyle = "#ff9a40"; g.fillRect(90, 40, 160 * (st.stage === "blow" ? st.heat / 100 : st.flame / 100), 10);
    }
    if (opts.wind > 0.3 || st.gust > 0) { g.fillStyle = "rgba(236,230,218,0.6)"; g.fillText(st.gust > 0 ? "GUST" : "WIND", W - 70, 28); }
    if (st.msgT > 0) { g.fillStyle = `rgba(236,230,218,${Math.min(1, st.msgT)})`; g.font = "italic 17px serif"; g.textAlign = "center"; g.fillText(st.msg, W / 2, H - 18); g.textAlign = "left"; }
  }
  requestAnimationFrame(loop);
  return st;
}
