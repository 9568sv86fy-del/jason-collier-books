const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const NIGHT = {
  skyTop: hex("#03060c"),
  skyHorizon: hex("#1a2538"),
  amb: [0.4, 0.46, 0.66],
  fog: hex("#131b2a"),
  fogDensity: 0.7,
  dark: 0.9,
  ridgeFar: hex("#121a26"),
  ridgeNear: hex("#0a0f16"),
  glow: 0,
  glowColor: hex("#000000")
};
const KEYS = [
  [0, NIGHT],
  [270, NIGHT],
  [325, { skyTop: hex("#0b1222"), skyHorizon: hex("#3b3c52"), amb: [0.56, 0.58, 0.72], fog: hex("#2a2e40"), fogDensity: 0.8, dark: 0.55, ridgeFar: hex("#2a3142"), ridgeNear: hex("#161c28"), glow: 0.25, glowColor: hex("#b06048") }],
  [360, { skyTop: hex("#26324a"), skyHorizon: hex("#e0a47c"), amb: [0.8, 0.72, 0.7], fog: hex("#9c8478"), fogDensity: 0.9, dark: 0.12, ridgeFar: hex("#6c6a78"), ridgeNear: hex("#3a3d4c"), glow: 0.7, glowColor: hex("#ffb27a") }],
  [450, { skyTop: hex("#5c7894"), skyHorizon: hex("#d9cbb8"), amb: [1, 0.97, 0.94], fog: hex("#b8b4ac"), fogDensity: 0.45, dark: 0, ridgeFar: hex("#7d8a98"), ridgeNear: hex("#46525e"), glow: 0.2, glowColor: hex("#ffd2a0") }],
  [720, { skyTop: hex("#7894ac"), skyHorizon: hex("#d6d4cc"), amb: [1.06, 1.04, 1.02], fog: hex("#bcc0c4"), fogDensity: 0.24, dark: 0, ridgeFar: hex("#8a98a6"), ridgeNear: hex("#4c5864"), glow: 0, glowColor: hex("#ffffff") }],
  [930, { skyTop: hex("#6a7f98"), skyHorizon: hex("#d8bea0"), amb: [1, 0.92, 0.84], fog: hex("#b0a090"), fogDensity: 0.4, dark: 0, ridgeFar: hex("#7a8090"), ridgeNear: hex("#454c58"), glow: 0.25, glowColor: hex("#ffb070") }],
  [1035, { skyTop: hex("#2a2030"), skyHorizon: hex("#d27444"), amb: [0.86, 0.6, 0.48], fog: hex("#7a4a3c"), fogDensity: 0.62, dark: 0.1, ridgeFar: hex("#4a3a44"), ridgeNear: hex("#2a2228"), glow: 0.85, glowColor: hex("#ff8040") }],
  [1100, { skyTop: hex("#0e1224"), skyHorizon: hex("#4a3a52"), amb: [0.6, 0.58, 0.72], fog: hex("#2c2c40"), fogDensity: 0.72, dark: 0.5, ridgeFar: hex("#262838"), ridgeNear: hex("#141622"), glow: 0.3, glowColor: hex("#a04838") }],
  [1170, NIGHT],
  [1440, NIGHT]
];
const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function lightAt(minutes, moon = 0.5, storm = 0) {
  const m = (minutes % 1440 + 1440) % 1440;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= m) i++;
  const [ma, a] = KEYS[i];
  const [mb, b] = KEYS[i + 1];
  const t0 = mb === ma ? 0 : (m - ma) / (mb - ma);
  const t = t0 * t0 * (3 - 2 * t0);
  const l = {
    skyTop: mix3(a.skyTop, b.skyTop, t),
    skyHorizon: mix3(a.skyHorizon, b.skyHorizon, t),
    amb: mix3(a.amb, b.amb, t),
    fog: mix3(a.fog, b.fog, t),
    fogDensity: lerp(a.fogDensity, b.fogDensity, t),
    dark: lerp(a.dark, b.dark, t),
    ridgeFar: mix3(a.ridgeFar, b.ridgeFar, t),
    ridgeNear: mix3(a.ridgeNear, b.ridgeNear, t),
    glow: lerp(a.glow, b.glow, t),
    glowColor: mix3(a.glowColor, b.glowColor, t)
  };
  if (l.dark > 0.3) {
    const k = Math.min(1, (l.dark - 0.3) / 0.6);
    l.dark -= moon * 0.12 * k;
    l.amb = mix3(l.amb, [0.62, 0.7, 0.9], moon * 0.35 * k);
  }
  if (storm > 0) {
    const grey = [l.fog[0] * 0.5 + 70, l.fog[1] * 0.5 + 72, l.fog[2] * 0.5 + 76];
    l.fog = mix3(l.fog, grey, storm * (1 - l.dark));
    l.fogDensity = Math.min(1, l.fogDensity + storm * 0.35);
    l.amb = mix3(l.amb, [l.amb[0] * 0.82, l.amb[1] * 0.84, l.amb[2] * 0.9], storm);
    l.glow *= 1 - storm;
  }
  return l;
}
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
function snowAt(day, minutes) {
  const base = [0, 0.15, 0.05, 0.45, 0.25, 0.7, 0.55, 0.9, 0.9][Math.min(8, Math.max(0, day))] ?? 0.4;
  const m = (minutes % 1440 + 1440) % 1440;
  const nightBoost = m < 330 || m > 1080 ? 0.2 : 0;
  const wobble = Math.sin(day * 3.1 + m / 47) * 0.12;
  return Math.max(0, Math.min(1, base + nightBoost + wobble));
}
function moonOf(day) {
  return [0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1, 1, 1][Math.min(8, Math.max(0, day))] ?? 0.5;
}
export {
  lightAt,
  moonOf,
  rgb,
  snowAt
};
