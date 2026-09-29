/* I Spy scene audio.
   Each picture is a small mix: recorded beds (lazy-loaded), occasional one-shots,
   and a few synthesized parts where no honest CC0 recording existed.
   Sound starts only after a tap. Mute is remembered in localStorage. */
const ISpyAmbience = (() => {
  const BASE = "assets/audio/";
  const LEVEL = 0.55;
  const FADE = 1.7;
  const MUTE_KEY = "ispy-muted";

  const FILES = {
    "wind-grass": "wind-grass.mp3", "wind-open": "wind-open.mp3", "wind-pines": "wind-pines.mp3",
    "wind-storm": "wind-storm.mp3", "birds": "birds.mp3", "birds-yard": "birds-yard.mp3",
    "crickets": "crickets.mp3", "fire": "fire.mp3", "brook": "brook.mp3", "waves": "waves.mp3",
    "gulls": "gulls.mp3", "hooves-walk": "hooves-walk.mp3", "hooves-trot": "hooves-trot.mp3",
    "hooves-gallop": "hooves-gallop.mp3", "wagon": "wagon.mp3", "creak": "creak.mp3",
    "canvas": "canvas.mp3", "steam": "steam.mp3", "paddle": "paddle.mp3", "gravel": "gravel.mp3",
    "murmur": "murmur.mp3", "fry": "fry.mp3", "chew": "chew.mp3",
    "whinny": "whinny.mp3", "whinny-2": "whinny-2.mp3", "neigh": "neigh.mp3", "snort": "snort.mp3",
    "goat": "goat.mp3", "goat-2": "goat-2.mp3", "dog": "dog.mp3", "cow": "cow.mp3",
    "donkey": "donkey.mp3", "hen": "hen.mp3", "rooster": "rooster.mp3",
    "blackbird": "blackbird.mp3", "robin": "robin.mp3", "owl": "owl.mp3", "thunder": "thunder.mp3",
    "laugh": "laugh.mp3", "bell": "bell.mp3", "hammer": "hammer.mp3", "whistle": "whistle.mp3",
    "hiss": "hiss.mp3", "door": "door.mp3", "barn": "barn.mp3", "clink": "clink.mp3",
    "splash": "splash.mp3", "mud": "mud.mp3"
  };

  const L = (src, g, o) => Object.assign({ src, g }, o);
  const clip = (src, g, w, o) => Object.assign({ src, g, w }, o);
  const synth = (name, g, w, o) => Object.assign({ synth: name, g, w }, o);

  /* space picks the reverb. every is the gap, in seconds, between one-shots. */
  const SCENES = {
    "images/jang-and-tom-wagon-masters.jpg": {
      name: "Wagon Masters", space: "open", every: [7, 16],
      layers: [
        L("wind-grass", 0.58, { drift: 1 }),
        L("birds-yard", 0.32),
        L("hooves-walk", 0.3, { pan: -0.28 }),
        L("wagon", 0.24, { pan: 0.32, rate: 0.96 })
      ],
      spots: [
        clip("whinny", 0.5, 2), clip("whinny-2", 0.46, 2), clip("snort", 0.42, 2),
        clip("goat", 0.48, 2), clip("goat-2", 0.44, 1), clip("cow", 0.46, 2),
        clip("hen", 0.36, 2), clip("blackbird", 0.28, 1), synth("jingle", 0.16, 2), synth("alpaca", 0.12, 1)
      ]
    },
    "media/wagonmasters_part1of6_poster.jpg": {
      name: "Beside the Wagon", space: "trees", every: [7, 16],
      layers: [
        L("wind-grass", 0.36, { drift: 1 }),
        L("birds-yard", 0.4),
        L("wagon", 0.18, { pan: 0.2 }),
        L("chew", 0.14, { pan: -0.35 })
      ],
      spots: [
        clip("laugh", 0.32, 3), clip("barn", 0.4, 2), clip("door", 0.32, 1),
        clip("hen", 0.34, 2), clip("whinny", 0.36, 1), clip("snort", 0.34, 2),
        clip("robin", 0.26, 1), clip("rooster", 0.22, 1, { pitch: "tight" })
      ]
    },
    "images/scenes/transcon-s01.jpg": {
      name: "Stagecoach at Sunset", space: "town", every: [7, 15],
      layers: [
        L("murmur", 0.34, { drift: 1 }),
        L("hooves-trot", 0.4, { pan: 0.15 }),
        L("wagon", 0.3, { pan: -0.2 }),
        L("wind-open", 0.22)
      ],
      spots: [
        clip("whinny", 0.48, 2), clip("whinny-2", 0.44, 2), clip("snort", 0.4, 2),
        clip("laugh", 0.28, 2), clip("mud", 0.32, 2), clip("dog", 0.26, 1),
        synth("jingle", 0.14, 1), clip("blackbird", 0.24, 1)
      ]
    },
    "images/scenes/philly-s09.jpg": {
      name: "The Farmyard", space: "trees", every: [6, 15],
      layers: [
        L("wind-pines", 0.28),
        L("birds-yard", 0.46),
        L("hooves-walk", 0.22, { pan: -0.35 }),
        L("chew", 0.12, { pan: 0.4 })
      ],
      spots: [
        clip("whinny", 0.55, 3), clip("whinny-2", 0.5, 2), clip("neigh", 0.4, 1),
        clip("snort", 0.46, 2), clip("hen", 0.38, 2), clip("rooster", 0.28, 1, { pitch: "tight" }),
        clip("dog", 0.3, 1), clip("barn", 0.36, 1), clip("robin", 0.26, 1)
      ]
    },
    "images/scenes/transcon-s10.jpg": {
      name: "The Crash", space: "open", every: [6, 14],
      layers: [
        L("wind-storm", 0.5, { drift: 1 }),
        L("wind-pines", 0.26),
        L("wagon", 0.36, { rate: 1.04 }),
        L("hooves-trot", 0.28, { pan: 0.2 })
      ],
      spots: [
        clip("whinny", 0.52, 2), clip("whinny-2", 0.48, 2), clip("snort", 0.44, 2),
        clip("gravel", 0.34, 2, { cut: 1.5 }), clip("barn", 0.34, 1),
        synth("hawk", 0.2, 1), clip("neigh", 0.36, 1)
      ]
    },
    "images/scenes/philly-s21.jpg": {
      name: "The Horse Race", space: "open", every: [6, 14],
      layers: [
        L("hooves-gallop", 0.62, { pan: -0.25 }),
        L("hooves-gallop", 0.4, { pan: 0.4, rate: 1.06 }),
        L("wind-open", 0.3, { drift: 1 }),
        L("murmur", 0.22)
      ],
      spots: [
        clip("whinny", 0.5, 2), clip("whinny-2", 0.48, 2), clip("snort", 0.44, 2),
        clip("neigh", 0.36, 1), clip("laugh", 0.3, 2)
      ]
    },
    "images/scenes/transcon-s21.jpg": {
      name: "Through the Herd", space: "open", every: [6, 14],
      layers: [
        L("hooves-gallop", 0.5, { pan: -0.3 }),
        L("hooves-trot", 0.34, { pan: 0.35, rate: 0.94 }),
        L("wind-open", 0.32, { drift: 1 }),
        L("wagon", 0.26)
      ],
      spots: [
        clip("cow", 0.5, 3), clip("snort", 0.4, 2), clip("whinny", 0.44, 2),
        clip("whinny-2", 0.4, 1), clip("neigh", 0.32, 1)
      ]
    },
    "images/scenes/philly-s45.jpg": {
      name: "Tin Cups", space: "night", every: [8, 18],
      layers: [
        L("crickets", 0.5, { drift: 1 }),
        L("fire", 0.62),
        L("wind-grass", 0.16),
        { synth: "ember", g: 0.1 }
      ],
      spots: [
        clip("owl", 0.32, 2), clip("snort", 0.3, 2), clip("clink", 0.28, 2, { pitch: "tight" }),
        clip("whinny-2", 0.28, 1), clip("door", 0.26, 1)
      ]
    },
    "images/scenes/transcon-s46.jpg": {
      name: "The Goat and the Top Hat", space: "town", every: [6, 15],
      layers: [
        L("murmur", 0.5, { drift: 1 }),
        L("wind-open", 0.2),
        L("gravel", 0.16, { rate: 0.92 }),
        L("birds-yard", 0.14)
      ],
      spots: [
        clip("goat", 0.55, 3), clip("goat-2", 0.5, 2), clip("laugh", 0.36, 3),
        clip("hammer", 0.28, 2), clip("dog", 0.26, 1), clip("door", 0.28, 1), clip("whinny", 0.3, 1)
      ]
    },
    "images/scenes/transcon-s57.jpg": {
      name: "The Dock", space: "water", every: [7, 16],
      layers: [
        L("brook", 0.48, { drift: 1 }),
        L("paddle", 0.26),
        L("steam", 0.18, { lp: 900 }),
        L("gulls", 0.28)
      ],
      spots: [
        clip("whistle", 0.32, 1, { pitch: "tight" }), clip("hiss", 0.28, 2, { pitch: "mid" }),
        clip("splash", 0.34, 2), clip("goat", 0.4, 2), clip("laugh", 0.26, 2), clip("door", 0.26, 1)
      ]
    },
    "images/art/philly-s01.jpg": {
      name: "The Street Lamp", space: "fog", every: [9, 20], lp: 2400,
      layers: [
        L("hooves-walk", 0.36, { lp: 1800, rate: 0.94, pan: -0.2 }),
        L("murmur", 0.16),
        L("wind-grass", 0.14),
        L("wagon", 0.12, { lp: 1200 })
      ],
      spots: [
        clip("bell", 0.22, 1, { pitch: "tight" }), clip("mud", 0.22, 2),
        clip("door", 0.24, 1), clip("dog", 0.18, 1), clip("blackbird", 0.2, 1)
      ]
    },
    "images/art/philly-s03.jpg": {
      name: "The Pickled Eggs", space: "indoor", every: [7, 15],
      layers: [
        L("murmur", 0.42),
        { synth: "room", g: 0.28 }
      ],
      spots: [
        clip("clink", 0.34, 3, { pitch: "tight" }), synth("piano", 0.14, 3),
        clip("laugh", 0.26, 2), clip("door", 0.28, 1)
      ]
    },
    "images/art/transcon-s07.jpg": {
      name: "The Stage-Line Livery", space: "trees", every: [7, 16],
      layers: [
        L("wind-pines", 0.26),
        L("birds-yard", 0.32),
        L("hooves-walk", 0.3, { pan: 0.2 }),
        L("chew", 0.22, { pan: -0.35 })
      ],
      spots: [
        clip("donkey", 0.42, 2), clip("whinny", 0.44, 2), clip("whinny-2", 0.4, 1),
        clip("snort", 0.4, 2), clip("hen", 0.3, 1), clip("hammer", 0.24, 1),
        clip("barn", 0.34, 2), clip("dog", 0.24, 1)
      ]
    },
    "images/art/transcon-s15.jpg": {
      name: "The Race Poster", space: "indoor", every: [7, 15],
      layers: [
        L("murmur", 0.48),
        { synth: "room", g: 0.26 }
      ],
      spots: [
        clip("clink", 0.36, 3, { pitch: "tight" }), synth("piano", 0.15, 3),
        clip("laugh", 0.28, 2), clip("door", 0.26, 1)
      ]
    },
    "images/art/philly-s15.jpg": {
      name: "The Pink Dress", space: "town", every: [6, 14],
      layers: [
        L("murmur", 0.55, { drift: 1 }),
        L("wind-open", 0.14),
        L("gravel", 0.2),
        L("birds-yard", 0.12)
      ],
      spots: [
        clip("laugh", 0.34, 3), clip("mud", 0.26, 2), clip("dog", 0.22, 1),
        clip("robin", 0.22, 1), clip("blackbird", 0.22, 1), clip("door", 0.22, 1)
      ]
    },
    "images/art/transcon-s26.jpg": {
      name: "Geese on the Coach", space: "open", every: [6, 15], hp: 140,
      layers: [
        L("wind-open", 0.42, { drift: 1 }),
        L("wind-storm", 0.28),
        L("hooves-trot", 0.32, { lp: 900 }),
        L("wagon", 0.26)
      ],
      spots: [
        synth("goose", 0.28, 3), clip("snort", 0.34, 2), clip("whinny", 0.36, 1),
        clip("door", 0.26, 1), synth("hawk", 0.14, 1)
      ]
    },
    "images/art/philly-s32.jpg": {
      name: "Lightning Express", space: "town", every: [7, 16],
      layers: [
        L("wagon", 0.4, { pan: 0.25 }),
        L("hooves-walk", 0.32, { pan: -0.3 }),
        L("murmur", 0.3),
        L("wind-open", 0.18)
      ],
      spots: [
        clip("whinny", 0.44, 2), clip("snort", 0.38, 2), clip("dog", 0.26, 1),
        clip("hammer", 0.24, 1), clip("laugh", 0.24, 1), clip("barn", 0.28, 1),
        synth("jingle", 0.13, 1)
      ]
    },
    "images/art/transcon-s37.jpg": {
      name: "The Alpaca Coach", space: "trees", every: [7, 16],
      layers: [
        L("wind-pines", 0.46, { drift: 1 }),
        L("birds", 0.32),
        L("wagon", 0.24),
        L("hooves-walk", 0.18, { pan: -0.25 })
      ],
      spots: [
        synth("alpaca", 0.16, 3), clip("snort", 0.32, 2), clip("whinny", 0.34, 1),
        clip("robin", 0.26, 2), synth("hawk", 0.16, 1), clip("door", 0.24, 1)
      ]
    },
    "images/art/philly-s37.jpg": {
      name: "Tipping His Hat", space: "night", every: [8, 18],
      layers: [
        L("wind-pines", 0.5, { drift: 1 }),
        L("crickets", 0.28),
        L("hooves-walk", 0.2, { pan: -0.3 }),
        L("wagon", 0.16, { pan: 0.35 })
      ],
      spots: [
        clip("whinny", 0.4, 2), clip("snort", 0.36, 2), clip("robin", 0.24, 1),
        clip("owl", 0.22, 1), clip("door", 0.24, 1), synth("jingle", 0.12, 1)
      ]
    },
    "images/art/transcon-s53.jpg": {
      name: "Camp Supper", space: "night", every: [7, 16], hp: 90,
      layers: [
        L("wind-open", 0.34, { drift: 1 }),
        L("fire", 0.55),
        L("fry", 0.42, { pan: 0.15 }),
        { synth: "ember", g: 0.1 }
      ],
      spots: [
        clip("cow", 0.4, 3), clip("clink", 0.26, 2, { pitch: "tight" }),
        clip("snort", 0.3, 2), clip("owl", 0.2, 1), clip("door", 0.22, 1)
      ]
    },
    "images/art/transcon-s58.jpg": {
      name: "The Steamer", space: "water", every: [8, 18],
      layers: [
        L("waves", 0.58, { drift: 1 }),
        L("paddle", 0.24),
        L("steam", 0.2, { lp: 800 }),
        L("gulls", 0.3)
      ],
      spots: [
        clip("whistle", 0.3, 1, { pitch: "tight" }), clip("hiss", 0.26, 2, { pitch: "mid" }),
        clip("splash", 0.32, 2)
      ]
    },
    "images/art/philly-s59.jpg": {
      name: "Wagon Line", space: "open", every: [9, 20],
      layers: [
        L("wind-grass", 0.62, { drift: 1 }),
        L("wind-open", 0.28),
        L("wagon", 0.18, { rate: 0.9 }),
        L("hooves-walk", 0.14, { lp: 700, rate: 0.86 })
      ],
      spots: [
        synth("hawk", 0.18, 2), clip("cow", 0.32, 2), clip("door", 0.26, 2),
        synth("jingle", 0.12, 2), clip("robin", 0.2, 1), clip("snort", 0.24, 1)
      ]
    },
    "images/rusty-stack-game.jpg": {
      name: "The Rusty Stack", space: "storm", every: [8, 18],
      layers: [
        L("wind-storm", 0.66, { drift: 1 }),
        L("canvas", 0.46, { pan: 0.25, rate: 0.94 }),
        L("creak", 0.36, { pan: -0.3, rate: 0.88 }),
        { synth: "engine", g: 0.5 }
      ],
      spots: [
        clip("thunder", 0.7, 3, { pitch: "tight" }), clip("hiss", 0.3, 2, { pitch: "mid" }),
        clip("door", 0.32, 2)
      ]
    }
  };

  const FALLBACK = {
    name: "Prairie", space: "open", every: [8, 18],
    layers: [L("wind-grass", 0.5, { drift: 1 }), L("birds", 0.28), L("wagon", 0.16)],
    spots: [clip("whinny", 0.4, 1), clip("robin", 0.24, 1), clip("snort", 0.3, 1)]
  };

  const SPACES = {
    open:   { sec: 1.15, curve: 2.4, wet: 0.14, damp: 0.55 },
    trees:  { sec: 0.95, curve: 2.8, wet: 0.13, damp: 0.4 },
    town:   { sec: 1.05, curve: 2.5, wet: 0.16, damp: 0.35 },
    indoor: { sec: 1.25, curve: 1.55, wet: 0.32, damp: 0.22 },
    night:  { sec: 1.15, curve: 2.1, wet: 0.18, damp: 0.28 },
    water:  { sec: 1.45, curve: 1.9, wet: 0.2, damp: 0.42 },
    storm:  { sec: 2.3, curve: 1.45, wet: 0.26, damp: 0.48 },
    fog:    { sec: 1.7, curve: 1.7, wet: 0.28, damp: 0.16 }
  };

  let ctx, master, masterIn, white, brown, muted = false, cur = null, want = null, gen = 0;
  const cache = new Map();
  const pending = new Map();
  const irs = {};
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : LEVEL;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 42;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 10;
      comp.ratio.value = 2.2;
      comp.attack.value = 0.008;
      comp.release.value = 0.22;
      masterIn = hp;
      hp.connect(comp);
      comp.connect(master);
      master.connect(ctx.destination);
      const len = ctx.sampleRate * 3;
      white = ctx.createBuffer(1, len, ctx.sampleRate);
      brown = ctx.createBuffer(1, len, ctx.sampleRate);
      const w = white.getChannelData(0), b = brown.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        w[i] = Math.random() * 2 - 1;
        last = (last + 0.02 * w[i]) / 1.02;
        b[i] = last * 3.5;
      }
      const drift = b[len - 1] - b[0];
      for (let i = 0; i < len; i++) b[i] -= drift * i / (len - 1);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function ir(space) {
    if (irs[space]) return irs[space];
    const sp = SPACES[space] || SPACES.open;
    const len = Math.floor(ctx.sampleRate * sp.sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      const k = 1 - Math.pow(sp.damp, 0.35);
      for (let i = 0; i < len; i++) {
        const n = Math.random() * 2 - 1;
        lp += k * (n - lp);
        d[i] = lp * Math.pow(1 - i / len, sp.curve) * (c ? 0.85 : 1);
      }
    }
    irs[space] = buf;
    return buf;
  }

  function load(id) {
    if (cache.has(id)) return Promise.resolve(cache.get(id));
    if (pending.has(id)) return pending.get(id);
    const file = FILES[id];
    if (!file) return Promise.resolve(null);
    const p = fetch(BASE + file)
      .then(r => { if (!r.ok) throw new Error(r.status + " " + file); return r.arrayBuffer(); })
      .then(buf => decode(buf))
      .then(audio => { cache.set(id, audio); pending.delete(id); return audio; })
      .catch(err => {
        console.warn("[I Spy] audio failed:", id, err);
        cache.set(id, null);
        pending.delete(id);
        return null;
      });
    pending.set(id, p);
    return p;
  }

  function decode(arrayBuf) {
    const copy = arrayBuf.slice(0);
    return new Promise((resolve, reject) => {
      let settled = false;
      const ok = b => { if (!settled) { settled = true; resolve(b); } };
      const bad = e => { if (!settled) { settled = true; reject(e || new Error("decode")); } };
      let ret;
      try { ret = ctx.decodeAudioData(copy, ok, bad); } catch (e) { bad(e); return; }
      if (ret && typeof ret.then === "function") ret.then(ok, bad);
    });
  }

  function track(S, n) { S.nodes.push(n); return n; }

  function makePan(value) {
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, value));
      return p;
    }
    const g = ctx.createGain();
    g.gain.value = 1;
    return g;
  }

  function kill(S, fade) {
    if (!S || S.dead) return;
    S.dead = true;
    S.timers.forEach(t => clearTimeout(t));
    const now = ctx.currentTime;
    try {
      S.bus.gain.cancelScheduledValues(now);
      S.bus.gain.setValueAtTime(S.bus.gain.value, now);
      S.bus.gain.linearRampToValueAtTime(0, now + fade);
    } catch (e) {}
    setTimeout(() => {
      S.nodes.forEach(n => { try { n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
      try { S.bus.disconnect(); } catch (e) {}
    }, fade * 1000 + 80);
  }

  function loopBed(S, o) {
    const buf = cache.get(o.src);
    if (!buf) return;
    const src = track(S, ctx.createBufferSource());
    src.buffer = buf;
    src.loop = true;
    const base = (o.rate || 1) * rnd(0.985, 1.015);
    src.playbackRate.value = base;
    const drift = track(S, ctx.createOscillator());
    const dg = ctx.createGain();
    drift.frequency.value = rnd(0.015, 0.035);
    dg.gain.value = base * 0.012;
    drift.connect(dg);
    dg.connect(src.playbackRate);
    drift.start();
    let node = src;
    if (o.hp) {
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = o.hp;
      node.connect(f);
      node = f;
    }
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = o.lp;
      node.connect(f);
      node = f;
    }
    const g = ctx.createGain();
    g.gain.value = o.g;
    node.connect(g);
    const sw = track(S, ctx.createOscillator());
    const sg = ctx.createGain();
    sw.frequency.value = rnd(0.04, 0.09);
    sg.gain.value = o.g * (o.swell == null ? 0.16 : o.swell);
    sw.connect(sg);
    sg.connect(g.gain);
    sw.start();
    const p = makePan(o.pan == null ? rnd(-0.12, 0.12) : o.pan);
    g.connect(p);
    p.connect(S.bus);
    if (o.drift && p.pan) {
      const d = track(S, ctx.createOscillator());
      const lg = ctx.createGain();
      d.frequency.value = rnd(0.02, 0.045);
      lg.gain.value = 0.25;
      d.connect(lg);
      lg.connect(p.pan);
      d.start();
    }
    const offset = Math.random() * Math.max(0.05, buf.duration - 0.05);
    src.start(0, offset);
  }

  function noiseBed(S, buf, g, type, freq, q) {
    const src = track(S, ctx.createBufferSource());
    src.buffer = buf;
    src.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.value = freq;
    fl.Q.value = q || 0.7;
    const amp = ctx.createGain();
    amp.gain.value = g;
    src.connect(fl);
    fl.connect(amp);
    amp.connect(S.bus);
    const sw = track(S, ctx.createOscillator());
    const sg = ctx.createGain();
    sw.frequency.value = rnd(0.05, 0.1);
    sg.gain.value = g * 0.22;
    sw.connect(sg);
    sg.connect(amp.gain);
    sw.start();
    src.start(0, rnd(0, 2));
  }

  function engineBed(S, g) {
    const bus = ctx.createGain();
    bus.gain.value = g;
    bus.connect(S.bus);
    const partials = [[58, "sine", 0.55, 220], [87, "triangle", 0.16, 400], [116, "sawtooth", 0.05, 280]];
    partials.forEach(([f, type, gg, cut]) => {
      const o = track(S, ctx.createOscillator());
      o.type = type;
      o.frequency.value = f * rnd(0.99, 1.01);
      const fl = ctx.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.value = cut;
      const a = ctx.createGain();
      a.gain.value = gg;
      o.connect(fl);
      fl.connect(a);
      a.connect(bus);
      const w = track(S, ctx.createOscillator());
      const wg = ctx.createGain();
      w.frequency.value = 0.07;
      wg.gain.value = f * 0.008;
      w.connect(wg);
      wg.connect(o.frequency);
      w.start();
      o.start();
    });
    const src = track(S, ctx.createBufferSource());
    src.buffer = brown;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 180;
    bp.Q.value = 0.7;
    const na = ctx.createGain();
    na.gain.value = 0.35;
    src.connect(bp);
    bp.connect(na);
    na.connect(bus);
    const trem = track(S, ctx.createOscillator());
    const tg = ctx.createGain();
    trem.frequency.value = rnd(6.2, 7.4);
    tg.gain.value = 0.12;
    trem.connect(tg);
    tg.connect(na.gain);
    trem.start();
    src.start(0, rnd(0, 2));
    const sw = track(S, ctx.createOscillator());
    const sg = ctx.createGain();
    sw.frequency.value = 0.05;
    sg.gain.value = g * 0.12;
    sw.connect(sg);
    sg.connect(bus.gain);
    sw.start();
  }

  function playClip(S, o) {
    const buf = cache.get(o.src);
    if (!buf) return;
    const src = track(S, ctx.createBufferSource());
    src.buffer = buf;
    const span = o.pitch === "tight" ? 0.018 : o.pitch === "mid" ? 0.04 : 0.07;
    src.playbackRate.value = rnd(1 - span, 1 + span);
    const dur = Math.min(o.cut || buf.duration, buf.duration);
    const t = ctx.currentTime;
    const amp = ctx.createGain();
    const peak = (o.g || 0.4) * rnd(0.78, 1);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(peak, t + 0.02);
    const hold = Math.max(0.05, dur - 0.12);
    amp.gain.setValueAtTime(peak, t + hold);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    let pan = rnd(-0.82, 0.82);
    if (Math.abs(pan) < 0.2) pan = pan < 0 ? -0.45 : 0.45;
    const p = makePan(pan);
    src.connect(amp);
    amp.connect(p);
    p.connect(S.bus);
    src.start(t, rnd(0, Math.max(0, buf.duration - dur - 0.01)));
    src.stop(t + dur + 0.08);
  }

  function envGain(t, g, dur, attack) {
    const a = ctx.createGain();
    a.gain.setValueAtTime(0.0001, t);
    a.gain.linearRampToValueAtTime(g, t + (attack || 0.02));
    a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    return a;
  }

  const SYNTH = {
    piano(S, g) {
      const t = ctx.currentTime;
      const scale = [196, 220, 261.6, 293.7, 329.6, 392, 440, 523.3];
      const p = makePan(rnd(-0.35, 0.35));
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1400;
      lp.connect(p);
      p.connect(S.bus);
      let i0 = 1 + (Math.random() * 4 | 0);
      const n = 4 + (Math.random() * 4 | 0);
      for (let i = 0; i < n; i++) {
        const tt = t + i * rnd(0.28, 0.42);
        const f = scale[i0];
        [1, 1.006].forEach((det, k) => {
          const o = track(S, ctx.createOscillator());
          o.type = "triangle";
          o.frequency.value = f * det;
          const a = envGain(tt, g * (k ? 0.55 : 0.8), 1.05, 0.008);
          o.connect(a);
          a.connect(lp);
          o.start(tt);
          o.stop(tt + 1.15);
        });
        if (i % 2 === 0) {
          const o = track(S, ctx.createOscillator());
          o.type = "triangle";
          o.frequency.value = f / 2;
          const a = envGain(tt, g * 0.4, 1.2, 0.01);
          o.connect(a);
          a.connect(lp);
          o.start(tt);
          o.stop(tt + 1.3);
        }
        i0 = Math.max(0, Math.min(scale.length - 1, i0 + pick([-2, -1, 1, 1, 2])));
      }
    },
    goose(S, g) {
      const t = ctx.currentTime;
      const p = makePan(rnd(-0.7, 0.7));
      p.connect(S.bus);
      const n = 1 + (Math.random() * 2 | 0);
      for (let i = 0; i < n; i++) {
        const tt = t + i * rnd(0.32, 0.48);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = rnd(620, 820);
        bp.Q.value = 2.2;
        bp.connect(p);
        const o = track(S, ctx.createOscillator());
        o.type = "sawtooth";
        const f = rnd(250, 330);
        o.frequency.setValueAtTime(f * 1.25, tt);
        o.frequency.exponentialRampToValueAtTime(f * 0.78, tt + 0.2);
        const a = envGain(tt, g, 0.24, 0.015);
        o.connect(a);
        a.connect(bp);
        o.start(tt);
        o.stop(tt + 0.3);
      }
    },
    hawk(S, g) {
      const t = ctx.currentTime;
      const p = makePan(rnd(-0.75, 0.75));
      p.connect(S.bus);
      const o = track(S, ctx.createOscillator());
      o.type = "sine";
      const f = rnd(1700, 2200);
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.7);
      const v = track(S, ctx.createOscillator());
      const vg = ctx.createGain();
      v.frequency.value = 14;
      vg.gain.value = 30;
      v.connect(vg);
      vg.connect(o.frequency);
      const a = envGain(t, g, 0.85, 0.04);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1600;
      bp.Q.value = 2;
      o.connect(bp);
      bp.connect(a);
      a.connect(p);
      o.start(t);
      v.start(t);
      o.stop(t + 0.95);
      v.stop(t + 0.95);
    },
    alpaca(S, g) {
      const t = ctx.currentTime;
      const p = makePan(rnd(-0.5, 0.5));
      p.connect(S.bus);
      const dur = rnd(0.9, 1.6);
      const o = track(S, ctx.createOscillator());
      o.type = "sawtooth";
      o.frequency.value = rnd(170, 230);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = rnd(480, 640);
      bp.Q.value = 3.5;
      const a = envGain(t, g, dur, 0.12);
      o.connect(bp);
      bp.connect(a);
      a.connect(p);
      const wob = track(S, ctx.createOscillator());
      const wg = ctx.createGain();
      wob.frequency.value = rnd(4, 6);
      wg.gain.value = 8;
      wob.connect(wg);
      wg.connect(o.frequency);
      o.start(t);
      wob.start(t);
      o.stop(t + dur + 0.05);
      wob.stop(t + dur + 0.05);
    },
    jingle(S, g) {
      const t = ctx.currentTime;
      const p = makePan(rnd(-0.6, 0.6));
      p.connect(S.bus);
      const base = rnd(1400, 1900);
      const n = 3 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) {
        const tt = t + i * rnd(0.07, 0.13);
        [1, 2.0, 2.76].forEach((m, k) => {
          const o = track(S, ctx.createOscillator());
          o.type = "sine";
          o.frequency.value = base * m * rnd(0.98, 1.02);
          const a = envGain(tt, g / (k + 1), 0.35, 0.004);
          o.connect(a);
          a.connect(p);
          o.start(tt);
          o.stop(tt + 0.4);
        });
      }
    }
  };

  function fireSpot(S, spot) {
    try {
      if (spot.synth) SYNTH[spot.synth](S, spot.g * rnd(0.85, 1));
      else playClip(S, spot);
    } catch (e) { console.warn("[I Spy] spot", e); }
  }

  function schedule(S, list, every) {
    let last = "";
    const go = () => {
      if (S.dead) return;
      const pool = list.filter(s => s.synth !== last && s.src !== last);
      const bag = pool.length ? pool : list;
      let sum = 0;
      bag.forEach(s => { sum += s.w || 1; });
      let r = Math.random() * sum;
      let chosen = bag[0];
      for (let i = 0; i < bag.length; i++) {
        r -= bag[i].w || 1;
        if (r <= 0) { chosen = bag[i]; break; }
      }
      last = chosen.synth || chosen.src;
      fireSpot(S, chosen);
      S.timers.push(setTimeout(go, rnd(every[0], every[1]) * 1000));
    };
    S.timers.push(setTimeout(go, rnd(6, 12) * 1000));
  }

  function build(scene, key) {
    const bus = ctx.createGain();
    bus.gain.value = 0;
    let tail = bus;
    if (scene.lp || scene.hp) {
      const f = ctx.createBiquadFilter();
      if (scene.hp && !scene.lp) {
        f.type = "highpass";
        f.frequency.value = scene.hp;
        bus.connect(f);
        tail = f;
      } else if (scene.lp && !scene.hp) {
        f.type = "lowpass";
        f.frequency.value = scene.lp;
        bus.connect(f);
        tail = f;
      } else {
        f.type = "highpass";
        f.frequency.value = scene.hp;
        const f2 = ctx.createBiquadFilter();
        f2.type = "lowpass";
        f2.frequency.value = scene.lp;
        bus.connect(f);
        f.connect(f2);
        tail = f2;
      }
    }
    const space = SPACES[scene.space] ? scene.space : "open";
    const dry = ctx.createGain();
    dry.gain.value = 1;
    const wet = ctx.createGain();
    wet.gain.value = SPACES[space].wet;
    const conv = ctx.createConvolver();
    conv.buffer = ir(space);
    tail.connect(dry);
    dry.connect(masterIn);
    tail.connect(wet);
    wet.connect(conv);
    conv.connect(masterIn);
    const S = { key, name: scene.name, bus, nodes: [conv], timers: [], dead: false };
    scene.layers.forEach(layer => {
      if (layer.synth === "room") noiseBed(S, brown, layer.g, "lowpass", 280, 0.6);
      else if (layer.synth === "ember") noiseBed(S, brown, layer.g, "lowpass", 500, 0.5);
      else if (layer.synth === "engine") engineBed(S, layer.g);
      else if (layer.src) loopBed(S, layer);
    });
    if (scene.spots && scene.spots.length) schedule(S, scene.spots, scene.every || [6, 18]);
    const now = ctx.currentTime;
    bus.gain.setValueAtTime(0, now);
    bus.gain.linearRampToValueAtTime(1, now + FADE);
    return S;
  }

  function idsFor(scene) {
    const ids = [];
    (scene.layers || []).forEach(l => { if (l.src) ids.push(l.src); });
    (scene.spots || []).forEach(s => { if (s.src) ids.push(s.src); });
    return [...new Set(ids)];
  }

  function chime() {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25];
    notes.forEach((f, i) => {
      const tt = t + i * 0.07;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = "sine";
      o2.frequency.value = f * 1.004;
      const a = ctx.createGain();
      a.gain.setValueAtTime(0.0001, tt);
      a.gain.exponentialRampToValueAtTime(i ? 0.09 : 0.13, tt + 0.02);
      a.gain.exponentialRampToValueAtTime(0.0001, tt + 0.42);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2000;
      o.connect(lp);
      o2.connect(lp);
      lp.connect(a);
      a.connect(master);
      o.start(tt);
      o2.start(tt);
      o.stop(tt + 0.48);
      o2.stop(tt + 0.48);
    });
  }

  function start(src) {
    if (!ac()) return;
    const scene = SCENES[src] || FALLBACK;
    if (want === src && cur && !cur.dead) return;
    want = src;
    const my = ++gen;
    const need = idsFor(scene);
    Promise.all(need.map(load)).then(() => {
      if (my !== gen || want !== src) return;
      if (!ac()) return;
      kill(cur, FADE);
      cur = build(scene, src);
      if (window.console) console.info("[I Spy] ambience:", scene.name);
    });
  }

  return {
    unlock() { ac(); },
    play(src) { start(src); },
    stop() {
      gen++;
      want = null;
      if (ctx) kill(cur, 0.45);
      cur = null;
    },
    found() { if (ac()) chime(); },
    toggle() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
      if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : LEVEL, ctx.currentTime, 0.05);
      else if (master) master.gain.value = muted ? 0 : LEVEL;
      return muted;
    },
    get muted() { return muted; },
    get running() { return !!(cur && !cur.dead); },
    get kind() { return cur ? cur.name : null; }
  };
})();
window.ISpyAmbience = ISpyAmbience;
