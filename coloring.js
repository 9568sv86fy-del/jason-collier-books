/* Coloring Pages: line art traced from the book pictures, tap-to-fill canvas, print + download */
const CP_BOOKS = [
  { name: "Jang & Tom", pics: [
    { id: "wagon-masters-cover", title: "Wagon Masters Cover", w: 754, h: 1200 },
    { id: "runaway-horse", title: "Runaway Horse", w: 1200, h: 675 },
    { id: "horse-race", title: "The Big Horse Race", w: 1200, h: 675 },
    { id: "stampede", title: "Longhorn Stampede", w: 1200, h: 675 },
    { id: "coach-crash", title: "Stagecoach Crash", w: 1200, h: 675 },
    { id: "goose-coach", title: "A Coach Full of Geese", w: 1200, h: 675 },
    { id: "frontier-town", title: "Frontier Main Street", w: 1200, h: 675 },
    { id: "lightning-express", title: "Lightning Express", w: 1200, h: 675 },
    { id: "race-poster", title: "Grand Stage Race", w: 1200, h: 675 },
    { id: "shop-window", title: "The Shop Window", w: 1200, h: 675 },
    { id: "pickled-eggs", title: "The Pickled-Egg Jar", w: 1200, h: 675 },
    { id: "sunset-riders", title: "Sunset Riders", w: 1200, h: 675 },
    { id: "campfire", title: "Campfire Under the Stars", w: 1200, h: 675 },
    { id: "riverboat", title: "Riverboat Goodbye", w: 1200, h: 675 },
    { id: "steamboat", title: "Steamboat at Sunset", w: 1200, h: 675 }
  ]},
  { name: "The Rusty Stack", pics: [
    { id: "rusty-stack", title: "The Rusty Stack", w: 1200, h: 558 }
  ]}
];

const CP_COLORS = [
  ["#e23b2e", "Fire red"], ["#f47c20", "Orange"], ["#f9d423", "Sunshine"], ["#8cc63f", "Lime"],
  ["#2e7d32", "Pine green"], ["#00897b", "Teal"], ["#5ec3f0", "Sky blue"], ["#1f5fbf", "Blue"],
  ["#23306e", "Navy"], ["#7b3fa0", "Purple"], ["#f06d9c", "Pink"], ["#c2185b", "Berry"],
  ["#a3402b", "Brick"], ["#c0662b", "Rust"], ["#8b5a2b", "Saddle brown"], ["#553318", "Dark brown"],
  ["#d6b17c", "Tan"], ["#f5deb3", "Wheat"], ["#f6c7a6", "Peach"], ["#c9a227", "Gold"],
  ["#6b7a2e", "Olive"], ["#9fb58a", "Sage"], ["#7a8794", "Slate"], ["#333333", "Charcoal"]
];

(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const PICS = CP_BOOKS.flatMap(b => b.pics);
  const LINE = 170;          // pixels darker than this are "line" and never get filled
  const BLEED = 2;           // color is pushed this many px under the anti-aliased line edge
  const KEY = id => "jc-coloring:" + id;

  const gal = $("#cp-gallery"), editor = $("#cp-editor"), canvas = $("#cp-canvas"), view = $("#cp-view");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const undoBtn = $("#cp-undo"), eraserBtn = $("#cp-eraser"), loading = $("#cp-loading");

  let P = null, W = 0, H = 0, lineImg = null, lab = null, boxes = null, color = CP_COLORS[0][0], colorName = CP_COLORS[0][1];
  let fills = new Map(), undo = [], erasing = false, zoom = 1, buf = null, saveT = 0;

  /* ---------- gallery ---------- */
  const hasSaved = id => { try { const s = localStorage.getItem(KEY(id)); return !!s && s !== "[]"; } catch (e) { return false; } };
  function renderGallery() {
    gal.innerHTML = CP_BOOKS.map(book => `<section class="ispy-book"><h2 class="ispy-book-h">${esc(book.name)}</h2><div class="ispy-cards cp-cards" role="list">${
      book.pics.map(p => `<button type="button" class="ispy-card cp-card" role="listitem" data-id="${p.id}">
        <span class="ispy-card-img cp-card-img"><img src="coloring/thumbs/${p.id}.png" alt="" loading="lazy"></span>
        <span class="ispy-card-t"><strong>${esc(p.title)}</strong><em>${hasSaved(p.id) ? "In progress · tap to keep coloring" : "Tap to color"}</em></span>
      </button>`).join("")}</div></section>`).join("");
  }
  gal.addEventListener("click", e => { const b = e.target.closest(".cp-card"); if (b) open(b.dataset.id); });

  /* ---------- palette ---------- */
  const pal = $("#cp-palette");
  pal.innerHTML = CP_COLORS.map(([c, n], i) => `<button type="button" class="cp-color" role="radio" aria-checked="${i === 0}" aria-label="${esc(n)}" title="${esc(n)}" data-c="${c}" style="--c:${c}"></button>`).join("");
  function setColor(c, name) {
    color = c; colorName = name; setEraser(false);
    pal.querySelectorAll(".cp-color").forEach(b => b.setAttribute("aria-checked", b.dataset.c === c ? "true" : "false"));
    $("#cp-now").style.background = c; $("#cp-now-name").textContent = name;
  }
  pal.addEventListener("click", e => { const b = e.target.closest(".cp-color"); if (b) setColor(b.dataset.c, b.title); });
  $("#cp-custom").addEventListener("input", e => setColor(e.target.value, "Custom color"));
  function setEraser(on) {
    erasing = on; eraserBtn.setAttribute("aria-pressed", on ? "true" : "false"); eraserBtn.classList.toggle("is-on", on);
    $("#cp-now").style.background = on ? "#fff" : color; $("#cp-now-name").textContent = on ? "Eraser" : colorName;
  }
  eraserBtn.addEventListener("click", () => setEraser(!erasing));
  setColor(color, colorName);

  /* ---------- open a picture ---------- */
  function open(id, push = true) {
    const p = PICS.find(q => q.id === id); if (!p) return;
    P = p; gal.hidden = true; editor.hidden = false; loading.hidden = false;
    $("#cp-title").textContent = p.title;
    if (push && location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    const img = new Image();
    img.onload = () => { if (P !== p) return; lineImg = img; setup(); loading.hidden = true; };
    img.onerror = () => { loading.textContent = "Sorry, that picture didn’t load."; };
    img.src = `coloring/${p.id}.png`;
    editor.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function close() { save(true); P = null; editor.hidden = true; gal.hidden = false; renderGallery(); }
  $("#cp-back").addEventListener("click", () => { if (location.hash) history.pushState(null, "", location.pathname); close(); });
  window.addEventListener("popstate", () => { const id = location.hash.slice(1); if (id && PICS.some(p => p.id === id)) open(id, false); else if (P) close(); });

  function setup() {
    W = lineImg.naturalWidth; H = lineImg.naturalHeight;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H); ctx.drawImage(lineImg, 0, 0);
    const px = ctx.getImageData(0, 0, W, H).data;
    const n = W * H, lum = new Uint8Array(n);
    for (let i = 0, j = 0; i < n; i++, j += 4) lum[i] = (px[j] * 299 + px[j + 1] * 587 + px[j + 2] * 114) / 1000;
    // label 4-connected light regions (0 = line)
    lab = new Int32Array(n); const bx = [0]; const stack = new Int32Array(n); let next = 1;
    for (let s = 0; s < n; s++) {
      if (lab[s] || lum[s] < LINE) continue;
      let top = 0; stack[top++] = s; lab[s] = next;
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      while (top) {
        const i = stack[--top], x = i % W, y = (i / W) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && !lab[i - 1] && lum[i - 1] >= LINE) { lab[i - 1] = next; stack[top++] = i - 1; }
        if (x < W - 1 && !lab[i + 1] && lum[i + 1] >= LINE) { lab[i + 1] = next; stack[top++] = i + 1; }
        if (y > 0 && !lab[i - W] && lum[i - W] >= LINE) { lab[i - W] = next; stack[top++] = i - W; }
        if (y < H - 1 && !lab[i + W] && lum[i + W] >= LINE) { lab[i + W] = next; stack[top++] = i + W; }
      }
      bx.push([x0, y0, x1, y1]); next++;
    }
    boxes = bx;
    buf = ctx.createImageData(W, H);
    undo = []; fills = new Map();
    try { (JSON.parse(localStorage.getItem(KEY(P.id)) || "[]")).forEach(([l, c]) => { if (l > 0 && l < boxes.length) fills.set(l, c); }); } catch (e) { }
    setZoom(1); rebuild();
  }

  /* ---------- painting ---------- */
  const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function paint(l, hex) {
    const [r, g, b] = rgb(hex), d = buf.data, [x0, y0, x1, y1] = boxes[l];
    for (let y = y0; y <= y1; y++) for (let x = x0, i = y * W + x0; x <= x1; x++, i++) {
      if (lab[i] !== l) continue;
      let k = i * 4; d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255;
      // region pixel next to a line: bleed color under the soft edge so no white halo shows
      if ((x > 0 && !lab[i - 1]) || (x < W - 1 && !lab[i + 1]) || (y > 0 && !lab[i - W]) || (y < H - 1 && !lab[i + W])) {
        for (let dy = -BLEED; dy <= BLEED; dy++) {
          const yy = y + dy; if (yy < 0 || yy >= H) continue;
          for (let dx = -BLEED; dx <= BLEED; dx++) {
            const xx = x + dx; if (xx < 0 || xx >= W) continue;
            const q = yy * W + xx; if (lab[q]) continue;
            k = q * 4; d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255;
          }
        }
      }
    }
  }
  function rebuild() {
    const d = buf.data; d.fill(255);
    fills.forEach((c, l) => paint(l, c));
    draw();
  }
  function draw() {
    ctx.globalCompositeOperation = "source-over"; ctx.putImageData(buf, 0, 0);
    ctx.globalCompositeOperation = "multiply"; ctx.drawImage(lineImg, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    undoBtn.disabled = !undo.length;
  }
  function save(now) {
    clearTimeout(saveT);
    const run = () => { if (!P) return; try { localStorage.setItem(KEY(P.id), JSON.stringify([...fills])); } catch (e) { } };
    now ? run() : (saveT = setTimeout(run, 300));
  }
  function labelAt(x, y) {
    x = Math.max(0, Math.min(W - 1, Math.round(x))); y = Math.max(0, Math.min(H - 1, Math.round(y)));
    let l = lab[y * W + x]; if (l) return l;
    for (let r = 1; r <= 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      if ((l = lab[yy * W + xx])) return l;
    }
    return 0;
  }
  function fillAt(x, y) {
    const l = labelAt(x, y); if (!l) return;
    const prev = fills.has(l) ? fills.get(l) : null, next = erasing ? null : color;
    if (prev === next) return;
    undo.push({ l, prev }); if (undo.length > 200) undo.shift();
    fills.delete(l);
    if (next) { fills.set(l, next); paint(l, next); draw(); } else rebuild();
    save();
  }
  window.cpFillAt = fillAt; // handy for automated tests

  let down = null;
  canvas.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; });
  canvas.addEventListener("pointerup", e => {
    if (!down || !lab) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), long = Date.now() - down.t > 900; down = null;
    if (moved > 12 || long) return; // that was a scroll or pan, not a tap
    const r = canvas.getBoundingClientRect();
    fillAt((e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height);
  });

  undoBtn.addEventListener("click", () => {
    const u = undo.pop(); if (!u) return;
    if (u.clear) fills = new Map(u.clear);
    else { fills.delete(u.l); if (u.prev) fills.set(u.l, u.prev); }
    rebuild(); save();
  });
  $("#cp-clear").addEventListener("click", () => {
    if (!fills.size) return;
    if (!confirm("Clear all the color from this picture?")) return;
    undo.push({ clear: [...fills] }); fills = new Map(); rebuild(); save();
  });

  /* ---------- zoom ---------- */
  function setZoom(z) {
    zoom = Math.max(1, Math.min(4, z));
    canvas.style.width = (zoom * 100) + "%";
    view.classList.toggle("is-zoomed", zoom > 1);
  }
  $("#cp-zin").addEventListener("click", () => setZoom(zoom * 1.5));
  $("#cp-zout").addEventListener("click", () => setZoom(zoom / 1.5));

  /* ---------- print + download ---------- */
  const printView = $("#cp-print"), printImg = $("#cp-print-img");
  const pageStyle = document.createElement("style"); document.head.appendChild(pageStyle);
  function showPrint(src, label) {
    pageStyle.textContent = `@page{size:letter ${W > H ? "landscape" : "portrait"};margin:.4in}`;
    $("#cp-print-label").textContent = label;
    $("#cp-sheet").classList.toggle("is-landscape", W > H);
    printView.hidden = false; document.body.classList.add("cp-printing");
    printImg.onload = () => setTimeout(() => window.print(), 150);
    printImg.src = src;
  }
  function hidePrint() { printView.hidden = true; document.body.classList.remove("cp-printing"); printImg.onload = null; }
  $("#cp-print-blank").addEventListener("click", () => P && showPrint(`coloring/${P.id}.png`, `${P.title}: blank page`));
  $("#cp-print-mine").addEventListener("click", () => P && lab && showPrint(canvas.toDataURL("image/png"), `${P.title}: my coloring`));
  $("#cp-print-go").addEventListener("click", () => window.print());
  $("#cp-print-close").addEventListener("click", hidePrint);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !printView.hidden) hidePrint(); });
  $("#cp-download").addEventListener("click", () => {
    if (!P || !lab) return;
    canvas.toBlob(b => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${P.id}-coloring.png`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  });

  renderGallery();
  const start = location.hash.slice(1);
  if (start && PICS.some(p => p.id === start)) open(start, false);
})();
