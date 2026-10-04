// Announcer bulletins. Lines live in narration.json. A matching mp3 plays when present.
// One line at a time: a new say() waits its turn. Captions run even if sound is still locked.
export function createNarration(audio) {
  const bar = document.getElementById("bulletin");
  const kickerEl = document.getElementById("bulletin-kicker");
  const lineEl = document.getElementById("bulletin-line");
  const lines = new Map();
  const ready = fetch(new URL("../narration.json", import.meta.url))
    .then((res) => (res.ok ? res.json() : []))
    .then((rows) => {
      const list = Array.isArray(rows) ? rows : [];
      for (const row of list) if (row && row.id && row.text) lines.set(row.id, row.text);
    })
    .catch(() => {});

  const queue = [];
  let busy = false;
  let token = 0;
  let typeTimer = 0;
  let current = null;

  function kickerFor(id) {
    if (id.startsWith("page-")) return "Story page";
    if (id === "restored") return "Station 1";
    if (id === "blank-next") return "Dead air";
    if (id.startsWith("tutor-")) return "On the trail";
    return "Special bulletin";
  }

  function conceal() {
    bar.hidden = true;
    current = null;
  }

  function type(text, my) {
    clearTimeout(typeTimer);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      lineEl.textContent = text;
      lineEl.classList.add("is-done");
      return;
    }
    let i = 0;
    lineEl.textContent = "";
    lineEl.classList.remove("is-done");
    const step = () => {
      if (my !== token) return;
      i += 1;
      lineEl.textContent = text.slice(0, i);
      if (i < text.length) typeTimer = window.setTimeout(step, 26);
      else lineEl.classList.add("is-done");
    };
    step();
  }

  function waitTyped(my) {
    return new Promise((resolve) => {
      const check = () => {
        if (my !== token) { resolve(); return; }
        if (lineEl.classList.contains("is-done")) { resolve(); return; }
        typeTimer = window.setTimeout(check, 40);
      };
      check();
    });
  }

  function delay(ms, my) {
    return new Promise((resolve) => {
      typeTimer = window.setTimeout(() => resolve(my === token), ms);
    });
  }

  function subsOn() {
    return document.body.classList.contains("subs");
  }

  async function run(id, my) {
    const text = lines.get(id);
    current = { id, text };
    kickerEl.textContent = kickerFor(id);
    const subs = subsOn();
    bar.hidden = !subs;
    bar.dataset.id = id;
    bar.dataset.force = "0";
    if (subs) type(text, my);
    else {
      lineEl.textContent = text;
      lineEl.classList.add("is-done");
    }
    const url = new URL(`../audio/narration/${id}.mp3`, import.meta.url).href;
    let played = false;
    const clip = audio && audio.playClip
      ? audio.playClip(url).then((ok) => { played = !!ok; }).catch(() => { played = false; })
      : Promise.resolve();
    if (subs) await waitTyped(my);
    await clip;
    if (my !== token) return;
    if (!played) {
      bar.hidden = false;
      bar.dataset.force = "1";
      lineEl.textContent = text;
      lineEl.classList.add("is-done");
      await delay(Math.min(5200, 1600 + text.length * 28), my);
    } else if (subsOn()) {
      await delay(450, my);
    }
  }

  async function pump() {
    if (busy) return;
    const next = queue.shift();
    if (!next) {
      conceal();
      return;
    }
    busy = true;
    const my = ++token;
    try { await run(next, my); } catch { /* caption already on screen */ }
    busy = false;
    if (my !== token) return;
    if (queue.length) pump();
    else conceal();
  }

  return {
    line(id) {
      return lines.get(id) || "";
    },
    async say(id) {
      await ready;
      if (!lines.get(id)) return;
      queue.push(id);
      pump();
    },
    depth() {
      return queue.length + (busy ? 1 : 0);
    },
    current() {
      return current ? { id: current.id, text: lineEl.textContent, full: current.text } : null;
    },
  };
}
