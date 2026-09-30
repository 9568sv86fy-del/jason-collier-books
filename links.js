/* Canonical Play and Buy URLs.
   HTML hrefs repeat these so every link works with JavaScript off.
   data-jc-link elements are updated from this map when the script runs. */
(function () {
  var links = {
    /* Jang & Tom and The Rusty Stack share one hub */
    hub: "https://kite-bolt-fleet-honey.grok.me/",
    bornTwice: "https://delta-branch-breeze-daisy.grok.me/",
    /* Found on first-pulse.html. Do not invent a replacement. */
    firstPulse: "https://fern-valley-glow-reef.grok.me/",
    oldManShort: "https://leaf-berry-scarlet-dream.grok.me/",
    amazonJang: "https://www.amazon.com/dp/B0HC596M1Y",
    amazonFirstPulse: "https://www.amazon.com/First-Pulse-Jason-Collier/dp/B0GD5YXHY6",
    amazonOldMan: "https://www.amazon.com/Old-Man-Mountain-Jason-Collier/dp/B0GT1DJCWX"
  };
  window.JC_LINKS = links;
  document.querySelectorAll("a[data-jc-link]").forEach(function (el) {
    var url = links[el.getAttribute("data-jc-link")];
    if (url) el.setAttribute("href", url);
  });
})();
