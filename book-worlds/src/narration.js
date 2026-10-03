// Announcer bulletins. Lines live in narration.json. A matching mp3 is optional.
export function createNarration() {
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

  let token = 0;
  let typeTimer = 0;
  let hideTimer = 0;
  let clip = null;
  let current = null;

  function kickerFor(id) {
    if (id.startsWith("page-")) return "Story page";
    if (id === "restored") return "Station 1";
    return "Special bulletin";
  }

  function silence() {
    clearTimeout(typeTimer);
    clearTimeout(hideTimer);
    if (clip) {
      clip.pause();
      clip.removeAttribute("src");
      clip.load();
      clip = null;
    }
  }

  function conceal() {
    if (clip && !clip.paused && !clip.ended) {
      hideTimer = window.setTimeout(conceal, 400);
      return;
    }
    bar.hidden = true;
    current = null;
  }

  function hold(ms) {
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(conceal, ms);
  }

  function type(text, my) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      lineEl.textContent = text;
      lineEl.classList.add("is-done");
      hold(2800);
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
      else {
        lineEl.classList.add("is-done");
        hold(2400);
      }
    };
    step();
  }

  async function tryClip(id, my) {
    const url = new URL(`../audio/narration/${id}.mp3`, import.meta.url);
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok || my !== token) return;
      const audio = new Audio(url.href);
      clip = audio;
      audio.addEventListener("ended", () => {
        if (my === token) hold(600);
      });
      await audio.play();
    } catch {
      /* No file yet, or the browser withheld sound. The caption still runs. */
    }
  }

  return {
    line(id) {
      return lines.get(id) || "";
    },
    async say(id) {
      await ready;
      const text = lines.get(id);
      if (!text) return;
      silence();
      const my = ++token;
      current = { id, text };
      kickerEl.textContent = kickerFor(id);
      bar.hidden = false;
      bar.dataset.id = id;
      type(text, my);
      tryClip(id, my);
    },
    current() {
      return current ? { id: current.id, text: lineEl.textContent, full: current.text } : null;
    },
  };
}
