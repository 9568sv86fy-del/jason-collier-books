// Loading progress: every three.js loader (textures, HDR, Harlan's GLBs) reports through the
// DefaultLoadingManager; fetch-based loads (the elk) call track(). Drives the bar on the loading screen.
import * as THREE from "three";
const M = THREE.DefaultLoadingManager;
const st = { loaded: 0, total: 0, done: false, waiters: [] };
const bar = () => document.getElementById("loadBar");
const msg = () => document.getElementById("loadMsg");
function paint() {
  const k = st.total ? st.loaded / st.total : 0;
  if (bar()) bar().style.width = `${Math.round(8 + k * 92)}%`;
  if (msg() && !st.done) msg().textContent = `Loading the mountain… ${Math.round(k * 100)}%`;
  // the same bar on the title card (you can start before it finishes; stand-ins fill in)
  document.querySelectorAll(".loadbar-fill").forEach((e) => (e.style.width = `${Math.round(8 + k * 92)}%`));
  document.querySelectorAll(".loadbar-msg").forEach((e) => (e.textContent = st.done ? "Ready" : `Loading the mountain… ${Math.round(k * 100)}%`));
  document.querySelectorAll(".tload").forEach((e) => e.classList.toggle("done", st.done));
}
setInterval(() => { if (!st.done) paint(); }, 500); // repaint late-mounted bars (title card)
M.onStart = (url, l, t) => { st.loaded = l; st.total = t; st.done = false; paint(); };
M.onProgress = (url, l, t) => { st.loaded = l; st.total = t; paint(); };
M.onLoad = () => { st.done = true; st.loaded = st.total; paint(); st.waiters.splice(0).forEach((f) => f()); };
M.onError = () => {};
/** wrap a fetch-style promise so it counts toward the bar */
export function track(url, p) { M.itemStart(url); return p.finally(() => M.itemEnd(url)); }
/** resolves once everything queued so far has loaded, or after maxMs (we never hold the player hostage) */
export function whenLoaded(maxMs = 12000) {
  return new Promise((res) => {
    let fired = false; const go = () => { if (!fired) { fired = true; res(); } };
    // give the engine a beat to queue its loads before trusting "nothing pending"
    setTimeout(() => { if (st.total === 0 || st.done) go(); else st.waiters.push(go); }, 400);
    setTimeout(go, maxMs);
  });
}
