// Automatic quality tier. high: desktop GPUs. medium: phones/tablets. low: FPS fallback.
// Override with ?q=high|medium|low. The tier decides texture size, shadows, post effects and density.
const params = new URLSearchParams(location.search);
const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900);
let tier = params.get("q") || (mobile ? "medium" : "high");
if (!["high", "medium", "low"].includes(tier)) tier = "medium";
const saved = sessionStorage.getItem("oldman-tier-drop");
if (!params.get("q") && saved && ["medium", "low"].includes(saved) && rank(saved) < rank(tier)) tier = saved;
function rank(t) { return t === "high" ? 2 : t === "medium" ? 1 : 0; }
export const Q = {
  tier, mobile,
  /** an explicit ?q= pins the tier: no automatic effect shedding (used by the headless tests) */
  locked: !!params.get("q"),
  get high() { return tier === "high"; },
  get medium() { return tier === "medium"; },
  texDir: tier === "high" ? "1k" : "512",
  shadows: tier !== "low",
  shadowSize: tier === "high" ? 2048 : 1024,
  bloom: tier !== "low",
  ao: tier === "high",
  pbrTrees: tier !== "low",
  maxDpr: tier === "high" ? 1.75 : tier === "medium" ? 2 : 1.25,
  maxPixels: tier === "high" ? 2.6e6 : tier === "medium" ? 1.3e6 : 0.7e6,
  density: tier === "high" ? 1 : tier === "medium" ? 0.85 : 0.65,
  /** remember a drop for the session (FPS fallback) and reload the cheaper tier on the next start */
  drop() {
    const next = tier === "high" ? "medium" : "low";
    if (next === tier) return false;
    sessionStorage.setItem("oldman-tier-drop", next);
    return next;
  },
};
