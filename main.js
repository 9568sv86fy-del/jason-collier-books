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
  gsap.to('.hero-inner', {yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
  gsap.to('.hero-slides', {yPercent: 18, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
  document.querySelectorAll('.book').forEach(sec => {
    const tl = {trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true};
    gsap.fromTo(sec.querySelector('.cover-wrap'), {y: 70}, {y: -70, ease: 'none', scrollTrigger: tl});
    gsap.fromTo(sec.querySelector('.book-num'), {y: 120}, {y: -120, ease: 'none', scrollTrigger: {...tl}});
    gsap.fromTo(sec.querySelector('.title'), {letterSpacing: '.08em'}, {letterSpacing: '0em', ease: 'none', scrollTrigger: {trigger: sec, start: 'top 85%', end: 'top 30%', scrub: true}});
  });
  gsap.utils.toArray('.gallery figure, .art-item').forEach((el, i) =>
    gsap.from(el, {y: 40, opacity: 0, duration: .8, ease: 'power3.out', delay: (i % 4) * .06, scrollTrigger: {trigger: el, start: 'top 92%'}}));
  gsap.fromTo('.rusty-art', {rotate: -2, y: 60}, {rotate: 1.5, y: -40, ease: 'none', scrollTrigger: {trigger: '.rusty', start: 'top bottom', end: 'bottom top', scrub: true}});
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

/* First Pulse audiobook: one video, seven parts, auto-advance */
(() => {
  const v = document.getElementById('ab-video');
  if (!v) return;
  const parts = [...document.querySelectorAll('.ab-part')];
  const title = document.getElementById('ab-title');
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
    v.load();
    if (autoplay) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
  }
  parts.forEach((b, i) => b.addEventListener('click', () => load(i, true)));
  v.addEventListener('ended', () => { if (cur < parts.length - 1) load(cur + 1, true); });
})();
