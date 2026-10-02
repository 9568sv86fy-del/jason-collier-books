// Small hands-on steps (quick, skippable after the first time).
// cinchGame: strap the trail camera to the trunk. Pull the strap in short tugs until the tension sits in the
// band (too loose and it sags, too hard and the buckle slips), then press it on and arm it.
import { createHands } from "./hands3d.js";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function cinchGame(hud, opts, onDone) {
  const card = hud.overlay(`
    <div class="fg">
      <div class="fg-top"><b id="cgStage">CINCH THE STRAP</b><span id="cgTip">Tug the strap: tap CINCH (or SPACE) in short pulls. Stop in the band.</span></div>
      <canvas id="cgC" width="720" height="380"></canvas>
      <div class="fg-row"><button id="cgPull" class="fg-btn">CINCH</button><button id="cgArm" class="fg-btn" disabled>ARM IT</button></div>
      <div class="fg-row small">${opts.learned ? '<button id="cgSkip" class="fg-btn ghost">STRAP IT (SKIP)</button>' : ""}</div>
    </div>`);
  card.addEventListener("click", (e) => e.stopPropagation());
  const $ = (id) => card.querySelector("#" + id);
  const cv = $("cgC"), g = cv.getContext("2d"), W = cv.width, H = cv.height;
  let hands = null;
  try { hands = createHands(cv, "strap"); } catch (e) { hands = null; }
  const st = { tension: 0.1, set: 0, armed: false, done: false, t: 0, msg: "", msgT: 0, led: 0 };
  const band = [0.68, 0.88];
  const say = (m) => { st.msg = m; st.msgT = 2; };
  const pull = () => {
    if (st.armed || st.done) return;
    st.pullT = 0.25;
    st.tension += 0.13 + Math.random() * 0.05 - (opts.cold || 0) * 0.04;
    if (st.tension > 1) { st.tension = 0.45; say("Too hard. The buckle slips and the strap runs back."); }
  };
  $("cgPull").onclick = pull;
  $("cgArm").onclick = () => {
    if (st.tension < band[0]) { say("It sags on the bark. Snug it up first."); return; }
    st.armed = true; say("Switch on. The red light blinks once and goes dark."); finish(true);
  };
  if (opts.learned) $("cgSkip").onclick = () => finish(true);
  const key = (e) => { if (e.code === "Space") { e.preventDefault(); e.stopPropagation(); if (!e.repeat) pull(); } };
  addEventListener("keydown", key, true);
  function finish(ok) {
    if (st.done) return;
    st.done = true;
    removeEventListener("keydown", key, true);
    setTimeout(() => { if (cv.isConnected) hud.closeOverlay(); onDone(ok); }, 800);
  }
  let last = performance.now();
  function loop(now) {
    if (!cv.isConnected) { hands?.dispose(); hands = null; return; }
    const dt = Math.min(0.25, (now - last) / 1000); last = now;
    st.t += dt; st.msgT -= dt;
    if (!st.armed) st.tension = Math.max(0.05, st.tension - dt * 0.05); // the strap creeps back a little
    const inBand = st.tension >= band[0] && st.tension <= band[1];
    $("cgArm").disabled = !inBand || st.armed;
    if ((opts.auto || window.__autoTactile) && !st.done) { if (st.tension < 0.72) { if (st.t % 0.3 < dt) pull(); } else $("cgArm").onclick(); }
    if (st.armed) st.led += dt;
    draw(inBand);
    requestAnimationFrame(loop);
  }
  function draw(inBand) {
    g.fillStyle = "#0b0c0e"; g.fillRect(0, 0, W, H);
    // spruce trunk with bark ridges
    const tx = W * 0.5;
    const tg = g.createLinearGradient(tx - 120, 0, tx + 120, 0);
    tg.addColorStop(0, "#1a1410"); tg.addColorStop(0.5, "#4a3a2c"); tg.addColorStop(1, "#16110d");
    g.fillStyle = tg; g.fillRect(tx - 120, 0, 240, H);
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 3;
    for (let i = 0; i < 18; i++) { const x = tx - 110 + i * 13; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= H; y += 40) g.lineTo(x + Math.sin(y * 0.05 + i) * 5, y); g.stroke(); }
    // snow on the left side of the bark
    g.fillStyle = "rgba(230,236,242,0.5)"; g.fillRect(tx - 120, 0, 14, H);
    // strap around the trunk; its sag shows the tension
    const sag = (1 - clamp(st.tension, 0, 1)) * 40;
    g.strokeStyle = "#2f3a2a"; g.lineWidth = 22;
    g.beginPath(); g.moveTo(tx - 122, H * 0.5); g.quadraticCurveTo(tx, H * 0.5 + sag, tx + 122, H * 0.5); g.stroke();
    // camera body (camo green box with lens, IR panel, LED)
    const cy = H * 0.5 - 70 + sag * 0.6, tilt = (1 - clamp(st.tension / band[0], 0, 1)) * 0.25;
    g.save(); g.translate(tx, cy + 70); g.rotate(tilt);
    g.fillStyle = "#3d4433"; g.fillRect(-70, -80, 140, 160);
    g.fillStyle = "#23281f"; g.fillRect(-58, -66, 116, 50);
    g.fillStyle = "#111"; g.beginPath(); g.arc(0, 20, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#334"; g.beginPath(); g.arc(-6, 14, 8, 0, Math.PI * 2); g.fill();
    const on = st.armed && st.led < 0.6 && Math.sin(st.led * 20) > 0;
    g.fillStyle = on ? "#ff2a10" : "#300"; g.beginPath(); g.arc(48, 60, 6, 0, Math.PI * 2); g.fill();
    if (on) { g.fillStyle = "rgba(255,40,10,0.35)"; g.beginPath(); g.arc(48, 60, 18, 0, Math.PI * 2); g.fill(); }
    g.restore();
    // gloved hands: 3D when available (left palm on the camera, right fist hauling the strap tail)
    st.pullT = Math.max(0, (st.pullT || 0) - 1 / 60);
    if (hands) hands.update({ show: true, props: false, pose: "strap", lx: tx - 20, ly: cy + 95, rx: tx + 180 + st.pullT * 60, ry: H * 0.5 + 30, pull: st.pullT * 4 });
    else { g.fillStyle = "#3b2c20"; g.beginPath(); g.ellipse(tx + 170, H * 0.5 + 10, 48, 30, -0.3, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = "#2f3a2a"; g.lineWidth = 14; g.beginPath(); g.moveTo(tx + 122, H * 0.5); g.lineTo(tx + 160, H * 0.5 + 8); g.stroke();
    // tension gauge
    const gx = 40, gy = 40, gw = 22, gh = H - 80;
    g.fillStyle = "rgba(236,230,218,0.15)"; g.fillRect(gx, gy, gw, gh);
    g.fillStyle = "rgba(120,200,120,0.35)"; g.fillRect(gx, gy + gh * (1 - band[1]), gw, gh * (band[1] - band[0]));
    g.fillStyle = inBand ? "#9fe09f" : st.tension > band[1] ? "#d9631e" : "#ece6da";
    g.fillRect(gx - 4, gy + gh * (1 - clamp(st.tension, 0, 1)) - 2, gw + 8, 4);
    g.fillStyle = "rgba(236,230,218,0.7)"; g.font = "12px sans-serif"; g.fillText("TENSION", gx - 10, gy - 10);
    if (st.msgT > 0) { g.fillStyle = `rgba(236,230,218,${Math.min(1, st.msgT)})`; g.font = "italic 17px serif"; g.textAlign = "center"; g.fillText(st.msg, W / 2, H - 16); g.textAlign = "left"; }
  }
  requestAnimationFrame(loop);
  return st;
}
