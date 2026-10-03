(function () {
  var reduce = document.documentElement.classList.contains("reduce-motion");
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) reduce = true;
  } catch (e) {}

  var year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  var nav = document.getElementById("nav");
  if (nav) {
    var btn = nav.querySelector(".nav-toggle");
    var groups = Array.prototype.slice.call(nav.querySelectorAll(".nav-group"));
    var desktop = function () { return window.matchMedia("(min-width: 861px)").matches; };
    var closeGroups = function (except) {
      groups.forEach(function (g) {
        if (g === except) return;
        g.classList.remove("is-open");
        var b = g.querySelector(".nav-label");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    };
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      if (!btn) return;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
      if (!open) closeGroups();
    };
    if (btn) btn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    groups.forEach(function (g) {
      var b = g.querySelector(".nav-label");
      var links = Array.prototype.slice.call(g.querySelectorAll(".nav-menu a"));
      if (!b) return;
      b.addEventListener("click", function () {
        var willOpen = !g.classList.contains("is-open");
        closeGroups(willOpen ? g : null);
        g.classList.toggle("is-open", willOpen);
        b.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowDown") return;
        e.preventDefault();
        closeGroups(g);
        g.classList.add("is-open");
        b.setAttribute("aria-expanded", "true");
        if (links[0]) links[0].focus();
      });
      links.forEach(function (a, i) {
        a.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
          if (e.key === "ArrowUp") { e.preventDefault(); (i === 0 ? b : links[i - 1]).focus(); }
          if (e.key === "Escape") { closeGroups(); b.focus(); }
        });
      });
    });
    nav.querySelectorAll(".nav-menu a, a.nav-link").forEach(function (a) {
      a.addEventListener("click", function () {
        closeGroups();
        if (!desktop()) setMenu(false);
      });
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) {
        closeGroups();
        if (!desktop()) setMenu(false);
      }
    });
    window.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var openGroup = groups.filter(function (g) { return g.classList.contains("is-open"); })[0];
      if (openGroup) {
        var b = openGroup.querySelector(".nav-label");
        closeGroups();
        if (b) b.focus();
        return;
      }
      if (nav.classList.contains("open")) { setMenu(false); if (btn) btn.focus(); }
    });
    window.addEventListener("resize", function () { if (desktop()) setMenu(false); });
  }

  if (!reduce && "IntersectionObserver" in window) {
    var jobs = [];
    var timer = 0;
    function tick() {
      var pending = false;
      jobs = jobs.filter(function (job) {
        if (job.i >= job.text.length) {
          job.el.classList.add("is-done");
          return false;
        }
        job.i += job.text.length > 90 ? 2 : 1;
        job.live.textContent = job.text.slice(0, job.i);
        pending = true;
        return true;
      });
      if (pending) timer = window.setTimeout(tick, 16);
      else timer = 0;
    }
    function start(el) {
      var full = el.querySelector(".tele-full");
      var live = el.querySelector(".tele-live");
      if (!full || !live) return;
      el.classList.add("is-armed");
      jobs.push({ el: el, live: live, text: full.textContent, i: 0 });
      if (!timer) tick();
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        start(en.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -5% 0px" });
    Array.prototype.forEach.call(document.querySelectorAll(".teletype"), function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return;
      el.classList.add("is-armed");
      io.observe(el);
    });
  }

  var staticBtn = document.getElementById("static-btn");
  if (staticBtn) {
    var ctx, gain, source, playing = false;
    staticBtn.addEventListener("click", function () {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!ctx) {
          ctx = new AC();
          var rate = ctx.sampleRate;
          var buffer = ctx.createBuffer(1, rate, rate);
          var data = buffer.getChannelData(0);
          var last = 0;
          for (var i = 0; i < rate; i++) {
            var white = Math.random() * 2 - 1;
            last = last * 0.97 + white * 0.03;
            data[i] = white * 0.22 + last * 0.78;
          }
          source = ctx.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          var high = ctx.createBiquadFilter();
          high.type = "highpass";
          high.frequency.value = 600;
          var low = ctx.createBiquadFilter();
          low.type = "lowpass";
          low.frequency.value = 2800;
          gain = ctx.createGain();
          gain.gain.value = 0;
          source.connect(high);
          high.connect(low);
          low.connect(gain);
          gain.connect(ctx.destination);
          source.start();
        }
        if (ctx.state === "suspended") ctx.resume();
        playing = !playing;
        gain.gain.setTargetAtTime(playing ? 0.018 : 0, ctx.currentTime, 0.04);
        staticBtn.setAttribute("aria-pressed", playing ? "true" : "false");
        staticBtn.setAttribute("aria-label", playing ? "Stop radio static" : "Play faint radio static");
      } catch (err) {}
    });
  }
})();
