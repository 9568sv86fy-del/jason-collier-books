// Original procedural wind, swings, and a quiet trail melody. No recorded music.
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export function createAudio() {
  let ctx = null;
  let master = null;
  let sfxGain = null;
  let bedGain = null;
  let voiceGain = null;
  let windGain = null;
  let musicGain = null;
  let started = false;
  let primed = false;
  let speaking = false;
  let ducked = false;
  let stepAt = 0;
  let tension = 0;
  let mediaEl = null;
  let mediaNode = null;
  let mediaGen = 0;
  let voiceSrc = null;
  const clipCache = new Map();
  let unlockedP = null;
  let markUnlocked = null;
  let voiceOwner = null;
  let companionGen = 0;
  let companionCancel = null;
  let mediaUnlocked = false;
  let primeP = null;
  let gate = Promise.resolve();

  function context() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.connect(master);
      bedGain = ctx.createGain();
      bedGain.connect(master);
      voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.95;
      voiceGain.connect(master);
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function whenUnlocked() {
    if (!unlockedP) unlockedP = new Promise((resolve) => { markUnlocked = resolve; });
    return unlockedP;
  }

  function ramp(param, value, seconds) {
    const audio = context();
    if (!audio || !param) return;
    const t = audio.currentTime;
    const from = param.value;
    param.cancelScheduledValues(t);
    param.setValueAtTime(from, t);
    param.linearRampToValueAtTime(value, t + seconds);
  }

  function setDuck(active) {
    ducked = active;
    const sfxTarget = active ? 0.12 : 1;
    const bedTarget = active ? 0.38 : 1;
    ramp(sfxGain && sfxGain.gain, sfxTarget, 0.1);
    ramp(bedGain && bedGain.gain, bedTarget, 0.1);
    if (sfxGain) sfxGain.gain.value = sfxTarget;
    if (bedGain) bedGain.gain.value = bedTarget;
  }

  function noise(seconds) {
    const audio = context();
    if (!audio) return null;
    const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * seconds), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function burst(opts) {
    const audio = context();
    if (!audio || !started || !master) return;
    const { dur = 0.12, freq = 240, type = "bandpass", gain = 0.2, q = 0.8, from = null, to = null } = opts;
    const src = audio.createBufferSource();
    src.buffer = noise(dur + 0.05);
    const filter = audio.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = audio.createGain();
    const t = audio.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(sfxGain || master);
    src.start(t);
    src.stop(t + dur + 0.02);
    if (from != null) {
      const osc = audio.createOscillator();
      osc.type = "sine";
      const og = audio.createGain();
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, to || from), t + dur);
      og.gain.setValueAtTime(gain * 0.45, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(og);
      og.connect(sfxGain || master);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
  }

  function ensureWind() {
    const audio = context();
    if (!audio || windGain) return;
    const src = audio.createBufferSource();
    src.buffer = noise(2);
    src.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    windGain = audio.createGain();
    windGain.gain.value = 0.045;
    src.connect(filter);
    filter.connect(windGain);
    windGain.connect(bedGain || master);
    src.start();
  }

  let musicTimer = null;
  function ensureMusic() {
    const audio = context();
    if (!audio || musicGain) return;
    musicGain = audio.createGain();
    musicGain.gain.value = 0.035;
    musicGain.connect(bedGain || master);
    const drone = audio.createOscillator();
    drone.type = "triangle";
    drone.frequency.value = 110;
    const dg = audio.createGain();
    dg.gain.value = 0.35;
    drone.connect(dg);
    dg.connect(musicGain);
    drone.start();
    const notes = [220, 247, 262, 294, 330, 294, 262, 247];
    let i = 0;
    const tick = () => {
      if (!ctx || !musicGain) return;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const g = ctx.createGain();
      const t = ctx.currentTime;
      const f = notes[i % notes.length] * (tension > 0.5 ? 0.5 : 1);
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(tension > 0.5 ? 0.22 : 0.16, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (tension > 0.5 ? 0.42 : 0.7));
      osc.connect(g);
      g.connect(musicGain);
      osc.start(t);
      osc.stop(t + 0.8);
      i++;
      musicTimer = window.setTimeout(tick, tension > 0.5 ? 480 : 860);
    };
    tick();
  }

  function lock() {
    let release;
    const held = new Promise((resolve) => { release = resolve; });
    const ready = gate.then(() => release, () => release);
    gate = gate.then(() => held, () => held);
    return ready;
  }

  function sleep(ms) {
    return new Promise((resolve) => { window.setTimeout(resolve, ms); });
  }

  function ensureMedia() {
    if (mediaEl) return mediaEl;
    mediaEl = new Audio();
    mediaEl.playsInline = true;
    mediaEl.setAttribute("playsinline", "");
    mediaEl.setAttribute("webkit-playsinline", "true");
    mediaEl.preload = "none";
    return mediaEl;
  }

  function hookMedia() {
    const audio = context();
    if (!audio || !mediaEl || mediaNode) return;
    try {
      mediaNode = audio.createMediaElementSource(mediaEl);
      mediaNode.connect(voiceGain || master);
    } catch { mediaNode = null; }
  }

  function voiceLevel() {
    const v = voiceGain ? voiceGain.gain.value : 0.95;
    const m = master ? master.gain.value : 0.8;
    return Math.max(0, Math.min(1, v * m));
  }

  function primeMedia() {
    if (mediaUnlocked) return Promise.resolve(true);
    if (voiceOwner) return Promise.resolve(false);
    if (primeP) return primeP;
    const el = ensureMedia();
    hookMedia();
    el.src = SILENT_WAV;
    const gen = ++mediaGen;
    primeP = new Promise((resolve) => {
      const finish = (ok) => {
        if (gen !== mediaGen) { primeP = null; resolve(false); return; }
        if (ok) {
          mediaUnlocked = true;
          try { el.pause(); } catch { /* the gesture already counted */ }
        }
        primeP = null;
        resolve(!!ok);
      };
      try {
        const played = el.play();
        if (played && played.then) played.then(() => finish(true)).catch(() => finish(false));
        else finish(true);
      } catch { finish(false); }
    });
    return primeP;
  }

  function playElement(url) {
    return new Promise((resolve) => {
      const el = ensureMedia();
      hookMedia();
      mediaGen += 1;
      if (!mediaNode) el.volume = voiceLevel();
      else el.volume = 1;
      speaking = true;
      setDuck(true);
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        speaking = false;
        setDuck(false);
        resolve(ok);
      };
      el.onended = () => finish(true);
      el.onerror = () => finish(false);
      el.src = url;
      const played = el.play();
      if (played && played.then) played.then(() => { mediaUnlocked = true; }).catch(() => {});
      if (played && played.catch) played.catch(() => finish(false));
    });
  }

  function playCompanionElement(url, gen) {
    return new Promise((resolve) => {
      const el = ensureMedia();
      hookMedia();
      if (!mediaNode) el.volume = voiceLevel();
      else el.volume = 1;
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        if (companionCancel === cancel) companionCancel = null;
        if (gen === companionGen && voiceOwner === "companion") {
          speaking = false;
          setDuck(false);
          voiceOwner = null;
        }
        resolve(result);
      };
      const cancel = () => {
        try { el.pause(); } catch { /* already quiet */ }
        el.onended = null;
        el.onerror = null;
        finish(false);
      };
      companionCancel = cancel;
      el.onended = () => finish(gen === companionGen);
      el.onerror = () => finish(false);
      speaking = true;
      voiceOwner = "companion";
      setDuck(true);
      mediaGen += 1;
      try { el.pause(); } catch { /* ignore */ }
      el.src = url;
      let played = null;
      try { played = el.play(); } catch (err) {
        const blocked = err && err.name === "NotAllowedError";
        finish(blocked ? "blocked" : false);
        return;
      }
      if (played && played.then) {
        played.then(() => { mediaUnlocked = true; }).catch((err) => {
          const blocked = err && (err.name === "NotAllowedError" || err.name === "AbortError");
          finish(blocked ? "blocked" : false);
        });
      }
    });
  }

  async function playCompanion(url) {
    const gen = ++companionGen;
    if (companionCancel) companionCancel();
    if (voiceOwner === "companion") {
      voiceOwner = null;
      speaking = false;
      setDuck(false);
    }
    await whenUnlocked();
    if (gen !== companionGen) return false;
    let result = "blocked";
    let tries = 0;
    while (result === "blocked" && gen === companionGen && tries < 4) {
      tries += 1;
      if (primeP) await primeP;
      if (!mediaUnlocked) {
        await new Promise((resolve) => {
          const timer = window.setInterval(() => {
            if (mediaUnlocked || gen !== companionGen) {
              window.clearInterval(timer);
              resolve();
            }
          }, 40);
        });
      }
      if (gen !== companionGen) return false;
      const release = await lock();
      try {
        if (gen !== companionGen) return false;
        voiceOwner = "companion";
        result = await playCompanionElement(url, gen);
      } finally {
        if (voiceOwner === "companion") voiceOwner = null;
        release();
      }
    }
    return result === true;
  }

  async function playOne(url) {
    await whenUnlocked();
    const audio = context();
    if (!audio || !started) return false;
    try {
      let decoded = clipCache.get(url);
      if (!decoded) {
        const res = await fetch(url);
        if (!res.ok) return false;
        const raw = await res.arrayBuffer();
        decoded = await audio.decodeAudioData(raw.slice(0));
        clipCache.set(url, decoded);
      }
      return await new Promise((resolve) => {
        if (voiceSrc) {
          try { voiceSrc.onended = null; voiceSrc.stop(); } catch { /* already ended */ }
          voiceSrc = null;
        }
        const src = audio.createBufferSource();
        src.buffer = decoded;
        src.connect(voiceGain || master);
        voiceSrc = src;
        speaking = true;
        setDuck(true);
        const finish = (ok) => {
          if (voiceSrc === src) voiceSrc = null;
          speaking = false;
          setDuck(false);
          resolve(ok);
        };
        src.onended = () => finish(true);
        try { src.start(); } catch { finish(false); }
      });
    } catch {
      return playElement(url);
    }
  }

  return {
    unlock() {
      const audio = context();
      if (!audio) return;
      started = true;
      whenUnlocked();
      if (!primed) {
        primed = true;
        try {
          const blip = audio.createBufferSource();
          blip.buffer = audio.createBuffer(1, 1, audio.sampleRate);
          blip.connect(master);
          blip.start();
        } catch { /* a suspended context still accepts the gesture */ }
      }
      primeMedia();
      const go = () => {
        try {
          ensureWind();
          ensureMusic();
        } catch { /* headless audio can refuse a node; the picture still plays */ }
        if (markUnlocked) {
          const done = markUnlocked;
          markUnlocked = null;
          done();
        }
      };
      if (audio.state === "suspended") audio.resume().then(go).catch(go);
      else go();
    },
    speaking() { return speaking; },
    levels() {
      return {
        sfx: sfxGain ? sfxGain.gain.value : null,
        bed: bedGain ? bedGain.gain.value : null,
        ducked,
        speaking,
        owner: voiceOwner,
      };
    },
    playClip(url) {
      return (async () => {
        const release = await lock();
        voiceOwner = "narration";
        try { return await playOne(url); }
        finally {
          if (voiceOwner === "narration") voiceOwner = null;
          release();
        }
      })();
    },
    playCompanion,
    cancelCompanion() {
      companionGen += 1;
      if (companionCancel) companionCancel();
      if (voiceOwner === "companion") {
        voiceOwner = null;
        speaking = false;
        setDuck(false);
      }
    },
    warm(urls) {
      const queue = (urls || []).filter(Boolean);
      const run = () => {
        const url = queue.shift();
        if (!url) return;
        fetch(url).catch(() => {}).finally(() => {
          const ric = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 70));
          ric(run);
        });
      };
      window.setTimeout(() => {
        const ric = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 0));
        ric(run);
      }, 1800);
    },
    setTension(v) { tension = v; },
    swing() { burst({ dur: 0.09, freq: 900, type: "highpass", gain: 0.12, q: 0.6 }); },
    hit() { burst({ dur: 0.1, freq: 180, type: "lowpass", gain: 0.28, from: 220, to: 70 }); },
    hurt() { burst({ dur: 0.16, freq: 140, type: "lowpass", gain: 0.22, from: 180, to: 60 }); },
    flash() { burst({ dur: 0.28, freq: 1400, type: "bandpass", gain: 0.16, q: 4, from: 660, to: 1320 }); },
    chest() { burst({ dur: 0.14, freq: 320, type: "bandpass", gain: 0.2, q: 2, from: 520, to: 180 }); },
    roar() { burst({ dur: 0.45, freq: 90, type: "lowpass", gain: 0.32, from: 90, to: 40 }); },
    dial() { burst({ dur: 0.16, freq: 480, type: "bandpass", gain: 0.14, q: 3, from: 240, to: 720 }); },
    staticBurst() { burst({ dur: 0.55, freq: 2200, type: "highpass", gain: 0.14, q: 0.35 }); },
    step() {
      const now = performance.now();
      if (now - stepAt < 280) return;
      stepAt = now;
      burst({ dur: 0.05, freq: 160, type: "lowpass", gain: 0.05 });
    },
    jump() { burst({ dur: 0.08, freq: 420, type: "bandpass", gain: 0.08, q: 0.7, from: 280, to: 520 }); },
    parry() { burst({ dur: 0.12, freq: 1400, type: "highpass", gain: 0.2, q: 2, from: 880, to: 220 }); },
    guard() { burst({ dur: 0.07, freq: 240, type: "lowpass", gain: 0.16, from: 160, to: 90 }); },
    heal() { burst({ dur: 0.22, freq: 660, type: "bandpass", gain: 0.12, q: 3, from: 520, to: 990 }); },
    coin() { burst({ dur: 0.06, freq: 1200, type: "highpass", gain: 0.08, q: 2, from: 880, to: 1320 }); },
    wind() { burst({ dur: 0.32, freq: 700, type: "bandpass", gain: 0.16, q: 0.6, from: 240, to: 90 }); },
    finisher() { burst({ dur: 0.16, freq: 110, type: "lowpass", gain: 0.34, from: 180, to: 48 }); },
    level() { burst({ dur: 0.28, freq: 520, type: "bandpass", gain: 0.14, q: 4, from: 440, to: 880 }); },
    dispose() {
      if (musicTimer) clearTimeout(musicTimer);
      try { ctx && ctx.close(); } catch { /* ignore */ }
    },
  };
}
