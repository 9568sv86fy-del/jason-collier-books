// Harlan's inner voice. Short mutters, always spoken when the game sound is on.
// Several variants per moment; the speaker never repeats the line he just said.
// Clips are pre-rendered (Piper, northern English male, pitched down, unhurried).
// If a clip fails to load, fall back to speechSynthesis with the pitch forced down.
import { getCtx, getMaster } from "./audio.js";

export const LINES = {
  tracks: ["Ain't elk.", "Too big for a deer.", "Heavy. Real heavy."],
  elk: ["He's close.", "Still warm.", "Bull came through."],
  night: ["Dark already.", "Sun's down.", "Long night."],
  hear: ["That wasn't wind.", "I heard that.", "Something moved."],
  nerve: ["Easy now.", "Breathe.", "Hands steady."],
  fire: ["She took.", "That'll burn.", "Good enough."],
  card: ["Looked right into it.", "Didn't flinch.", "Just stood there."],
  sign: ["Old track.", "Couple days back.", "Nothing fresh."],
  eyes: ["Edge of it.", "Just a piece.", "That ain't a branch."],
  timber: ["Too quiet.", "Birds quit on me.", "Don't like it in here."],
  retreat: ["Stepped off.", "Gone.", "Lost it."],
  missed: ["Too slow.", "Wasn't looking.", "Damn."],
  dawn: ["Light.", "Made it.", "Morning."],
  close: ["Right here.", "It's close.", "Don't move."],
  camp: ["Drawing good.", "Stay by the fire.", "This'll do tonight."],
};

const WHISPER = new Set(["close"]);
const buffers = {};
let tried = false;
let voice = null;
let current = null;
let busyUntil = 0;
const lastPick = {};
let lastText = "";

export function preloadThoughts() {
  if (tried) return;
  tried = true;
  const audio = getCtx();
  if (!audio) return;
  for (const [id, lines] of Object.entries(LINES)) {
    lines.forEach((_, i) => {
      const key = `${id}-${i}`;
      fetch(`./assets/voice/${key}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
        .then((b) => audio.decodeAudioData(b))
        .then((buf) => { buffers[key] = buf; })
        .catch(() => {});
    });
  }
  const pick = () => {
    const list = window.speechSynthesis?.getVoices?.() || [];
    const men = list.filter((v) => /male|david|daniel|fred|alex|aaron|gordon|ralph|albert|rishi|arthur|daniel/i.test(v.name) && !/female|samantha|victoria|karen|moira|tessa|serena|allison/i.test(v.name));
    men.sort((a, b) => (a.lang || "").startsWith("en") - (b.lang || "").startsWith("en"));
    voice = men[0] || list.find((v) => (v.lang || "").startsWith("en")) || null;
  };
  try {
    pick();
    window.speechSynthesis?.addEventListener?.("voiceschanged", pick);
  } catch { /* no speech API */ }
}

export function voiceReady() { return Object.keys(buffers).length; }
export function thoughtBusy() {
  return performance.now() < busyUntil - 60;
}

export function armThought() {
  busyUntil = 0;
}

function fallbackSpeak(text, quiet) {
  const ss = window.speechSynthesis;
  if (!ss || typeof SpeechSynthesisUtterance === "undefined") return;
  try { ss.cancel(); } catch { /* ignore */ }
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "en-US";
  u.pitch = 0.32;
  u.rate = 0.78;
  u.volume = quiet ? 0.45 : 1;
  ss.speak(u);
}

function pickLine(id) {
  const lines = LINES[id];
  const avoid = lastPick[id];
  const choices = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines.length > 1 && i === avoid) continue;
    if (lines.length > 1 && lines[i] === lastText) continue;
    choices.push(i);
  }
  if (!choices.length) for (let i = 0; i < lines.length; i++) if (i !== avoid) choices.push(i);
  if (!choices.length) choices.push(0);
  const i = choices[Math.floor(Math.random() * choices.length)];
  lastPick[id] = i;
  lastText = lines[i];
  return { i, text: lines[i], key: `${id}-${i}` };
}

/** Play one variant. Returns {text, ms} or null if unknown or he is still talking. */
export function speakThought(id, soundOn, opts = {}) {
  const lines = LINES[id];
  if (!lines || !lines.length) return null;
  if (thoughtBusy()) return null;
  const { text, key } = pickLine(id);
  const words = text.split(/\s+/).length;
  const guess = Math.max(1600, Math.round(words * 480 + 700));
  const showFor = (sec) => Math.max(1700, Math.round(sec * 1000 + 550));
  if (!soundOn) {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
    busyUntil = performance.now() + guess;
    return { text, ms: guess };
  }
  const audio = getCtx();
  const master = getMaster();
  const buf = buffers[key];
  if (audio && master && buf) {
    if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
    const src = audio.createBufferSource();
    src.buffer = buf;
    const g = audio.createGain();
    const whisper = WHISPER.has(id);
    g.gain.value = whisper ? Math.min(opts.gain ?? 0.55, 0.7) : (opts.gain ?? 1.2);
    src.connect(g);
    g.connect(master);
    src.start();
    current = src;
    src.onended = () => { if (current === src) current = null; };
    const ms = showFor(buf.duration);
    busyUntil = performance.now() + buf.duration * 1000 + 80;
    return { text, ms };
  }
  fallbackSpeak(text, WHISPER.has(id));
  busyUntil = performance.now() + guess;
  return { text, ms: guess };
}

export function stopThought() {
  if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
  busyUntil = 0;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
