// Harlan's inner voice. Short lines, always spoken when the game sound is on.
// Clips are pre-rendered (Piper, northern English male, pitched down). If a clip
// fails to load, fall back to speechSynthesis with the lowest male voice.
import { getCtx, getMaster } from "./audio.js";

export const THOUGHTS = {
  tracks: "Not elk.",
  elk: "He's close.",
  night: "Dark already.",
  hear: "That wasn't wind.",
  nerve: "Hold together.",
  fire: "Stay in the light.",
  card: "It knows the lens.",
  sign: "Wrong kind of track.",
  eyes: "Eyes in the timber.",
  timber: "Too quiet in here.",
  retreat: "It stepped off.",
  missed: "Too slow.",
  dawn: "Light. For now.",
  close: "Something's here.",
  camp: "Fire's the only wall.",
};

const buffers = {};
let tried = false;
let voice = null;
let current = null;

export function preloadThoughts() {
  if (tried) return;
  tried = true;
  const audio = getCtx();
  if (!audio) return;
  for (const id of Object.keys(THOUGHTS)) {
    fetch(`./assets/voice/${id}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((b) => audio.decodeAudioData(b))
      .then((buf) => { buffers[id] = buf; })
      .catch(() => {});
  }
  const pick = () => {
    const list = window.speechSynthesis?.getVoices?.() || [];
    const men = list.filter((v) => /male|david|daniel|fred|alex|aaron|gordon|ralph|albert|rishi|arthur|daniel/i.test(v.name) && !/female|samantha|victoria|karen|moira|tessa|serena|allison/i.test(v.name));
    men.sort((a, b) => (a.lang || "").startsWith("en") - (b.lang || "").startsWith("en"));
    // lowest-listed male; pitch is forced down at speak time
    voice = men[0] || list.find((v) => (v.lang || "").startsWith("en")) || null;
  };
  try {
    pick();
    window.speechSynthesis?.addEventListener?.("voiceschanged", pick);
  } catch { /* no speech API */ }
}

function fallbackSpeak(text) {
  const ss = window.speechSynthesis;
  if (!ss || typeof SpeechSynthesisUtterance === "undefined") return;
  try { ss.cancel(); } catch { /* ignore */ }
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "en-US";
  u.pitch = 0.35;
  u.rate = 0.84;
  u.volume = 1;
  ss.speak(u);
}

/** Play a thought. Returns the subtitle, or null if the id is unknown. */
export function speakThought(id, soundOn) {
  const text = THOUGHTS[id];
  if (!text) return null;
  if (!soundOn) {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
    return text;
  }
  const audio = getCtx();
  const master = getMaster();
  const buf = buffers[id];
  if (audio && master && buf) {
    if (current) { try { current.stop(); } catch { /* ignore */ } }
    const src = audio.createBufferSource();
    src.buffer = buf;
    const g = audio.createGain();
    g.gain.value = 1.55;
    src.connect(g);
    g.connect(master);
    src.start();
    current = src;
    src.onended = () => { if (current === src) current = null; };
    return text;
  }
  fallbackSpeak(text);
  return text;
}

export function stopThought() {
  if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
