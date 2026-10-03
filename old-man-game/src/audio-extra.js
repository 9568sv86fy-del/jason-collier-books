// More procedural sound for v2: the creature up close, the Colt, the camera, the fire bed.
import { bus, env, getCtx, getMaster, noise, rifleShot, setMuted } from "./audio.js";

let isMuted = false;
let fireGain = null, fireTimer = null, fireLvl = 0;
let breathGain = null, breathTimer = null;

const ok = () => {
  const a = getCtx();
  return a && getMaster() && a.state === "running" ? a : null;
};
export function init() { ok(); }
export const muted = () => isMuted;
export function toggleMute() { isMuted = !isMuted; setMuted(isMuted); }

function burst(a, t, dur, f, q, peak, out, type = "bandpass") {
  const src = a.createBufferSource();
  src.buffer = noise(dur + 0.05);
  const bp = a.createBiquadFilter();
  bp.type = type;
  bp.frequency.value = f;
  bp.Q.value = q;
  const g = a.createGain();
  env(g, t, 0.004, peak, dur);
  src.connect(bp); bp.connect(g); g.connect(out);
  src.start(t);
  src.stop(t + dur + 0.1);
}
function tone(a, t, f0, f1, dur, peak, out, type = "sine") {
  const o = a.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = a.createGain();
  env(g, t, 0.01, peak, dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.05);
}

export function truckDoor() {
  const a = ok(); if (!a) return;
  const t = a.currentTime + 0.05, out = bus(0.2, 0.6);
  burst(a, t, 0.18, 400, 0.8, 0.5, out, "lowpass");
  tone(a, t, 120, 50, 0.2, 0.3, out);
  burst(a, t + 0.02, 0.05, 3000, 2, 0.15, out);
}
export function stick() {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.8);
  burst(a, t, 0.05, 1800, 3, 0.25, out);
  burst(a, t + 0.06, 0.04, 2400, 3, 0.15, out);
}
export function lighter() {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.7);
  burst(a, t, 0.03, 5000, 4, 0.2, out);
  burst(a, t + 0.08, 0.6, 900, 0.6, 0.12, out, "lowpass");
}
export function beep() {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.9);
  tone(a, t, 2200, 2200, 0.06, 0.06, out, "square");
  tone(a, t + 0.1, 2200, 2200, 0.06, 0.06, out, "square");
}
export function glass() {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.8);
  burst(a, t, 0.12, 700, 1.5, 0.08, out);
}
export function work(secs) {
  const a = ok(); if (!a) return;
  const out = bus(0, 0.8);
  for (let i = 0; i < secs * 3; i++) {
    const t = a.currentTime + i * 0.33 + Math.random() * 0.08;
    burst(a, t, 0.08, 500 + Math.random() * 900, 1.2, 0.12, out);
  }
}
/** a shriek of strings and noise: something seen that should not be there */
export function sting() {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.5);
  for (const f of [466, 493, 523, 554]) {
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * 0.5, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.12);
    const g = a.createGain();
    env(g, t, 0.02, 0.035, 1.6);
    const bp = a.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 1.4;
    o.connect(bp); bp.connect(g); g.connect(out);
    o.start(t); o.stop(t + 1.8);
  }
  tone(a, t, 70, 32, 1.2, 0.25, out);
}
export function shot(colt) {
  if (!colt) { rifleShot(); return; }
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.8);
  burst(a, t, 0.12, 1200, 0.5, 0.9, out, "lowpass");
  tone(a, t, 160, 45, 0.25, 0.6, out);
}
/** first time it makes a sound you can't explain: a deep grinding bellow */
export function roar() {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(0, 0.6);
  for (const [f, d] of [[62, 0], [65.5, 0.03], [93, 0.01]]) {
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f * 1.3, t + d);
    o.frequency.linearRampToValueAtTime(f, t + 0.5);
    o.frequency.linearRampToValueAtTime(f * 0.7, t + 1.8);
    const lp = a.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 6;
    const g = a.createGain();
    env(g, t + d, 0.08, 0.22, 1.8);
    const lfo = a.createOscillator();
    lfo.frequency.value = 23;
    const lg = a.createGain(); lg.gain.value = 0.12;
    lfo.connect(lg); lg.connect(g.gain);
    o.connect(lp); lp.connect(g); g.connect(out);
    o.start(t + d); o.stop(t + 2); lfo.start(t); lfo.stop(t + 2);
  }
  burst(a, t, 1.6, 300, 0.7, 0.25, out, "lowpass");
}
export function crash(pan = 0) {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(pan, 0.6);
  for (let i = 0; i < 9; i++) burst(a, t + i * 0.09 + Math.random() * 0.05, 0.12, 600 + Math.random() * 1600, 1, 0.25 - i * 0.02, out);
}
export function snapAt(pan = 0) {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(pan, 0.7);
  burst(a, t, 0.04, 2500, 2, 0.5, out);
  burst(a, t + 0.03, 0.12, 900, 1, 0.2, out);
}
export function heavyStep(pan = 0) {
  const a = ok(); if (!a) return;
  const t = a.currentTime, out = bus(pan, 0.9);
  burst(a, t, 0.14, 380, 0.9, 0.45, out, "lowpass");
  tone(a, t, 70, 38, 0.18, 0.35, out);
  burst(a, t + 0.02, 0.07, 1600, 1.2, 0.12, out);
}
/** close, wet breathing just behind your shoulder */
export function breathing(on, pan = 0, heavy = false) {
  const a = ok(); if (!a) return;
  if (!on) { if (breathTimer) clearInterval(breathTimer); breathTimer = null; return; }
  if (breathTimer) return;
  const out = bus(pan, 1.0);
  const peak = heavy ? 0.28 : 0.16;
  const one = () => {
    const t = a.currentTime;
    burst(a, t, heavy ? 0.55 : 0.9, heavy ? 280 : 380, 1.4, peak, out);
    burst(a, t + (heavy ? 0.7 : 1.2), heavy ? 0.7 : 1.1, 240, 1.2, peak * 0.75, out);
  };
  one();
  breathTimer = setInterval(one, heavy ? 1500 : 2600);
}
/** something far off in the timber, quiet enough to doubt */
export function distant(pan = 0.4) {
  const a = ok(); if (!a) return;
  const t = a.currentTime + 0.35, out = bus(pan, 0.25);
  tone(a, t, 92, 64, 1.6, 0.045, out);
  tone(a, t + 1.7, 70, 48, 1.3, 0.03, out);
}
/** continuous crackle bed, level 0..1 by distance to the fire */
export function fireLevel(level) {
  const a = ok(); if (!a) return;
  fireLvl = level;
  if (!fireGain) {
    fireGain = a.createGain();
    fireGain.gain.value = 0;
    fireGain.connect(getMaster());
    const src = a.createBufferSource();
    src.buffer = noise(2);
    src.loop = true;
    const lp = a.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 500;
    const g = a.createGain(); g.gain.value = 0.25;
    src.connect(lp); lp.connect(g); g.connect(fireGain);
    src.start();
    const pop = () => {
      fireTimer = setTimeout(pop, 60 + Math.random() * 320);
      if (fireLvl < 0.02) return;
      const t = a.currentTime;
      burst(a, t, 0.02 + Math.random() * 0.03, 1500 + Math.random() * 3000, 2, 0.08 + Math.random() * 0.25, fireGain);
    };
    pop();
  }
  fireGain.gain.setTargetAtTime(level * 0.5, a.currentTime, 0.3);
}
