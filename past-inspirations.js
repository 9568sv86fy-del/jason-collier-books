/* Past Inspirations: shelf playback, genre filters, Archive search. */
(function () {
  var frame = document.getElementById("pi-embed");
  var nowTitle = document.getElementById("pi-now-title");
  var nowYear = document.getElementById("pi-now-year");
  var shelf = document.getElementById("pi-shelf");
  var results = document.getElementById("pi-results");
  var resultsHead = document.getElementById("pi-results-h");
  var empty = document.getElementById("pi-empty");
  var status = document.getElementById("pi-status");
  var form = document.getElementById("pi-search");
  var query = document.getElementById("pi-q");
  if (!frame || !shelf || !form) return;

  function textOf(value) {
    if (Array.isArray(value)) value = value[0];
    return value == null ? "" : String(value);
  }

  function yearOf(value) {
    var match = textOf(value).match(/\d{4}/);
    return match ? match[0] : "";
  }

  function oneLine(value) {
    var raw = textOf(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!raw) return "Public-domain feature from the Internet Archive.";
    if (raw.length > 160) raw = raw.slice(0, 157).replace(/\s+\S*$/, "") + "…";
    return raw;
  }

  function poster(img) {
    img.addEventListener("error", function () {
      if (img.parentElement) img.parentElement.classList.add("is-missing");
    });
  }

  shelf.querySelectorAll(".pi-poster img").forEach(poster);

  function play(card) {
    var id = card.getAttribute("data-id");
    if (!id) return;
    var title = (card.querySelector(".pi-title") || {}).textContent || "Film";
    var yearEl = card.querySelector(".pi-year");
    var year = yearEl ? yearEl.textContent.trim() : "";
    var next = "https://archive.org/embed/" + encodeURIComponent(id);
    if (frame.getAttribute("src") !== next) frame.setAttribute("src", next);
    frame.title = year ? title + " (" + year + ")" : title;
    nowTitle.textContent = title;
    nowYear.textContent = year;
    nowYear.hidden = !year;
    document.querySelectorAll(".pi-card").forEach(function (other) {
      var on = other === card;
      other.classList.toggle("on", on);
      if (on) other.setAttribute("aria-current", "true");
      else other.removeAttribute("aria-current");
    });
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("player").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function onPick(event) {
    var card = event.target.closest(".pi-card");
    if (!card || card.hidden) return;
    play(card);
  }
  shelf.addEventListener("click", onPick);
  results.addEventListener("click", onPick);

  document.querySelectorAll(".pi-filters button").forEach(function (button) {
    button.addEventListener("click", function () {
      var genre = button.getAttribute("data-genre");
      document.querySelectorAll(".pi-filters button").forEach(function (other) {
        var on = other === button;
        other.classList.toggle("on", on);
        other.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var shown = 0;
      shelf.querySelectorAll(".pi-card").forEach(function (card) {
        var genres = (card.getAttribute("data-genres") || "").split(/\s+/);
        var ok = genre === "all" || genres.indexOf(genre) !== -1;
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      shelf.querySelectorAll(".pi-group").forEach(function (group) {
        group.hidden = !group.querySelector(".pi-card:not([hidden])");
      });
      empty.hidden = shown !== 0;
    });
  });

  function cardHtml(film) {
    var id = textOf(film.identifier);
    var title = textOf(film.title) || "Untitled";
    var year = yearOf(film.year);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pi-card";
    button.setAttribute("data-id", id);
    button.setAttribute("data-tag", "Feature");
    var posterWrap = document.createElement("span");
    posterWrap.className = "pi-poster";
    var img = document.createElement("img");
    img.src = "https://archive.org/services/img/" + encodeURIComponent(id);
    img.alt = "";
    img.width = 320;
    img.height = 180;
    img.loading = "lazy";
    poster(img);
    posterWrap.appendChild(img);
    var meta = document.createElement("span");
    meta.className = "pi-meta";
    meta.innerHTML =
      '<span class="pi-kicker"><span class="pi-tag">Feature</span>' +
      (year ? '<span class="pi-year">' + year + "</span>" : '<span class="pi-year" hidden></span>') +
      "</span>" +
      '<strong class="pi-title"></strong><em class="pi-note"></em>';
    meta.querySelector(".pi-title").textContent = title;
    meta.querySelector(".pi-note").textContent = oneLine(film.description);
    button.appendChild(posterWrap);
    button.appendChild(meta);
    return button;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var term = query.value.replace(/[^\p{L}\p{N}\s'.-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
    if (!term) {
      setStatus("Type a title or a word to search.");
      resultsHead.hidden = true;
      results.replaceChildren();
      return;
    }
    var params = new URLSearchParams();
    params.set("q", "collection:feature_films AND mediatype:movies AND (" + term + ")");
    ["identifier", "title", "year", "description"].forEach(function (field) {
      params.append("fl[]", field);
    });
    params.append("sort[]", "downloads desc");
    params.set("rows", "24");
    params.set("page", "1");
    params.set("output", "json");
    var submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    results.setAttribute("aria-busy", "true");
    setStatus("Searching the archive…");
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 20000);
    fetch("https://archive.org/advancedsearch.php?" + params.toString(), { signal: controller.signal })
      .then(function (response) {
        if (!response.ok) throw new Error("search failed");
        return response.json();
      })
      .then(function (data) {
        var docs = (data && data.response && data.response.docs) || [];
        var seen = Object.create(null);
        results.replaceChildren();
        docs.forEach(function (doc) {
          var id = textOf(doc.identifier);
          if (!id || seen[id]) return;
          seen[id] = true;
          results.appendChild(cardHtml(doc));
        });
        var count = results.children.length;
        resultsHead.hidden = count === 0;
        if (!count) setStatus("No films matched that search.");
        else setStatus(count === 1 ? "1 film. Press a card to play it above." : count + " films. Press a card to play it above.");
      })
      .catch(function () {
        results.replaceChildren();
        resultsHead.hidden = true;
        setStatus("The archive search is unavailable right now. Try again in a moment.");
      })
      .then(function () {
        window.clearTimeout(timer);
        submit.disabled = false;
        results.removeAttribute("aria-busy");
      });
  });
})();
