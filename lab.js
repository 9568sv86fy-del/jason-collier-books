/* Thorne's Lab: journal (parsed from lab/thorne-log.md), bench instruments, I-spy */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------------- Journal ---------------- */
  // Each entry starts with a bold "Research Log" line, followed by bold Entry / Date / Age / Location lines.
  // Dropping an updated lab/thorne-log.md into the site adds any new entries automatically.
  function parseLog(md) {
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
    const entries = []; let cur = null;
    for (const raw of lines) {
      const t = raw.trim();
      const whole = /^\*\*[\s\S]*\*\*$/.test(t) && t.length > 4;
      const plain = whole ? t.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '') : t;
      if (whole && /^Research Log\b/i.test(plain)) { cur = { title: plain, fields: {}, lines: [] }; entries.push(cur); continue; }
      if (!cur) continue;
      if (whole && !cur.lines.some(l => l.t)) {
        const m = plain.match(/^(Entry|Date|Age|Location)\b:?\s*(.*)$/i);
        if (m) { cur.fields[m[1].toLowerCase()] = m[2].trim(); continue; }
      }
      cur.lines.push({ raw, t, whole, plain });
    }
    return entries;
  }
  const inline = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>');
  const isEq = s => s.length < 120 && /\S\s=\s\S/.test(s) && !/[.:]$/.test(s) && !/\b(the|and|is|to|of)\b/i.test(s.split('=')[0]);
  function renderBody(lines) {
    // group into blocks separated by blank lines
    const blocks = []; let b = [];
    for (const l of lines) { if (!l.t) { if (b.length) blocks.push(b); b = []; } else b.push(l); }
    if (b.length) blocks.push(b);
    let html = '', endHtml = '';
    for (const blk of blocks) {
      const allBold = blk.every(l => l.whole);
      const txt = l => (l.whole ? l.plain : l.t);
      // signature lines
      const rest = [];
      for (const l of blk) {
        const x = txt(l);
        if (/^End of entry\.?$/i.test(x)) endHtml += `<p class="pg-end">${esc(x)}</p>`;
        else if (/^E\. Thorne$/.test(x)) endHtml += `<p class="pg-sig">${esc(x)}</p>`;
        else rest.push(l);
      }
      if (!rest.length) continue;
      if (allBold && rest.length > 1) { rest.forEach(l => html += `<p>${inline(txt(l))}</p>`); continue; }
      if (rest.every(l => isEq(txt(l)))) { html += `<p class="eq">${rest.map(l => inline(txt(l))).join('<br>')}</p>`; continue; }
      let para = [];
      const flush = () => { if (para.length) html += `<p>${para.join('<br>')}</p>`; para = []; };
      for (const l of rest) {
        const x = txt(l);
        const sub = /^\s{2,}[a-z]\)\s/.test(l.raw);
        const num = /^\d+\.\s/.test(x), dash = /^-\s/.test(x);
        if (num || dash || sub) {
          flush();
          const body = dash ? '• ' + inline(x.replace(/^-\s+/, '')) : inline(x);
          html += `<p class="li${sub ? ' sub' : ''}">${body}</p>`;
        } else para.push(inline(x));
      }
      flush();
    }
    return html + endHtml;
  }


  /* ---------------- Thorne reads (narration) ---------------- */
  // One recording per entry: assets/thorne-lab-audio/entry-NNN.mp3 (NNN = entry number).
  // play() is always called synchronously inside the click/keydown/change handler, so iOS Safari allows it.
  const narr = (() => {
    const bar = $('#lab-voice');
    if (!bar) return { start() {}, stop() {}, prime() {} };
    const MUTE_KEY = 'thorneLab.voiceMuted';
    const audio = new Audio(); audio.preload = 'none'; audio.setAttribute('playsinline', '');
    const btn = $('#lv-play'), label = $('#lv-label'), time = $('#lv-time'), mute = $('#lv-mute');
    let muted = false; try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) {}
    let num = '', title = '';
    const src = n => `assets/thorne-lab-audio/entry-${String(n).padStart(3, '0')}.mp3`;
    const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '';
    function ui() {
      const playing = !audio.paused && !audio.ended;
      bar.classList.toggle('is-playing', playing);
      bar.classList.toggle('is-muted', muted);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? 'Pause Dr. Thorne’s reading' : `Play Dr. Thorne reading entry ${num}`);
      label.textContent = bar.classList.contains('is-missing') ? 'No recording for this entry yet'
        : playing ? `Thorne is reading · Entry ${num}` : audio.currentTime > 0 && !audio.ended ? `Paused · Entry ${num}` : `Hear Thorne read Entry ${num}`;
      mute.setAttribute('aria-pressed', muted ? 'true' : 'false');
      mute.textContent = muted ? 'Voice off' : 'Voice on';
      mute.title = muted ? 'Dr. Thorne won’t read aloud when you open an entry' : 'Dr. Thorne reads each entry aloud when you open it';
    }
    function load(n, t) {
      if (n === num && audio.src) return;
      audio.pause(); num = n; title = t || ''; bar.classList.remove('is-missing');
      audio.src = src(n); time.textContent = '';
      ui();
    }
    function play() {
      const p = audio.play();
      if (p && p.catch) p.catch(() => ui());
      if ('mediaSession' in navigator && window.MediaMetadata) {
        try { navigator.mediaSession.metadata = new MediaMetadata({ title: `Entry ${num}${title ? ' · ' + title : ''}`, artist: 'Dr. Thorne', album: 'Thorne’s Lab · Research log' }); } catch (e) {}
      }
    }
    audio.addEventListener('play', ui); audio.addEventListener('pause', ui);
    audio.addEventListener('ended', () => { audio.currentTime = 0; ui(); });
    audio.addEventListener('error', () => { if (audio.src) { bar.classList.add('is-missing'); ui(); } });
    audio.addEventListener('timeupdate', () => { time.textContent = audio.duration ? `${fmt(audio.currentTime)} / ${fmt(audio.duration)}` : fmt(audio.currentTime); });
    btn.addEventListener('click', () => { if (bar.classList.contains('is-missing')) return; if (audio.paused) play(); else audio.pause(); });
    mute.addEventListener('click', () => {
      muted = !muted; try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) {}
      if (muted) audio.pause();
      ui();
    });
    // Stop when the notebook scrolls fully out of view ("journal closed") or the page is hidden.
    const nb = $('#notebook');
    if (nb && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { if (!e.isIntersecting) audio.pause(); }).observe(nb);
    addEventListener('pagehide', () => audio.pause());
    // pagehide does not fire when a tab is backgrounded; visibility does.
    document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); });
    ui();
    return {
      // entry opened by the visitor: switch recording and (unless muted) start it inside the same gesture
      start(n, t) { load(n, t); if (!muted) play(); },
      // entry shown without a gesture (first load, hash change): switch recording but stay quiet
      prime(n, t) { load(n, t); },
      stop() { audio.pause(); },
    };
  })();

  const page = $('#log-page');
  if (page) {
    const tabs = $('#log-tabs'), sel = $('#log-select'), prev = $('#log-prev'), next = $('#log-next'), pos = $('#log-pos'), count = $('#log-count');
    let entries = [], cur = -1, busy = false;
    const id = e => 'entry-' + (e.fields.entry || '').replace(/\D/g, '');
    function paint(i) {
      const e = entries[i];
      const f = e.fields;
      page.innerHTML = `
        <span class="pg-no" aria-hidden="true">No. ${esc(f.entry || String(i + 1))}</span>
        <header class="pg-head">
          <p class="pg-title">${esc(e.title)}</p>
          <dl class="pg-fields">
            <dt>Entry</dt><dd>${esc(f.entry || '')}</dd>
            <dt>Date</dt><dd>${esc(f.date || '')}</dd>
            <dt>Age</dt><dd>${esc(f.age || '')}</dd>
            <dt>Location</dt><dd>${esc(f.location || '')}</dd>
          </dl>
        </header>
        <div class="pg-body">${renderBody(e.lines)}</div>
        <footer class="pg-foot"><span>Research log · ongoing</span><span>Page ${i + 1} of ${entries.length}</span></footer>`;
      page.setAttribute('aria-label', `${e.title}, Entry ${f.entry || i + 1}, ${f.date || ''}`);
      [...tabs.querySelectorAll('button')].forEach((b, j) => b.setAttribute('aria-current', j === i ? 'true' : 'false'));
      sel.value = String(i);
      prev.disabled = i === 0; next.disabled = i === entries.length - 1;
      pos.textContent = `Entry ${f.entry || i + 1} · ${i + 1} / ${entries.length}`;
    }
    function go(i, opts = {}) {
      if (i < 0 || i >= entries.length || i === cur || busy) return;
      { const f = entries[i].fields, n = (f.entry || String(i + 1)).replace(/\D/g, '') || String(i + 1); (opts.gesture ? narr.start : narr.prime)(n, f.date || ''); }
      const dir = i > cur ? 'turn-out' : 'turn-back', first = cur < 0;
      const done = () => {
        cur = i; paint(i);
        page.classList.remove('turn-out', 'turn-back'); void page.offsetWidth;
        if (!first && !reduce) page.classList.add('turn-in');
        busy = false;
        if (!opts.silent) {
          history.replaceState(null, '', '#' + id(entries[i]));
          // Keep the voice bar, which sits above the page, in view with the entry.
          const anchor = $('#lab-voice') || page;
          const top = anchor.getBoundingClientRect().top;
          const navBottom = ($('#nav')?.getBoundingClientRect().bottom || 60) + 8;
          if (top < navBottom || top > innerHeight * .6) anchor.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          page.focus({ preventScroll: true });
        }
      };
      if (first || reduce) return done();
      busy = true; page.classList.remove('turn-in'); page.classList.add(dir);
      setTimeout(done, 480);
    }
    const fromHash = () => { const k = entries.findIndex(e => '#' + id(e) === location.hash); return k; };
    fetch('lab/thorne-log.md', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(md => {
      entries = parseLog(md);
      if (!entries.length) throw new Error('no entries');
      count.textContent = `· ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} so far`;
      tabs.innerHTML = entries.map((e, i) => `<li><button type="button" data-i="${i}"><b>No. ${esc(e.fields.entry || String(i + 1))}</b><span>${esc(e.fields.date || '')}</span></button></li>`).join('');
      sel.innerHTML = entries.map((e, i) => `<option value="${i}">No. ${esc(e.fields.entry || String(i + 1))} · ${esc(e.fields.date || '')}</option>`).join('');
      const G = { gesture: true };
      // clicking the entry that is already open (re)starts its reading
      const openCur = () => { const f = entries[cur].fields; narr.start((f.entry || String(cur + 1)).replace(/\D/g, '') || String(cur + 1), f.date || ''); };
      tabs.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; if (+b.dataset.i === cur) openCur(); else go(+b.dataset.i, G); });
      sel.addEventListener('change', () => go(+sel.value, G));
      prev.addEventListener('click', () => go(cur - 1, G));
      next.addEventListener('click', () => go(cur + 1, G));
      page.addEventListener('keydown', ev => { if (ev.key === 'ArrowRight') go(cur + 1, G); if (ev.key === 'ArrowLeft') go(cur - 1, G); });
      // "Read the log" (opening the journal) starts the open entry's reading
      document.querySelectorAll('a[href="#log"]').forEach(a => a.addEventListener('click', () => { if (cur >= 0) openCur(); }));
      const h = fromHash(); go(h >= 0 ? h : 0, { silent: true });
      if (h >= 0) setTimeout(() => $('#log').scrollIntoView(), 50);
      addEventListener('hashchange', () => { const k = fromHash(); if (k >= 0) go(k); });
      window.__thorneLog = { entries, go, get cur() { return cur; } };
    }).catch(err => {
      page.innerHTML = `<p class="page-noscript">The notebook couldn’t be opened here. <a href="lab/thorne-log.md">Read the log as plain text</a>.</p>`;
      console.warn('Thorne log:', err);
    });
  }

  /* ---------------- Oscilloscope toy ---------------- */
  const cv = $('#scope-canvas');
  if (cv) {
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    let wave = 'sine', t = 0, vis = true;
    const freq = $('#sc-freq'), amp = $('#sc-amp');
    document.querySelectorAll('.scope-modes button').forEach(b => b.addEventListener('click', () => {
      wave = b.dataset.wave;
      document.querySelectorAll('.scope-modes button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
    }));
    const grid = () => {
      ctx.save(); ctx.strokeStyle = 'rgba(60,160,100,.22)'; ctx.lineWidth = 1;
      for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke(); }
      for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, i * H / 8); ctx.lineTo(W, i * H / 8); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(80,200,120,.35)'; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.restore();
    };
    const y = (x) => {
      const f = +freq.value, a = +amp.value * H * .38, ph = x / W * f * Math.PI * 2 + t;
      if (wave === 'square') return H / 2 - a * Math.sign(Math.sin(ph) || 1);
      if (wave === 'noise') return H / 2 - a * (Math.sin(ph) * .3 + (Math.random() - .5) * 1.3);
      return H / 2 - a * Math.sin(ph);
    };
    function frame() {
      ctx.fillStyle = 'rgba(3,16,9,.34)'; ctx.fillRect(0, 0, W, H); // phosphor persistence
      grid();
      ctx.save(); ctx.strokeStyle = '#5dff9b'; ctx.lineWidth = 2.4; ctx.shadowColor = '#5dff9b'; ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) { const v = y(x); x ? ctx.lineTo(x, v) : ctx.moveTo(x, v); }
      ctx.stroke(); ctx.restore();
      t += .06;
    }
    ctx.fillStyle = '#031009'; ctx.fillRect(0, 0, W, H);
    if (reduce) frame();
    else {
      new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
      (function loop() { requestAnimationFrame(loop); if (vis) frame(); })();
      [freq, amp].forEach(i => i.addEventListener('input', () => {}));
    }
    if (reduce) [freq, amp].forEach(i => i.addEventListener('input', frame));
  }

  /* ---------------- Geiger counter toy ---------------- */
  const gcBtn = $('#gc-power');
  if (gcBtn) {
    const out = $('#gc-count'), needle = $('#gc-needle'), dist = $('#gc-dist');
    let on = false, n = 0, ac = null, timer = null, recent = [];
    const click = () => {
      if (!ac) return;
      const len = Math.floor(ac.sampleRate * .004), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const s = ac.createBufferSource(), g = ac.createGain(); g.gain.value = .35; s.buffer = buf; s.connect(g).connect(ac.destination); s.start();
    };
    const tick = () => {
      if (!on) return;
      const rate = 1.5 + Math.pow((100 - +dist.value) / 100, 2) * 38; // clicks per second
      n++; out.value = String(n).padStart(5, '0'); click();
      const now = performance.now(); recent.push(now); recent = recent.filter(x => now - x < 1000);
      needle.style.transform = `rotate(${Math.min(50, -50 + recent.length * 2.6)}deg)`;
      timer = setTimeout(tick, -Math.log(1 - Math.random()) / rate * 1000);
    };
    gcBtn.addEventListener('click', () => {
      on = !on; gcBtn.setAttribute('aria-pressed', on);
      if (on) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume && ac.resume(); } catch (e) { ac = null; } tick(); }
      else { clearTimeout(timer); needle.style.transform = 'rotate(-50deg)'; recent = []; }
    });
  }

  /* ---------------- I-spy ---------------- */
  const svg = $('#ispy-svg');
  if (svg) {
    const ITEMS = [
      ['oscilloscope', 'Aging oscilloscope', 'Entry 001', 'Equipment inventory: aging oscilloscope, basic vacuum chamber, Geiger counter scavenged from nuclear physics dept., and a borrowed argon laser.'],
      ['belljar', 'Vacuum chamber (bell jar)', 'Entry 006', 'Plan to make thin films on glass slides, expose to vacuum in the bell jar, and test mechanical integrity after re-pressurization.'],
      ['geiger', 'Geiger counter', 'Entry 001', 'Geiger counter scavenged from nuclear physics dept.'],
      ['laser', 'Argon laser', 'Entry 002', 'The argon laser arrived damaged; shipping company claims “normal wear.”'],
      ['notebook', 'The notebook', 'Entry 002', 'I’m sketching starships in a basement notebook.'],
      ['plates', 'Casimir plates', 'Entry 001', 'attractive force between parallel plates due to mode suppression in the vacuum between them.'],
      ['heater', 'Space heater', 'Entry 004', 'Cold front moved in overnight; lab is 8°C and the space heater is fighting a losing battle.'],
      ['microscope', 'Stereo microscope', 'Entry 008', 'Under the stereo microscope they look like tiny glass moons.'],
      ['funcgen', 'Function generator', 'Entry 003', 'a function generator I borrowed from the electronics shop'],
      ['box', 'Locked metal box', 'Entry 008', 'Contaminated glassware is now stored in a locked metal box under the workbench.'],
      ['phone', 'Telephone', 'Entry 007', 'Paul called at 10:17 a.m.'],
      ['trehalose', 'Trehalose', 'Entry 006', 'Afternoon: ordered 100 g of trehalose and a small sample of synthetic melanin (both cheap, no oversight).'],
    ];
    const NS = 'http://www.w3.org/2000/svg';
    const list = $('#ispy-items'), marks = $('#ispy-marks'), quote = $('#ispy-quote');
    const fEl = $('#is-found'), tEl = $('#is-time'), mEl = $('#is-miss'), win = $('#ispy-win'), winText = $('#ispy-win-text');
    $('#is-total').textContent = ITEMS.length;
    let found = new Set(), misses = 0, start = 0, penalty = 0, clock = null, over = false;
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const elapsed = () => start ? (performance.now() - start) / 1000 + penalty : penalty;
    const startClock = () => { if (start) return; start = performance.now(); clock = setInterval(() => tEl.textContent = fmt(elapsed()), 250); };
    const box = k => svg.querySelector(`.hs[data-item="${k}"] .hit`).getBBox();
    const toPt = ev => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function mark(k, name) {
      const b = box(k), r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'mark-box'); r.setAttribute('x', b.x); r.setAttribute('y', b.y); r.setAttribute('width', b.width); r.setAttribute('height', b.height); r.setAttribute('rx', 10);
      const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'mark-label');
      const ty = b.y > 40 ? b.y - 10 : b.y + b.height + 26; t.setAttribute('x', b.x + 6); t.setAttribute('y', ty); t.textContent = '✓ ' + name;
      marks.append(r, t);
    }
    function render() {
      list.innerHTML = ITEMS.map(([k, n]) => `<li data-k="${k}" class="${found.has(k) ? 'done' : ''}">${n}</li>`).join('');
      fEl.textContent = found.size; mEl.textContent = misses;
    }
    function hit(k) {
      if (over || found.has(k)) return;
      startClock(); found.add(k);
      const it = ITEMS.find(x => x[0] === k);
      svg.querySelector(`.hs[data-item="${k}"]`).classList.add('found');
      mark(k, it[1]);
      quote.innerHTML = `<b>${esc(it[1])} · ${esc(it[2])}</b>“${esc(it[3])}”`;
      render();
      if (found.size === ITEMS.length) {
        over = true; clearInterval(clock); const s = elapsed(); tEl.textContent = fmt(s);
        winText.textContent = `Found in ${fmt(s)} with ${misses} miss${misses === 1 ? '' : 'es'}.`;
        win.hidden = false; $('#is-again').focus({ preventScroll: true });
      }
    }
    svg.addEventListener('click', ev => {
      if (over) return;
      const g = ev.target.closest('.hs');
      if (g) return hit(g.dataset.item);
      startClock(); misses++; mEl.textContent = misses;
      const p = toPt(ev), c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'mark-miss'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 22);
      marks.append(c); setTimeout(() => c.remove(), 900);
    });
    $('#is-hint').addEventListener('click', () => {
      if (over) return;
      const left = ITEMS.filter(x => !found.has(x[0])); if (!left.length) return;
      startClock(); penalty += 15;
      const k = left[Math.floor(Math.random() * left.length)][0], b = box(k), r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'mark-hint'); r.setAttribute('x', b.x - 6); r.setAttribute('y', b.y - 6); r.setAttribute('width', b.width + 12); r.setAttribute('height', b.height + 12); r.setAttribute('rx', 12);
      marks.append(r); setTimeout(() => r.remove(), 1900);
      const sc = $('#ispy-scene'); if (sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: (b.x + b.width / 2) / 1600 * sc.scrollWidth - sc.clientWidth / 2, behavior: 'smooth' });
      tEl.textContent = fmt(elapsed());
    });
    const reset = () => {
      found = new Set(); misses = 0; start = 0; penalty = 0; over = false; clearInterval(clock);
      marks.innerHTML = ''; svg.querySelectorAll('.hs.found').forEach(g => g.classList.remove('found'));
      tEl.textContent = '0:00'; win.hidden = true;
      quote.textContent = 'Tap an object in the scene. Each find shows where it appears in the log.';
      render();
    };
    $('#is-reset').addEventListener('click', reset);
    $('#is-again').addEventListener('click', reset);
    render();
    window.__ispy = { ITEMS, hit, get found() { return found.size; } };
  }
})();
