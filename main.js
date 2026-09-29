(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav state
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // scroll reveal (staggered)
  const els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
  else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const sibs = [...en.target.parentElement.querySelectorAll(':scope > .reveal')];
        en.target.style.transitionDelay = Math.min(sibs.indexOf(en.target), 6) * 80 + 'ms';
        en.target.classList.add('in'); io.unobserve(en.target);
      });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    els.forEach(e => io.observe(e));
  }
  document.getElementById('y').textContent = new Date().getFullYear();

  // 3D tilt on covers
  if (!reduce && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  // particle canvases: embers / dust / stars / snow
  if (reduce) return;
  const cfg = {
    embers:{n:70, color:()=>`hsla(${20+Math.random()*25},100%,${55+Math.random()*20}%,`, size:[1,2.6], vy:[-.9,-.25], vx:[-.25,.25], flicker:true},
    dust:{n:45, color:()=>`hsla(35,70%,75%,`, size:[.6,1.8], vy:[-.1,.1], vx:[.15,.55], flicker:false},
    stars:{n:140, color:()=>Math.random()<.3?`hsla(270,90%,85%,`:`hsla(215,100%,88%,`, size:[.4,1.7], vy:[-.03,.03], vx:[-.03,.03], flicker:true},
    snow:{n:110, color:()=>`hsla(205,40%,96%,`, size:[.8,2.6], vy:[.3,1.1], vx:[-.3,.3], flicker:false},
  };
  const rnd = ([a,b]) => a + Math.random() * (b - a);
  document.querySelectorAll('canvas.fx').forEach(cv => {
    const c = cfg[cv.dataset.fx], ctx = cv.getContext('2d'); let W, H, ps = [], vis = false;
    const size = () => { const d = Math.min(devicePixelRatio||1, 2); W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W*d; cv.height = H*d; ctx.setTransform(d,0,0,d,0,0); };
    const mk = (init) => ({x:Math.random()*W, y:init?Math.random()*H:(c.vy[0]<0?H+5:-5), r:rnd(c.size), vx:rnd(c.vx), vy:rnd(c.vy), a:Math.random()*.7+.2, t:Math.random()*6.28, col:c.color()});
    size(); ps = Array.from({length:c.n}, () => mk(true));
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
    (function tick(){
      requestAnimationFrame(tick); if (!vis) return;
      ctx.clearRect(0,0,W,H);
      for (const p of ps) {
        p.t += .03; p.x += p.vx + (cv.dataset.fx==='snow'?Math.sin(p.t)*.3:0); p.y += p.vy;
        if (p.y < -10 || p.y > H+10 || p.x < -10 || p.x > W+10) Object.assign(p, mk(false), cv.dataset.fx==='dust'?{x:-5,y:Math.random()*H}:{});
        const a = c.flicker ? p.a * (.6 + .4*Math.sin(p.t*2)) : p.a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = p.col + a + ')';
        if (cv.dataset.fx==='embers'){ctx.shadowBlur=8;ctx.shadowColor='rgba(255,120,30,.8)'} else ctx.shadowBlur=0;
        ctx.fill();
      }
    })();
  });
})();


// art filters + fullscreen lightbox with prev/next (all galleries)
(() => {
  const btns = document.querySelectorAll('.art-filters button');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    document.querySelectorAll('.art-item').forEach(it => it.classList.toggle('hide', b.dataset.f !== 'all' && it.dataset.cat !== b.dataset.f));
  }));
  const lb = document.getElementById('lightbox'); if (!lb) return;
  const img = lb.querySelector('img'), cap = lb.querySelector('p');
  let list = [], idx = 0, last = null;
  const pool = () => [...document.querySelectorAll('.art-item:not(.hide) img, .gallery img, .scene-strip img, .photo-item img')];
  const show = i => { idx = (i + list.length) % list.length; const el = list[idx]; img.src = el.src; img.alt = el.alt;
    cap.textContent = el.closest('figure')?.querySelector('figcaption')?.textContent || el.alt || ''; };
  const open = el => { last = el; list = pool(); show(list.indexOf(el)); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; last && last.focus(); };
  pool().forEach(el => { el.classList.add('zoomable'); el.tabIndex = 0; el.setAttribute('role','button');
    el.addEventListener('click', () => open(el)); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } }); });
  lb.querySelector('.lb-close').onclick = close;
  lb.querySelector('.lb-prev').onclick = e => { e.stopPropagation(); show(idx - 1); };
  lb.querySelector('.lb-next').onclick = e => { e.stopPropagation(); show(idx + 1); };
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
})();

// GSAP scroll-driven parallax (progressive enhancement)
addEventListener('load', () => {
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  if (document.querySelector('.hero')) {
  gsap.to('.hero-inner', {yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
  gsap.to('.hero-slides', {yPercent: 18, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
  }
  document.querySelectorAll('.book').forEach(sec => {
    const tl = {trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true};
    gsap.fromTo(sec.querySelector('.cover-wrap'), {y: 70}, {y: -70, ease: 'none', scrollTrigger: tl});
    gsap.fromTo(sec.querySelector('.book-num'), {y: 120}, {y: -120, ease: 'none', scrollTrigger: {...tl}});
    gsap.fromTo(sec.querySelector('.title'), {letterSpacing: '.08em'}, {letterSpacing: '0em', ease: 'none', scrollTrigger: {trigger: sec, start: 'top 85%', end: 'top 30%', scrub: true}});
  });
  gsap.utils.toArray('.gallery figure, .art-item').forEach((el, i) =>
    gsap.from(el, {y: 40, opacity: 0, duration: .8, ease: 'power3.out', delay: (i % 4) * .06, scrollTrigger: {trigger: el, start: 'top 92%'}}));
  if (document.querySelector('.rusty-art')) gsap.fromTo('.rusty-art', {rotate: -2, y: 60}, {rotate: 1.5, y: -40, ease: 'none', scrollTrigger: {trigger: '.rusty', start: 'top bottom', end: 'bottom top', scrub: true}});
});

// collapsible excerpts
document.querySelectorAll('.excerpt').forEach((ex, i) => {
  const body = ex.querySelector('.excerpt-body'); if (!body || body.textContent.trim().startsWith('[')) return;
  ex.classList.add('collapsible'); body.id = body.id || 'excerpt-' + i;
  const b = document.createElement('button'); b.className = 'more'; b.type = 'button';
  b.setAttribute('aria-controls', body.id); b.setAttribute('aria-expanded', 'false'); b.textContent = 'Continue reading ↓';
  b.onclick = () => { const o = ex.classList.toggle('open'); b.setAttribute('aria-expanded', o); b.textContent = o ? 'Show less ↑' : 'Continue reading ↓'; };
  ex.appendChild(b);
});

/* Audiobook players: one video per player, a list of parts, auto-advance */
(() => {
  document.querySelectorAll('.audiobook').forEach(box => {
    const v = box.querySelector('.ab-player video');
    if (!v) return;
    const parts = [...box.querySelectorAll('.ab-part')];
    const title = box.querySelector('.ab-now span');
    const synopsis = box.querySelector('.ab-synopsis');
    const meta = box.querySelector('.ab-meta');
    let cur = 0;
    function load(i, autoplay) {
      if (i < 0 || i >= parts.length) return;
      cur = i;
      const b = parts[i];
      parts.forEach((p, j) => { p.classList.toggle('on', j === i); if (j === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current'); });
      v.poster = b.dataset.poster;
      v.src = b.dataset.src;
      v.setAttribute('aria-label', b.dataset.title);
      if (title) title.textContent = b.dataset.title;
      if (synopsis) synopsis.textContent = b.dataset.synopsis || '';
      if (meta) meta.textContent = b.dataset.meta || '';
      v.load();
      if (autoplay) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
    }
    parts.forEach((b, i) => b.addEventListener('click', () => load(i, true)));
    v.addEventListener('ended', () => { if (cur < parts.length - 1) load(cur + 1, true); });
  });
})();

/* Jang & Tom audiobook tabs: one visible book at a time */
(() => {
  const tabs = [...document.querySelectorAll('.ab-tabs [role="tab"]')];
  if (!tabs.length) return;
  function select(t, focus) {
    tabs.forEach(x => {
      const on = x === t, panel = document.getElementById(x.getAttribute('aria-controls'));
      x.classList.toggle('on', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      if (!panel) return;
      panel.hidden = !on;
      const v = panel.querySelector('video');
      if (v && !on && !v.paused) v.pause();
    });
    if (focus) t.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); }
    });
  });
  const fromHash = () => { const t = tabs.find(x => '#' + x.getAttribute('aria-controls') === location.hash);
    if (t) { select(t); const s = document.getElementById('jang-and-tom'); if (s) s.scrollIntoView(); } };
  fromHash(); addEventListener('hashchange', fromHash);
})();

/* Mobile nav toggle */
(() => {
  const nav = document.getElementById('nav'), btn = nav && nav.querySelector('.nav-toggle');
  if (!btn) return;
  const set = o => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); btn.setAttribute('aria-label', o ? 'Close menu' : 'Menu'); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 1280) set(false); });
})();

/* Share: one control, injected on book pages, audiobooks, I Spy, Thorne's Lab, and home */
(() => {
  const body = document.body;
  const show = body.classList.contains('home')
    || body.classList.contains('page-book')
    || body.classList.contains('page-audio')
    || body.classList.contains('page-lab');
  if (!show || document.getElementById('share-popover')) return;

  const wrap = document.createElement('div');
  wrap.className = 'share';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-line btn-share';
  btn.textContent = 'Share';
  btn.setAttribute('aria-label', 'Share this page');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-controls', 'share-popover');

  const pop = document.createElement('div');
  pop.className = 'share-pop';
  pop.id = 'share-popover';
  pop.hidden = true;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Share this page');

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'share-action';
  copyBtn.textContent = 'Copy link';

  const status = document.createElement('p');
  status.className = 'share-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const xLink = document.createElement('a');
  xLink.className = 'share-action';
  xLink.target = '_blank';
  xLink.rel = 'noopener noreferrer';
  xLink.textContent = 'Share on X';

  const fbLink = document.createElement('a');
  fbLink.className = 'share-action';
  fbLink.target = '_blank';
  fbLink.rel = 'noopener noreferrer';
  fbLink.textContent = 'Share on Facebook';

  pop.append(copyBtn, status, xLink, fbLink);
  wrap.append(btn);

  let placed = false;
  if (body.classList.contains('page-ispy')) {
    const head = document.querySelector('.ispy-head');
    if (head) { head.insertAdjacentElement('afterend', wrap); placed = true; }
  } else if (body.classList.contains('page-lab')) {
    const intro = document.querySelector('.lab-intro');
    if (intro) { intro.appendChild(wrap); placed = true; }
  } else if (body.classList.contains('page-audio')) {
    const head = document.querySelector('.page-head');
    if (head) { head.appendChild(wrap); placed = true; }
  } else if (body.classList.contains('page-book')) {
    const row = document.querySelector('.buy, .cta-row');
    if (row) { row.appendChild(wrap); placed = true; }
  } else if (body.classList.contains('home')) {
    const row = document.querySelector('.hero .cta-row');
    if (row) { row.appendChild(wrap); placed = true; }
  }
  if (!placed) return;
  document.body.appendChild(pop);

  const payload = () => ({ title: document.title, text: document.title, url: location.href });
  const fillLinks = data => {
    xLink.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(data.url) + '&text=' + encodeURIComponent(data.text);
    fbLink.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(data.url);
  };
  fillLinks(payload());

  let timer = 0;
  const focusables = () => [...pop.querySelectorAll('button, a[href]')];
  const place = () => {
    const r = btn.getBoundingClientRect();
    pop.style.top = (r.bottom + 6) + 'px';
    pop.style.left = Math.max(8, r.left) + 'px';
    pop.style.right = 'auto';
    pop.style.bottom = 'auto';
    const pr = pop.getBoundingClientRect();
    if (pr.right > innerWidth - 8) pop.style.left = Math.max(8, innerWidth - pr.width - 8) + 'px';
    const pr2 = pop.getBoundingClientRect();
    if (pr2.bottom > innerHeight - 8) pop.style.top = Math.max(8, r.top - pr2.height - 6) + 'px';
  };
  const open = () => {
    fillLinks(payload());
    status.textContent = '';
    copyBtn.textContent = 'Copy link';
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    place();
    copyBtn.focus();
  };
  const close = restore => {
    if (pop.hidden) return;
    pop.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    status.textContent = '';
    copyBtn.textContent = 'Copy link';
    clearTimeout(timer);
    if (restore) btn.focus();
  };

  btn.addEventListener('click', async () => {
    if (!pop.hidden) { close(false); return; }
    const data = payload();
    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
      try { await navigator.share(data); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    open();
  });

  copyBtn.addEventListener('click', async () => {
    const url = location.href;
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        const write = navigator.clipboard.writeText(url);
        await Promise.race([write, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))]);
        ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      copyBtn.focus();
    }
    const message = ok ? 'Link copied' : 'Could not copy link';
    copyBtn.textContent = message;
    status.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => { copyBtn.textContent = 'Copy link'; status.textContent = ''; }, 2000);
  });

  pop.addEventListener('click', e => { if (e.target.closest('a')) close(false); });
  addEventListener('click', e => { if (!pop.hidden && !wrap.contains(e.target) && !pop.contains(e.target)) close(false); });
  addEventListener('scroll', () => { if (!pop.hidden) place(); }, {passive:true});
  addEventListener('resize', () => { if (!pop.hidden) place(); });
  addEventListener('keydown', e => {
    if (pop.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
