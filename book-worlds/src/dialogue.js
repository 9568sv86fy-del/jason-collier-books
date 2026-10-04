// Character barks. Lines live in dialogue.json.
// A matching mp3 at audio/voices/<speaker>/<id>.mp3 plays when present.
// Subtitles stay off unless the player asks, except when the clip is missing.
const NAMES = { jang: "Jang", tom: "Tom" };

export function createDialogue(audio) {
  const rows = new Map();
  const ready = fetch(new URL("../dialogue.json", import.meta.url))
    .then((res) => (res.ok ? res.json() : []))
    .then((list) => {
      const rowsIn = Array.isArray(list) ? list : [];
      for (const row of rowsIn) if (row && row.id && row.text) rows.set(row.id, row);
    })
    .catch(() => {});

  const queue = [];
  let busy = false;
  let token = 0;
  let active = null;
  let hideTimer = 0;

  function subsOn() {
    return document.body.classList.contains("subs");
  }

  function subEl() {
    return document.getElementById("subtitle");
  }

  function tagEl() {
    return document.getElementById("tag");
  }

  function showSub(text, force) {
    const el = subEl();
    if (!el) return;
    const on = force || subsOn();
    el.hidden = !on;
    el.textContent = on ? text : "";
    el.dataset.force = force ? "1" : "0";
  }

  function showTag(speaker, on) {
    const el = tagEl();
    if (!el) return;
    const name = NAMES[speaker] || "";
    el.hidden = !(on && name);
    el.dataset.who = speaker || "";
    el.textContent = name;
  }

  function delay(ms, my) {
    return new Promise((resolve) => {
      hideTimer = window.setTimeout(() => resolve(my === token), ms);
    });
  }

  async function run(id, my) {
    const row = rows.get(id);
    if (!row) return;
    active = { id, speaker: row.speaker, text: row.text };
    showTag(row.speaker, true);
    showSub(row.text, subsOn());
    const url = new URL(`../audio/voices/${row.speaker}/${id}.mp3`, import.meta.url).href;
    let played = false;
    try {
      played = !!(audio && audio.playClip && await audio.playClip(url));
    } catch {
      played = false;
    }
    if (my !== token) return;
    if (!played) {
      showSub(row.text, true);
      await delay(Math.min(4600, 1400 + row.text.length * 32), my);
    }
    if (my !== token) return;
    active = null;
    showTag(row.speaker, false);
    const el = subEl();
    if (el && !subsOn()) el.hidden = true;
  }

  async function pump() {
    if (busy) return;
    const next = queue.shift();
    if (!next) return;
    busy = true;
    const my = ++token;
    try { await run(next, my); } catch { /* the name tag clears below */ }
    busy = false;
    if (my !== token) return;
    if (queue.length) pump();
    else if (!active) showTag("", false);
  }

  return {
    ready,
    line(id) {
      return rows.get(id) || null;
    },
    lines() {
      return [...rows.values()];
    },
    say(id) {
      ready.then(() => {
        if (!rows.get(id)) return;
        queue.push(id);
        pump();
      });
    },
    active() {
      return active;
    },
    depth() {
      return queue.length + (busy ? 1 : 0);
    },
    stop() {
      token += 1;
      queue.length = 0;
      busy = false;
      active = null;
      clearTimeout(hideTimer);
      showTag("", false);
      const el = subEl();
      if (el && !subsOn()) el.hidden = true;
    },
  };
}
