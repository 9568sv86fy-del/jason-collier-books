// Original procedural wind, swings, and a quiet trail melody. No recorded music.
export function createAudio() {
  let ctx = null;
  let master = null;
  let windGain = null;
  let musicGain = null;
  let started = false;
  let stepAt = 0;
  let tension = 0;

  function context() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
    }
    return ctx;
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
    g.connect(master);
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
      og.connect(master);
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
    windGain.connect(master);
    src.start();
  }

  let musicTimer = null;
  function ensureMusic() {
    const audio = context();
    if (!audio || musicGain) return;
    musicGain = audio.createGain();
    musicGain.gain.value = 0.035;
    musicGain.connect(master);
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

  return {
    unlock() {
      const audio = context();
      if (!audio) return;
      started = true;
      const go = () => {
        try {
          ensureWind();
          ensureMusic();
        } catch { /* headless audio can refuse a node; the picture still plays */ }
      };
      if (audio.state === "suspended") audio.resume().then(go).catch(() => {});
      else go();
    },
    setTension(v) { tension = v; },
    swing() { burst({ dur: 0.09, freq: 900, type: "highpass", gain: 0.12, q: 0.6 }); },
    hit() { burst({ dur: 0.1, freq: 180, type: "lowpass", gain: 0.28, from: 220, to: 70 }); },
    hurt() { burst({ dur: 0.16, freq: 140, type: "lowpass", gain: 0.22, from: 180, to: 60 }); },
    flash() { burst({ dur: 0.28, freq: 1400, type: "bandpass", gain: 0.16, q: 4, from: 660, to: 1320 }); },
    chest() { burst({ dur: 0.14, freq: 320, type: "bandpass", gain: 0.2, q: 2, from: 520, to: 180 }); },
    roar() { burst({ dur: 0.45, freq: 90, type: "lowpass", gain: 0.32, from: 90, to: 40 }); },
    step() {
      const now = performance.now();
      if (now - stepAt < 280) return;
      stepAt = now;
      burst({ dur: 0.05, freq: 160, type: "lowpass", gain: 0.05 });
    },
    dispose() {
      if (musicTimer) clearTimeout(musicTimer);
      try { ctx && ctx.close(); } catch { /* ignore */ }
    },
  };
}
