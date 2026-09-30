/* Old Man On The Mountain — a short hunt in the browser.
   Harlan Wade has seven days to tag the old bull and get off the ridge.
   World art is drawn on the canvas. Story pictures are the book's own. */
(function () {
  "use strict";

  const KEY = "omotm-hunt-v1";
  const DAY_LEN = 300; // 5 real minutes, dawn to the next dawn
  const ART = "old-man-audiobook/img/";

  const AREAS = {
    trailhead: { name: "Trailhead", w: 2300, left: null, right: "ridge", trees: 14, gap: 130, dead: 0.15, snow: 0.28, open: true, creek: false, biome: "low", seed: 2,
      enter: "Trailhead. The truck sits in the gravel. Seven days start here, and they have to end here too." },
    ridge: { name: "The High Ridge", w: 2700, left: "trailhead", right: "meadow", trees: 16, gap: 120, dead: 0.35, snow: 0.72, open: true, creek: false, biome: "high", seed: 5,
      enter: "The high ridge. Wind comes over it like a skinning knife, and the country below looks deep enough to swallow a man." },
    meadow: { name: "Elk Meadow", w: 2600, left: "ridge", right: "creek", trees: 10, gap: 200, dead: 0.12, snow: 0.4, open: true, creek: false, biome: "park", seed: 8,
      enter: "Elk meadow. Open grass, a few spruce, and beds in the snow if you walk slow enough to see them." },
    creek: { name: "The Creek", w: 2400, left: "meadow", right: "timber", trees: 16, gap: 110, dead: 0.22, snow: 0.34, open: false, creek: true, biome: "creek", seed: 11,
      enter: "The creek is half ice. Tracks gather where the bank is soft." },
    seep: { name: "The Seep", w: 1700, left: "creek", right: null, trees: 8, gap: 160, dead: 0.1, snow: 0.38, open: true, creek: true, biome: "park", seed: 14, side: true,
      enter: "A side trail to the seep. Open water, and the kind of mud that keeps a story." },
    timber: { name: "Dark Timber", w: 2800, left: "creek", right: "camp", trees: 34, gap: 62, dead: 0.4, snow: 0.48, open: false, creek: false, biome: "dark", seed: 17,
      enter: "Dark timber, thick as dog hair. The blazes are the only reason the trail still exists." },
    camp: { name: "Camp on the Knoll", w: 1900, left: "timber", right: null, trees: 12, gap: 120, dead: 0.28, snow: 0.58, open: false, creek: false, biome: "camp", seed: 20,
      enter: "Camp on the knoll. Tent, fire ring, a shack that has outlived its owners. This is the place you do not abandon after dark." },
    basin: { name: "High Basin", w: 2700, left: null, right: null, trees: 12, gap: 170, dead: 0.18, snow: 0.86, open: true, creek: false, biome: "high", seed: 23, side: true,
      enter: "The high basin. First light and last light, this is where the old bull belongs." }
  };

  const SHORT = {
    trailhead: "Trailhead", ridge: "Ridge", meadow: "Meadow", creek: "Creek",
    timber: "Timber", camp: "Camp", basin: "Basin", seep: "Seep"
  };
  const ROUTE = ["trailhead", "ridge", "meadow", "creek", "timber", "camp"];

  const SPOTS = {
    trailhead: [
      { id: "truck", x: 250, r: 78, kind: "examine", win: true, prompt: "The truck",
        text: "The truck will wait in the gravel as long as the cold lets it. You are not done until the tag is filled and your boots are back on this ground.",
        toast: "The truck can wait. You cannot, not past day seven.", again: "Still here. The mountain is the part that does not wait." },
      { id: "register", x: 680, r: 64, kind: "examine", prompt: "Trail register",
        text: "The last party signed out nine days ago. The line for signing back in is blank. You write your name, the date, and seven days, because that is the bargain.",
        toast: "You sign the register. Seven days." },
      { id: "wood-th", x: 1080, r: 56, kind: "wood" },
      { id: "tracks-th", x: 1580, r: 46, kind: "sign", sign: "tracks", dread: 8, prompt: "Look",
        text: "A print in the crust beside where a boot would land. Longer than a hoof, and it does not cross the human track. It follows it.",
        toast: "Tracks that follow, and do not cross.", again: "The print is still there. It has not filled with snow." }
    ],
    ridge: [
      { id: "glass-ridge", x: 480, r: 80, kind: "glass", prompt: "Overlook" },
      { id: "wood-rg1", x: 980, r: 54, kind: "wood" },
      { id: "branch-rg", x: 1280, r: 44, kind: "sign", sign: "branch", dread: 7,
        text: "A limb snapped off green, about as high as a man can reach if the man is tall and does not care to go around. The break is fresh.",
        toast: "A limb broken high, on purpose or by something tall.", again: "The wood is still green at the break." },
      { id: "fork-basin-r", x: 1720, r: 74, kind: "fork", to: "basin", board: "BASIN", prompt: "Blaze to the basin",
        text: "A cairn and a cut blaze angled uphill. The high basin is that way, shorter than the long trail and meaner." },
      { id: "claw-rg", x: 2140, r: 42, kind: "sign", sign: "claw", dread: 9,
        text: "Four gouges in a snag, higher than a bear bothers to mark, and no other track in the snow that explains them.",
        toast: "Claw marks, and no animal you came to hunt.", again: "The gouges catch the light." },
      { id: "wood-rg2", x: 2460, r: 54, kind: "wood" }
    ],
    meadow: [
      { id: "cam-meadow", x: 460, r: 64, kind: "cam", prompt: "Camera tree" },
      { id: "rub", x: 980, r: 58, kind: "examine", clue: true, prompt: "Rubbed spruce",
        text: "A spruce rubbed pale as high as your hat. Pitch still weeps. A heavy neck did this, and not a small one. The old bull’s calling card.",
        toast: "A high rub. The old bull has been through.", again: "The rub is still wet with pitch." },
      { id: "wood-md", x: 1320, r: 54, kind: "wood" },
      { id: "tracks-md", x: 2080, r: 48, kind: "sign", sign: "tracks", clue: true, dread: 8,
        text: "Hooves, deep, dewclaws showing, headed toward the creek and the timber. Beside them a second line follows and never once steps across the elk.",
        toast: "The bull’s track, and something following him.", again: "You already know this pair of trails." }
    ],
    creek: [
      { id: "wood-ck1", x: 380, r: 54, kind: "wood" },
      { id: "tracks-ck", x: 1280, r: 46, kind: "sign", sign: "tracks", dread: 6,
        text: "In the mud at the ford, elk have watered. One set of prints walks out on two feet and keeps to the darker grass, parallel to the game trail.",
        toast: "The mud kept a two-footed track.", again: "The creek has not washed it out." },
      { id: "wood-ck2", x: 1640, r: 54, kind: "wood" },
      { id: "fork-seep", x: 2020, r: 70, kind: "fork", to: "seep", board: "SEEP", prompt: "Game trail to the seep",
        text: "A faint side trail, more hoof than boot. The seep is down there." }
    ],
    seep: [
      { id: "seep-look", x: 640, r: 70, kind: "examine", prompt: "The seep",
        text: "Open water in a frozen park. Elk have drunk here. At the edge of the mud something stood a long time on two feet, then stepped back into its own tracks.",
        toast: "The seep is used. Not only by elk.", again: "The water keeps moving. The tracks do not." },
      { id: "claw-seep", x: 1120, r: 44, kind: "sign", sign: "claw", dread: 7,
        text: "Claw marks on a willow stem, four of them, and the stem is not thick enough to have been a casual scratch.",
        toast: "Marks on the willow.", again: "Still there." },
      { id: "wood-seep", x: 1460, r: 54, kind: "wood" }
    ],
    timber: [
      { id: "wood-tm1", x: 340, r: 52, kind: "wood" },
      { id: "cam-timber", x: 820, r: 64, kind: "cam", prompt: "Camera tree" },
      { id: "branch-tm", x: 1220, r: 44, kind: "sign", sign: "branch", dread: 8,
        text: "Another limb, broken inward, at the height of a raised arm. The timber is full of dead wood. This one was alive this morning.",
        toast: "A green limb, broken high.", again: "You have seen the break." },
      { id: "silence-tm", x: 1620, r: 90, kind: "silence", sign: "silence", dread: 12,
        text: "You stop, and the stopping shows you what was already true. The birds are gone. The little tick of snow on a sleeve is gone. Your father would have built the fire higher for less than this.",
        toast: "The timber has gone quiet.", again: "Still quiet. You do not like it any better." },
      { id: "claw-tm", x: 2060, r: 42, kind: "sign", sign: "claw", dread: 9,
        text: "Four pale cuts in dark bark. You fit a hand near them and your hand is too small, and too low.",
        toast: "Claw marks above your hand.", again: "They are not weathering." },
      { id: "wood-tm2", x: 2480, r: 52, kind: "wood" }
    ],
    camp: [
      { id: "tent", x: 700, r: 74, kind: "sleep", prompt: "The tent" },
      { id: "fire", x: 980, r: 70, kind: "fire", prompt: "Fire ring" },
      { id: "cabin", x: 1240, r: 72, kind: "examine", prompt: "Line shack",
        text: "A sagging shack, a tin of matches, a coil of wire, a bunk that smells like mice. You leave it as you found it. The mountain already keeps enough of other people.",
        toast: "The shack has nothing you need more than a fire.", again: "You let the shack alone." },
      { id: "wood-camp", x: 1360, r: 54, kind: "wood" },
      { id: "fork-basin-c", x: 1640, r: 72, kind: "fork", to: "basin", board: "BASIN", prompt: "Basin trail",
        text: "From the knoll the basin trail climbs hard and short. If the old bull is feeding at the edges of day, this is the way." }
    ],
    basin: [
      { id: "cam-basin", x: 460, r: 66, kind: "cam", prompt: "Camera tree" },
      { id: "bed", x: 1040, r: 64, kind: "examine", clue: true, prompt: "A bed in the snow",
        text: "A bed the size of a table, hair on the spruce above it pale at the tips. The old one lies here when the sun is wrong for traveling. He will not be here at noon. Dawn, and again at last light.",
        toast: "The old bull’s bed. Dawn and dusk, not noon.", again: "The bed is cold right now." },
      { id: "bench", x: 2140, r: 70, kind: "examine", scene: "bench", prompt: "Cliff-top bench",
        text: "A shelf of snow and old stone above the basin. A scuff at the lip that is not a hoof.",
        toast: "The bench. You do not kneel long.", again: "You already stood here." },
      { id: "wood-basin", x: 2480, r: 54, kind: "wood" }
    ]
  };

  const PHOTOS = {
    bull: { src: ART + "om29_bull.webp", cap: "A heavy bull, pale in the flash. The left brow looks notched. He was here after you left." },
    young: { src: ART + "om06_bugles.webp", cap: "Elk in the dark. A smaller rack, even across. Not the old one." },
    cow: { src: ART + "om18_cow_elk.webp", cap: "A cow, head up, as if the seep has gone wrong around her." },
    deer: { src: ART + "om28_blowdown_buck.webp", cap: "Mule deer. Ears like paddles. He is looking past the camera at something you cannot see." },
    beast: { src: ART + "om21_smudge.webp", cap: "Mostly snow, and a smudge at the edge of the flash. Taller than a man, if it is a man." },
    upright: { src: ART + "om19_upright.webp", cap: "The card caught something standing up on the far side. You do not ask the glass to enlarge it." },
    empty: { src: ART + "om26_silent_snow.webp", cap: "Wind and snow. The park looks empty. The quiet does not agree." },
    tracks: { src: ART + "om14_following_tracks.webp", cap: "Your trail, or something like it, and a second line of tracks that never crosses." }
  };

  const SCENES = {
    dawn1: {
      img: ART + "om01_ridge.webp", kicker: "Day one · Optimism", title: "The high ridge",
      journal: "Day one. Seven days on the tag. Father’s rifle. The wind has a knife in it.",
      ps: [
        "The wind cut like a skinning knife across the high ridge, carrying the bite of early winter down from the glaciers.",
        "Harlan Wade pulls the wool higher on his neck and keeps walking. He is sixty-eight. The mountains have made him look older, and a white scar from a bull’s tine runs into his beard. His father’s rifle is on his shoulder. He has seven days.",
        "Somewhere above the dark timber a bull is talking to the ridges. He means to tag that bull — the old one — and be off this mountain before it decides he belongs to it."
      ]
    },
    dawn2: {
      img: ART + "om15_shadow_walkers.webp", kicker: "Day two", title: "Shadow walkers",
      journal: "Father’s warning: shadow walkers follow a man and do not cross his tracks.",
      ps: [
        "His father told him, beside a fire a long time ago, that some things in this country follow a man and do not cross his tracks. He called them shadow walkers. Harlan was a boy then and did not want the story. He wants it less now.",
        "He thinks of his own son, years later, small against him in a Brooks Range wind. Different mountain. Same lesson. Keep the fire up. Do not go looking for what is already looking for you."
      ]
    },
    dawn3: {
      img: ART + "om20_trail_camera.webp", kicker: "Day three", title: "Not yet",
      journal: "Not yet. One more day on the bull. The cameras can watch while he sleeps.",
      ps: [
        "The cameras are a habit: lens toward the open, strap cinched high enough that elk pass under and a taller thing would fill the frame. In the morning the cards will say what the dark would not.",
        "He could walk out. He knows the shape of that choice. He also knows the bull is still up there. Not yet. One more day."
      ]
    },
    dawn4: {
      img: ART + "om26_silent_snow.webp", kicker: "Day four", title: "Stillness",
      journal: "Father’s lesson: be still, and let the old bull believe he is alone.",
      ps: [
        "His father sat him on a log until the woods forgot he was there. That was the lesson. Quiet was not the same thing as not talking. You let the mountain move first, and the old bulls came out of the shadow believing they were alone.",
        "Harlan breathes into his collar and makes himself small. A pale rack. A notch in the brow. He will know the animal when the country gives it to him."
      ]
    },
    dawn5: {
      img: ART + "om31_caleb.webp", kicker: "Day five", title: "The boy",
      journal: "Thought of Caleb on a bench of stone, and of a storm that would not let them go.",
      ps: [
        "He remembers Caleb on a cliff-top bench, the two of them reading sign in the snow and saying little. The boy had his jaw set the way boys do when they are trying to be the man beside them.",
        "Before that, the Brooks Range: wolves that would not leave, a whiteout that took the world down to the length of an arm. They lived by staying together and moving one step at a time. The mountain did not care that they were kin. It cared that they did not stop."
      ]
    },
    dawn6: {
      img: ART + "om19_upright.webp", kicker: "Day six", title: "Upright",
      journal: "Saw it upright on the far ridge. It did not hurry.",
      ps: [
        "At dusk the far ridge held a shape that was not a spruce and not an elk. It stood up. It was tall in the wrong places. It did not hurry.",
        "Harlan kept the rifle low and the fire, as much as a man can, between that shape and his sleep. He did not blink more than he had to."
      ]
    },
    dawn7: {
      img: ART + "om46_chorus.webp", kicker: "Day seven", title: "The last light",
      journal: "Last day. Tag the old bull if he is still walking. Then get off the mountain.",
      ps: [
        "Last day. The ridges feel crowded, as if more than one mouth is waiting to answer a bugle. If the old bull is not tagged, this is the morning that matters. If he is, the only work left is the walk down.",
        "Harlan checks the rifle and the tag in his pocket. The mountain can keep its secrets. It does not get to keep him, not if his legs hold."
      ]
    },
    deer: {
      img: ART + "om28_blowdown_buck.webp", kicker: "The blowdown", title: "Mule deer",
      journal: "Mule deer in the blowdown, looking past me into the timber. The deer are not calm.",
      ps: [
        "A mule deer buck stands in the blowdown, ears forward, as if he agreed to be seen and is already regretting it. Harlan’s father used to say the deer tell the truth about a mountain. Calm deer, calm timber.",
        "This one is not calm. He looks past Harlan into the dark spruce, at a thing the man cannot pick out yet. When the buck leaves, the quiet he leaves behind is too big."
      ]
    },
    firemem: {
      img: ART + "om36_brooks_range.webp", kicker: "A night already lived", title: "Older than wolves",
      journal: "Fire up. Remembered the Brooks Range, Caleb against his side, wolves that would not leave.",
      ps: [
        "The fire climbs and the knoll comes back into being. Memory puts his father’s Colt on Harlan’s hip — a cold weight, Brooks Range, Caleb pressed to his ribs while wolves stitched the whiteout with their voices and never quite left.",
        "They had lived. Not by being brave. By feeding the flame and not walking out to meet what was already interested. He keeps inside the light."
      ]
    },
    bench: {
      img: ART + "om30_blood_trail.webp", kicker: "The bench", title: "Blood and stone",
      journal: "Cliff-top bench. A scuff that was not a hoof. Thought of Caleb, and of sign that does not lie.",
      ps: [
        "The cliff-top bench is a shelf of snow and old stone. He and Caleb stood in a place like this once and let the country tell them if the bull was still ahead. Sign does not lie if you are willing to read all of it.",
        "What is ahead now is not only elk. The snow at the lip holds a scuff that is not a hoof. Harlan does not kneel to it long. Kneeling is how a man stays."
      ]
    },
    tagged: {
      img: ART + "om32_old_warrior.webp", kicker: "The tag", title: "The old warrior",
      journal: "Tagged the old bull. Something in the timber heard the shot. Get down to the trailhead.",
      ps: [
        "The bull goes down the way a great animal should, heavy and without panic. Harlan’s hands shake when he fills the tag. The scar on his cheek aches in the cold, an old debt paid to an older animal.",
        "He lays the rifle in the snow just long enough to breathe. When he takes it up again he has the feeling of another hand already knowing the stock. In the timber a limb pops, deliberate as an axe. The shot was heard by something that was never an elk.",
        "Get off the mountain. Do not spend another night up here if the legs will answer."
      ]
    }
  };

  const SKY = [
    { t: 0.00, top: "#070b14", hor: "#1c2744", amb: 0.16, sun: 0, moon: 1, stars: 1 },
    { t: 0.06, top: "#1a2040", hor: "#c46a62", amb: 0.32, sun: 0.25, moon: 0.45, stars: 0.35 },
    { t: 0.14, top: "#6a88aa", hor: "#f0c7a4", amb: 0.72, sun: 0.85, moon: 0, stars: 0 },
    { t: 0.34, top: "#78a0cc", hor: "#d7e6f4", amb: 1, sun: 1, moon: 0, stars: 0 },
    { t: 0.50, top: "#5c82ae", hor: "#f0d0a8", amb: 0.86, sun: 0.7, moon: 0, stars: 0 },
    { t: 0.60, top: "#3a3d72", hor: "#e07a48", amb: 0.5, sun: 0.28, moon: 0.25, stars: 0.15 },
    { t: 0.72, top: "#121628", hor: "#3a2438", amb: 0.2, sun: 0, moon: 0.85, stars: 0.8 },
    { t: 0.88, top: "#070b16", hor: "#182033", amb: 0.12, sun: 0, moon: 1, stars: 1 },
    { t: 1.00, top: "#070b14", hor: "#1c2744", amb: 0.16, sun: 0, moon: 1, stars: 1 }
  ];

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  let dpr = 1, viewW = 800, viewH = 600, visT = 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const down = {};
  const once = [];
  const hold = { left: false, right: false };
  const ptr = {};
  let sceneQ = [];
  let confirmFn = null;
  let helpReturn = "title";
  let confirmReturn = "play";
  let chromeMode = "";
  let hudSig = "";
  let saveT = 0;
  let saidPhase = "";

  const imgCache = {};
  function image(src) {
    if (!imgCache[src]) {
      const im = new Image();
      im.src = src;
      imgCache[src] = im;
    }
    return imgCache[src];
  }

  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }
  function n1(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
  }
  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerpHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }
  function skySample(t) {
    t = ((t % 1) + 1) % 1;
    let i = 0;
    while (i < SKY.length - 2 && SKY[i + 1].t < t) i++;
    const a = SKY[i], b = SKY[i + 1];
    const u = clamp((t - a.t) / ((b.t - a.t) || 1), 0, 1);
    const num = (k) => a[k] + (b[k] - a[k]) * u;
    return { top: lerpHex(a.top, b.top, u), hor: lerpHex(a.hor, b.hor, u), amb: num("amb"), sun: num("sun"), moon: num("moon"), stars: num("stars") };
  }
  function phaseName(t) {
    if (t < 0.14) return "Dawn";
    if (t < 0.46) return "Day";
    if (t < 0.64) return "Dusk";
    if (t < 0.92) return "Night";
    return "The small hours";
  }
  function isNight(t) { return t >= 0.58 && t < 0.95; }
  function nightAmount(t) {
    if (t < 0.05) return 0.78;
    if (t < 0.16) return 0.78 - (t - 0.05) / 0.11 * 0.78;
    if (t < 0.50) return 0;
    if (t < 0.66) return (t - 0.50) / 0.16 * 0.86;
    if (t < 0.92) return 0.86;
    return 0.7;
  }
  function leftDest() {
    if (state.area === "basin") return state.returnTo || "camp";
    if (state.area === "seep") return "creek";
    return AREAS[state.area].left;
  }
  function destX(from, to) {
    if (from === "seep" && to === "creek") return 1900;
    if (from === "basin" && to === "ridge") return 1640;
    if (from === "basin" && to === "camp") return 1500;
    if (to === "basin" || to === "seep") return 170;
    const dest = AREAS[to];
    if (dest.left === from) return 170;
    return dest.w - 170;
  }
  function spotById(area, id) {
    return (SPOTS[area] || []).find((s) => s.id === id) || null;
  }
  function groundBase() { return Math.max(220, viewH - 150); }
  function groundY(wx) {
    const a = AREAS[state.area] || AREAS.ridge;
    return groundBase() + Math.sin(wx * 0.0075) * 5 + (n1(wx * 0.014 + a.seed) - 0.5) * 14;
  }
  function cameraX() {
    const a = AREAS[state.area];
    if (!a) return 0;
    if (a.w <= viewW) return (a.w - viewW) / 2;
    return clamp(state.x - viewW * 0.4, 0, a.w - viewW);
  }
  function axis() {
    let x = 0;
    if (down.ArrowLeft || down.KeyA || hold.left) x -= 1;
    if (down.ArrowRight || down.KeyD || hold.right) x += 1;
    return x;
  }
  function sprinting() { return !!(down.ShiftLeft || down.ShiftRight); }

  function fresh() {
    return {
      v: 1, mode: "play", day: 1, t: 0.1, area: "trailhead", x: 430, face: 1,
      warmth: 76, fear: 8, wood: 1, cams: 2, fire: 0, crouch: false, stillness: 0,
      tagged: false, escaping: false, returnTo: "camp", clues: 0, screamed: false,
      glassedBull: false, heardBugle: false, hinted: false, charge: 0, safe: 0,
      flicker: 0, fade: 0, fadeTo: null, lock: 0, walk: 0, prompt: "", toast: "", toastT: 0,
      glassT: 0, glassBeast: false, aim: null, chase: null, bugleIn: 18,
      alive: {}, posts: {}, gone: {}, woodTaken: {}, seen: {}, found: {}, visited: {},
      journal: [], stats: { signs: 0, cams: 0, fires: 0 }
    };
  }
  let state = fresh();

  const PROPS = {};
  function buildProps() {
    Object.keys(AREAS).forEach((id) => {
      const a = AREAS[id];
      const rng = mulberry32(a.seed * 997);
      const trees = [];
      let x = 30;
      while (x < a.w - 30) {
        const kindRoll = rng();
        let kind = "spruce";
        if (kindRoll < a.dead) kind = "dead";
        else if (a.biome === "low" && kindRoll < 0.55) kind = "aspen";
        else if (a.biome === "creek" && kindRoll < 0.35) kind = "willow";
        trees.push({ x: x, sc: 0.72 + rng() * 0.85, kind: kind });
        const tight = a.biome === "dark" ? 0.45 : 1;
        x += (a.gap * tight) * (0.55 + rng() * 0.7);
      }
      const rocks = [];
      for (let i = 0; i < 10; i++) rocks.push({ x: rng() * a.w, r: 5 + rng() * 12 });
      PROPS[id] = { trees: trees, rocks: rocks };
    });
  }

  const STARS = Array.from({ length: 80 }, (_, i) => ({
    x: hash(i * 3.1), y: hash(i * 5.3) * 0.62, r: 0.4 + hash(i * 1.7) * 1.3, p: hash(i * 9)
  }));
  const FLAKES = Array.from({ length: reduce ? 24 : 80 }, (_, i) => ({
    x: hash(i + 2), y: hash(i + 4), s: 0.7 + hash(i + 6) * 1.7, v: 14 + hash(i + 8) * 30, d: hash(i + 10) * 6
  }));

  function pack() {
    return {
      v: 1, day: state.day, t: state.t, area: state.area, x: state.x, face: state.face,
      warmth: state.warmth, fear: state.fear, wood: state.wood, cams: state.cams, fire: state.fire,
      crouch: state.crouch, tagged: state.tagged, escaping: state.escaping, returnTo: state.returnTo,
      clues: state.clues, screamed: state.screamed, glassedBull: state.glassedBull,
      heardBugle: state.heardBugle, hinted: state.hinted, charge: state.charge,
      posts: state.posts, gone: state.gone, woodTaken: state.woodTaken, seen: state.seen,
      found: state.found, visited: state.visited, journal: state.journal, stats: state.stats
    };
  }
  function save() {
    try {
      if (state.mode === "title") return;
      if (state.mode === "end") { localStorage.removeItem(KEY); return; }
      localStorage.setItem(KEY, JSON.stringify(pack()));
    } catch (e) { /* private mode */ }
  }
  function readSave() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== 1 || !AREAS[data.area]) return null;
      return data;
    } catch (e) { return null; }
  }
  function applySave(data) {
    const next = fresh();
    ["day", "t", "area", "x", "face", "warmth", "fear", "wood", "cams", "fire", "crouch", "tagged", "escaping", "returnTo", "clues", "screamed", "glassedBull", "heardBugle", "hinted", "charge"].forEach((k) => {
      if (data[k] !== undefined) next[k] = data[k];
    });
    ["posts", "gone", "woodTaken", "seen", "found", "visited", "stats"].forEach((k) => {
      if (data[k] && typeof data[k] === "object") next[k] = data[k];
    });
    if (Array.isArray(data.journal)) next.journal = data.journal.slice(-60);
    next.day = clamp(next.day | 0, 1, 7);
    next.t = clamp(+next.t || 0, 0, 0.999);
    next.x = clamp(+next.x || 200, 40, AREAS[next.area].w - 40);
    next.mode = "play";
    state = next;
    sceneQ = [];
  }

  const audio = {
    ctx: null, master: null, windGain: null, droneGain: null, muted: false,
    cricketT: 0.4, fireT: 0.2,
    ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this.ctx) {
        const ctx = new AC();
        this.ctx = ctx;
        const master = ctx.createGain();
        master.gain.value = 0.85;
        master.connect(ctx.destination);
        this.master = master;
        const noiseLen = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) data[i] = Math.random() * 2 - 1;
        const wind = ctx.createBufferSource();
        wind.buffer = buf; wind.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = "lowpass"; bp.frequency.value = 420;
        const wg = ctx.createGain(); wg.gain.value = 0.05;
        wind.connect(bp); bp.connect(wg); wg.connect(master);
        wind.start();
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12;
        const lfoG = ctx.createGain(); lfoG.gain.value = 0.03;
        lfo.connect(lfoG); lfoG.connect(wg.gain); lfo.start();
        this.windGain = wg;
        const d1 = ctx.createOscillator(); d1.type = "sine"; d1.frequency.value = 46;
        const d2 = ctx.createOscillator(); d2.type = "sine"; d2.frequency.value = 49.5;
        const dg = ctx.createGain(); dg.gain.value = 0;
        d1.connect(dg); d2.connect(dg); dg.connect(master);
        d1.start(); d2.start();
        this.droneGain = dg;
        this.noise = buf;
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
    },
    chirp() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 4200; f.Q.value = 8;
      o.type = "triangle";
      o.frequency.value = 3600 + Math.random() * 900;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(f); f.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.06);
      if (Math.random() < 0.6) {
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.type = "sine"; o2.frequency.value = o.frequency.value + 30;
        g2.gain.setValueAtTime(0.0001, t + 0.07);
        g2.gain.exponentialRampToValueAtTime(0.025, t + 0.08);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o2.connect(g2); g2.connect(this.master);
        o2.start(t + 0.07); o2.stop(t + 0.13);
      }
    },
    crackle() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const f = this.ctx.createBiquadFilter();
      f.type = "highpass"; f.frequency.value = 800 + Math.random() * 1200;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.04);
      src.connect(f); f.connect(g); g.connect(this.master);
      const off = Math.random() * 1.5;
      src.start(t, off); src.stop(t + 0.09);
    },
    bugle(deep) {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const f = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      o.type = "sawtooth";
      f.type = "lowpass"; f.frequency.value = deep ? 1400 : 1800;
      const a = deep ? 430 : 520;
      o.frequency.setValueAtTime(a, t);
      o.frequency.exponentialRampToValueAtTime(a * 1.45, t + 0.28);
      o.frequency.exponentialRampToValueAtTime(deep ? 210 : 280, t + 1.35);
      o.frequency.exponentialRampToValueAtTime(deep ? 250 : 340, t + 1.7);
      o.frequency.exponentialRampToValueAtTime(deep ? 140 : 190, t + 2.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(deep ? 0.07 : 0.055, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.02, t + 2.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.7);
      o.connect(f); f.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 2.8);
    },
    pulse() {
      if (!this.ctx || this.muted || !this.droneGain) return;
      const t = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(t);
      this.droneGain.gain.setValueAtTime(0.12, t);
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      this.pulseUntil = t + 1.7;
    },
    update(dt) {
      if (!this.ctx) return;
      const night = nightAmount(state.t);
      const ridge = state.area === "ridge" || state.area === "basin" || state.mode === "title";
      let wind = (ridge ? 0.07 : 0.04) * (0.8 + night * 0.6);
      if (standingIn("silence") && state.mode === "play") wind *= 0.35;
      if (state.mode === "chase") wind = 0.09;
      const drone = state.mode === "chase" ? 0.11
        : (state.mode === "glass" && state.glassBeast) ? 0.05
        : (state.fear > 34 && state.mode === "play") ? (state.fear - 34) / 700 : 0;
      const now = this.ctx.currentTime;
      if (this.windGain) this.windGain.gain.setTargetAtTime(this.muted ? 0 : wind, now, 0.4);
      if (this.droneGain && !(this.pulseUntil && now < this.pulseUntil)) this.droneGain.gain.setTargetAtTime(this.muted ? 0 : drone, now, 0.5);
      if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.85, now, 0.05);
      const cricketOn = night > 0.42 && state.mode !== "title" && !standingIn("silence");
      this.cricketT -= dt;
      if (this.cricketT <= 0) {
        this.cricketT = cricketOn ? 0.12 + Math.random() * 0.28 : 1.2;
        if (cricketOn) this.chirp();
      }
      this.fireT -= dt;
      if (this.fireT <= 0) {
        this.fireT = 0.08 + Math.random() * 0.2;
        if (nearFire() && state.mode !== "title") this.crackle();
      }
    }
  };

  function say(text) {
    const el = $("live");
    if (!el) return;
    el.textContent = "";
    el.textContent = text;
  }
  function toast(text) {
    state.toast = text;
    state.toastT = 5.2;
    say(text);
  }
  function journal(text) {
    state.journal.push({ day: state.day, phase: phaseName(state.t), text: text });
    if (state.journal.length > 60) state.journal.shift();
  }
  function show(id) { $(id).hidden = false; }
  function hide(id) { $(id).hidden = true; }

  function refreshChrome() {
    const m = state.mode;
    if (chromeMode === m) return;
    chromeMode = m;
    const map = { title: "title", cutscene: "cut", journal: "journal", cam: "cam", aim: "aim", help: "help", pause: "pause", confirm: "confirm", end: "end" };
    ["title", "cut", "journal", "cam", "aim", "help", "pause", "confirm", "end"].forEach((id) => {
      $(id).hidden = map[m] !== id;
    });
    const playing = m === "play" || m === "glass" || m === "aim" || m === "chase";
    $("hud").hidden = !playing;
    $("touch").hidden = !playing;
  }
  function refreshTitle() {
    $("btn-continue").hidden = !readSave();
  }
  function refreshHud() {
    if ($("hud").hidden) return;
    const canAim = state.mode === "play" && state.crouch && !!nearestAnimal(210);
    const toastText = state.toastT > 0 ? state.toast : "";
    const sig = [state.day, phaseName(state.t), state.area, Math.round(state.warmth), Math.round(state.fear), state.wood, state.cams, Math.ceil(state.fire), state.mode, state.prompt, toastText, state.crouch, canAim, state.tagged].join("|");
    if (sig === hudSig) return;
    hudSig = sig;
    $("hud-day").textContent = "Day " + state.day + " of 7";
    $("hud-phase").textContent = phaseName(state.t);
    $("hud-place").textContent = AREAS[state.area].name;
    $("m-w").textContent = Math.round(state.warmth);
    $("m-f").textContent = Math.round(state.fear);
    $("bar-w").style.width = clamp(state.warmth, 0, 100) + "%";
    $("bar-f").style.width = clamp(state.fear, 0, 100) + "%";
    $("obj").textContent = objectiveText();
    $("prompt").textContent = state.prompt || "";
    $("toast").textContent = toastText;
    const hanging = Object.keys(state.posts).length;
    $("pack").textContent = "Wood " + state.wood + "/6 · Cameras packed " + state.cams + " · hanging " + hanging + (state.fire > 0 ? " · Fire " + Math.ceil(state.fire) + "s" : "");
    $("b-still").setAttribute("aria-pressed", state.crouch ? "true" : "false");
    const use = $("b-use");
    if (state.mode === "chase") use.textContent = "Jump";
    else if (state.mode === "aim") use.textContent = "Fire";
    else if (state.mode === "glass") use.textContent = "Mark";
    else if (canAim) use.textContent = "Aim";
    else use.textContent = "Look";
    $("b-glass").textContent = state.mode === "glass" ? "Lower" : "Glass";
    const phase = phaseName(state.t) + " " + AREAS[state.area].name;
    if (phase !== saidPhase && state.mode === "play") {
      saidPhase = phase;
      say(AREAS[state.area].name + ". " + phaseName(state.t) + ". Day " + state.day + ".");
    }
    const ol = $("route");
    ol.innerHTML = "";
    if (AREAS[state.area].side) {
      const li = document.createElement("li");
      li.textContent = "Side trail · " + AREAS[state.area].name;
      li.className = "on";
      ol.appendChild(li);
    } else {
      ROUTE.forEach((id) => {
        const li = document.createElement("li");
        li.textContent = SHORT[id];
        if (id === state.area) li.className = "on";
        ol.appendChild(li);
      });
    }
  }
  function objectiveText() {
    if (state.tagged || state.escaping) return "He is tagged. Follow the blazes down to the trailhead before this day runs out. Do not sleep the walk away.";
    if (state.day >= 7) return "Last day. The old bull uses the high basin at first light and last light. Be still, then take him, and get down.";
    if (state.day >= 3) return "The old bull — pale rack, notched brow — is in the high basin at dawn and dusk. Glass him. Then be still and take the shot.";
    if (state.day === 1 && !state.visited["camp@1"]) return "Follow the orange blazes up to camp on the knoll. Have wood, and a fire, before full dark.";
    return "Scout the parks. Glass the open ridges. Hang the cameras. Learn which bull is the old one — and which sign is not elk at all.";
  }

  function queueScene(id) {
    if (!id || state.seen[id] || sceneQ.indexOf(id) !== -1 || !SCENES[id]) return;
    sceneQ.push(id);
    if (state.mode !== "cutscene") startScene();
  }
  function startScene() {
    const id = sceneQ.shift();
    if (!id) {
      if (state.mode === "cutscene") state.mode = "play";
      hide("cut");
      if (!state.hinted) {
        state.hinted = true;
        toast("Follow the orange blazes. E looks. G is the glass. J is your journal.");
      }
      chromeMode = "";
      refreshChrome();
      save();
      return;
    }
    state.seen[id] = true;
    state.mode = "cutscene";
    const sc = SCENES[id];
    const img = $("cut-img");
    img.alt = sc.title;
    img.style.display = "block";
    img.onerror = function () { img.style.display = "none"; };
    img.src = sc.img;
    $("cut-k").textContent = sc.kicker;
    $("cut-h").textContent = sc.title;
    const body = $("cut-body");
    body.innerHTML = "";
    sc.ps.forEach((p) => {
      const el = document.createElement("p");
      el.textContent = p;
      body.appendChild(el);
    });
    if (sc.journal) journal(sc.journal);
    chromeMode = "";
    refreshChrome();
    $("cut-next").focus();
  }
  function advanceScene() {
    if (state.mode !== "cutscene") return;
    startScene();
  }

  function ask(kicker, title, body, yes, fn) {
    confirmReturn = state.mode;
    state.mode = "confirm";
    $("cf-k").textContent = kicker;
    $("cf-h").textContent = title;
    $("cf-p").textContent = body;
    $("cf-yes").textContent = yes;
    confirmFn = fn;
    chromeMode = "";
    refreshChrome();
  }
  function closeConfirm(run) {
    hide("confirm");
    const fn = confirmFn;
    confirmFn = null;
    if (run && fn) fn();
    else {
      state.mode = confirmReturn || "play";
      chromeMode = "";
      refreshChrome();
    }
    if (run) { chromeMode = ""; refreshChrome(); }
  }

  function openHelp() {
    helpReturn = state.mode;
    state.mode = "help";
    chromeMode = "";
    refreshChrome();
  }
  function closeHelp() {
    state.mode = helpReturn || "title";
    chromeMode = "";
    refreshChrome();
  }
  function openJournal() {
    if (["cutscene", "end", "title", "aim", "chase", "glass", "confirm", "cam"].indexOf(state.mode) !== -1) return;
    state.mode = "journal";
    const ol = $("j-list");
    ol.innerHTML = "";
    const list = state.journal.length ? state.journal : [{ day: state.day, phase: phaseName(state.t), text: "The pages are still blank. The mountain has not given you anything you could write down." }];
    list.forEach((entry) => {
      const li = document.createElement("li");
      const sm = document.createElement("small");
      sm.textContent = "Day " + entry.day + " · " + entry.phase;
      li.appendChild(sm);
      li.appendChild(document.createTextNode(entry.text));
      ol.appendChild(li);
    });
    chromeMode = "";
    refreshChrome();
  }
  function openPause() {
    if (state.mode === "glass") closeGlass();
    if (state.mode !== "play") return;
    state.mode = "pause";
    save();
    chromeMode = "";
    refreshChrome();
  }
  function showEnd(win, reason) {
    state.mode = "end";
    const img = $("end-img");
    if (win) {
      img.src = ART + "om47_walk_out.webp";
      $("end-k").textContent = "Off the mountain";
      $("end-h").textContent = "The truck, and the tag";
      $("end-p").textContent = "The trailhead takes him back. Wind still cuts, but it is a lower wind. Harlan has the bull, and he has his hide. The mountain keeps the rest of its secrets.";
    } else if (reason === "beast") {
      img.src = ART + "om33_attack.webp";
      $("end-k").textContent = "It found him";
      $("end-h").textContent = "The quiet breaks";
      $("end-p").textContent = "The quiet came first, the way his father said shadow walkers come. Then the quiet broke. Harlan Wade does not walk out.";
    } else {
      img.src = ART + "om10_rifle_dark.webp";
      $("end-k").textContent = "The days ran out";
      $("end-h").textContent = "Seven suns";
      $("end-p").textContent = "Seven days. The tag is still open, or the canyon still has him. Either way the mountain does not give the day back. In the dark it talks to itself.";
    }
    img.alt = $("end-h").textContent;
    $("end-s").textContent = "Day " + clamp(state.day, 1, 7) + " · signs read " + (state.stats.signs || 0) + " · cameras checked " + (state.stats.cams || 0) + " · wood fed to the fire " + (state.stats.fires || 0);
    try { localStorage.removeItem(KEY); } catch (e) {}
    chromeMode = "";
    refreshChrome();
  }
  function win() { showEnd(true); }
  function lose(reason) {
    journal(reason === "beast" ? "It caught him on the mountain." : "The seventh day ended.");
    showEnd(false, reason);
  }

  function newGame() {
    sceneQ = [];
    state = fresh();
    onEnterArea();
    queueScene("dawn1");
    chromeMode = "";
    refreshChrome();
    save();
  }
  function loadGame() {
    const data = readSave();
    if (!data) return;
    applySave(data);
    toast("You take the hunt up where the mountain left it.");
    chromeMode = "";
    refreshChrome();
  }
  function onEnterArea() {
    state.alive = {};
    const key = state.area + "@" + state.day;
    if (state.visited[key]) return;
    state.visited[key] = 1;
    if (AREAS[state.area].enter) journal(AREAS[state.area].enter);
  }
  function beginTravel(area, x) {
    if (!AREAS[area] || state.fade > 0) return;
    state.fade = 0.001;
    state.fadeTo = { area: area, x: x, face: x < 400 ? 1 : -1 };
    state.lock = 0.9;
  }

  function scheduledAnimals(area) {
    area = area || state.area;
    const t = state.t, d = state.day;
    const dawn = t < 0.32, dusk = t >= 0.42 && t < 0.66, day = t < 0.5;
    const out = [];
    if (area === "creek" && day && d % 2 === 1) out.push({ id: "mule-deer", kind: "deer", x: 1040 });
    if (area === "timber" && day && d % 2 === 0) out.push({ id: "mule-deer", kind: "deer", x: 1500 });
    if (area === "seep" && t > 0.12 && t < 0.72) out.push({ id: "cow", kind: "cow", x: 860 });
    if (area === "meadow" && d >= 2 && t > 0.18 && t < 0.64) out.push({ id: "young-bull", kind: "bull", old: false, x: 1680 });
    if (area === "basin" && d >= 3 && (dawn || dusk)) out.push({ id: "old-bull", kind: "bull", old: true, x: 1760 });
    if (area === "meadow" && d >= 5 && dusk) out.push({ id: "old-bull-meadow", kind: "bull", old: true, x: 2140 });
    return out.filter((s) => state.gone[s.id] !== d && !(state.tagged && s.old));
  }
  function updateAnimals(dt) {
    const specs = scheduledAnimals();
    const ids = {};
    specs.forEach((spec) => {
      ids[spec.id] = 1;
      let an = state.alive[spec.id];
      if (!an || an.day !== state.day) {
        an = state.alive[spec.id] = {
          id: spec.id, kind: spec.kind, old: !!spec.old, x: spec.x, day: state.day, flee: 0, phase: Math.random() * 6
        };
      }
      if (an.flee) {
        an.x += an.flee * dt * (an.kind === "deer" ? 80 : 260);
        if (an.x < -60 || an.x > AREAS[state.area].w + 60) state.gone[an.id] = state.day;
      } else {
        an.x += Math.sin(visT * 0.7 + an.phase) * 12 * dt;
        const dist = Math.abs(an.x - state.x);
        let spook = state.crouch ? 62 : (sprinting() ? 340 : 150);
        if (an.kind === "deer") spook = sprinting() ? 160 : 46;
        if (an.kind === "cow") spook = sprinting() ? 210 : 96;
        if (dist < spook) an.flee = an.x >= state.x ? 1 : -1;
      }
      if (an.kind === "deer" && Math.abs(an.x - state.x) < 440) queueScene("deer");
    });
    Object.keys(state.alive).forEach((id) => {
      if (ids[id]) return;
      const an = state.alive[id];
      if (an && Math.abs(an.x - state.x) < 500 && !an.flee) return;
      delete state.alive[id];
    });
  }
  function nearestAnimal(maxDist) {
    let best = null, bd = maxDist;
    Object.keys(state.alive).forEach((id) => {
      const an = state.alive[id];
      if (!an || an.flee) return;
      const d = Math.abs(an.x - state.x);
      if (d < bd) { bd = d; best = an; }
    });
    return best;
  }
  function describeAnimal(an) {
    if (!an) return { name: "Nothing", note: "" };
    if (an.old) return { name: "Old bull", note: "Heavy in the shoulder. Pale, wide rack. The left brow is notched." };
    if (an.kind === "bull") return { name: "Young bull", note: "Even rack, lighter body. Not the one you walked up here for." };
    if (an.kind === "deer") return { name: "Mule deer buck", note: "Big ears, modest antlers. He keeps looking past you." };
    if (an.kind === "cow") return { name: "Cow elk", note: "A cow at the edge of the water. Let her drink." };
    return { name: "Elk", note: "" };
  }

  function closestSpot() {
    const list = SPOTS[state.area] || [];
    let best = null, bd = 1e9;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (s.kind === "wood" && state.woodTaken[s.id] === state.day) continue;
      const d = Math.abs(s.x - state.x);
      const r = (s.kind === "sign" || s.kind === "silence") ? (s.r || 46) : (s.r || 70);
      if (d <= r && d < bd) { bd = d; best = s; }
    }
    return best;
  }
  function standingIn(kind) {
    return (SPOTS[state.area] || []).some((s) => s.kind === kind && Math.abs(s.x - state.x) <= (s.r || 50));
  }
  function updatePrompt() {
    const canAim = state.crouch && nearestAnimal(210);
    if (canAim) { state.prompt = "Space · Take the shot"; return; }
    const s = closestSpot();
    if (s && (s.kind === "sign" || s.kind === "silence")) {
      if (s.kind === "silence" && !(state.crouch || state.stillness > 0.25)) { state.prompt = ""; }
      else state.prompt = "E · Look closer";
    } else if (s) state.prompt = "E · " + (s.prompt || "Look");
    else state.prompt = "";
    if (!state.prompt) {
      const a = AREAS[state.area];
      const left = leftDest();
      if (state.x < 180 && left) state.prompt = "← " + SHORT[left];
      else if (state.x > a.w - 180 && a.right) state.prompt = SHORT[a.right] + " →";
    }
  }
  function reveal(s) {
    if (state.found[s.id]) { toast(s.again || "Nothing new there."); return; }
    state.found[s.id] = 1;
    if (s.text) journal(s.text);
    toast(s.toast || "You write it in the journal.");
    if (s.sign) {
      state.stats.signs = (state.stats.signs || 0) + 1;
      state.fear = Math.min(100, state.fear + (s.dread || 6));
    }
    if (s.clue) state.clues++;
    if (s.scene) queueScene(s.scene);
  }
  function activate(s) {
    if (!s || state.mode !== "play" || state.fade > 0) return;
    if (s.kind === "wood") {
      if (state.wood >= 6) { toast("Your arms are full of wood."); return; }
      if (state.woodTaken[s.id] === state.day) return;
      state.wood++;
      state.woodTaken[s.id] = state.day;
      toast("Dead wood, dry enough to burn.");
      return;
    }
    if (s.kind === "cam") return useCamera(s);
    if (s.kind === "fork") {
      if (!state.found[s.id]) { state.found[s.id] = 1; if (s.text) journal(s.text); }
      state.returnTo = state.area;
      beginTravel(s.to, destX(state.area, s.to));
      toast("You take the side trail.");
      return;
    }
    if (s.kind === "fire") return feedFire();
    if (s.kind === "sleep") return askSleep();
    if (s.kind === "glass") { openGlass(); return; }
    if (s.win) {
      if (state.tagged) return win();
      reveal(s);
      return;
    }
    reveal(s);
  }
  function use() {
    if (state.mode !== "play") return;
    const s = closestSpot();
    if (!s) { toast("Nothing here but wind and snow."); return; }
    activate(s);
  }
  function useCamera(s) {
    const post = state.posts[s.id];
    if (post) {
      if (!post.ready) { toast("The card is still. Give it more of the day, or the night."); return; }
      const photo = post.photo || "empty";
      delete state.posts[s.id];
      state.cams = Math.min(2, state.cams + 1);
      showCam(photo, s.id);
      journal("Trail camera at " + AREAS[state.area].name + ": " + (PHOTOS[photo] ? PHOTOS[photo].cap : ""));
      return;
    }
    if (state.cams <= 0) { toast("Both cameras are already hanging."); return; }
    state.cams--;
    state.posts[s.id] = { setDay: state.day, setT: state.t, ready: false, photo: null, told: false };
    toast("Camera set. Come back after it has watched awhile.");
    journal("Hung a camera at " + AREAS[state.area].name + ".");
  }
  function rollPhoto(spotId, day) {
    const r = (hashString(spotId + "|" + day) % 1000) / 1000;
    if (spotId === "cam-timber" && day >= 2) return r < 0.28 ? "upright" : r < 0.62 ? "beast" : r < 0.78 ? "deer" : "empty";
    if (spotId === "cam-basin" && day >= 3) return r < 0.42 ? "bull" : r < 0.68 ? "beast" : r < 0.8 ? "tracks" : "empty";
    if (spotId === "cam-meadow") {
      if (day >= 4 && r < 0.34) return "bull";
      if (day >= 2 && r < 0.62) return "young";
      if (r < 0.8) return "deer";
      return "empty";
    }
    if (r < 0.3) return "deer";
    if (r < 0.5) return "tracks";
    return "empty";
  }
  function developPosts() {
    Object.keys(state.posts).forEach((id) => {
      const p = state.posts[id];
      if (!p || p.ready) return;
      const elapsed = (state.day - p.setDay) + (state.t - p.setT);
      if (elapsed > 0.34) {
        p.photo = rollPhoto(id, p.setDay);
        p.ready = true;
        if (!p.told) { p.told = true; toast("A trail camera has a card ready."); }
      }
    });
  }
  function showCam(photoId, spotId) {
    const spec = PHOTOS[photoId] || PHOTOS.empty;
    state.mode = "cam";
    state.stats.cams = (state.stats.cams || 0) + 1;
    $("cam-cap").textContent = spec.cap;
    paintCam(spec, spotId, photoId);
    const im = image(spec.src);
    if (!im.complete) im.addEventListener("load", function () { if (state.mode === "cam") paintCam(spec, spotId, photoId); }, { once: true });
    chromeMode = "";
    refreshChrome();
  }
  function paintCam(spec, spotId, photoId) {
    const c = $("cam-canvas");
    const x = c.getContext("2d");
    const w = c.width, h = c.height;
    x.fillStyle = "#03140c";
    x.fillRect(0, 0, w, h);
    const im = image(spec.src);
    if (im.complete && im.naturalWidth) {
      const ir = im.naturalWidth / im.naturalHeight, cr = w / h;
      let dw, dh, dx, dy;
      if (ir > cr) { dh = h; dw = dh * ir; dx = (w - dw) / 2; dy = 0; }
      else { dw = w; dh = dw / ir; dx = 0; dy = (h - dh) / 2; }
      x.drawImage(im, dx, dy, dw, dh);
    } else {
      x.fillStyle = "#0c2416";
      x.fillRect(0, h * 0.62, w, h);
      x.fillStyle = "#16321f";
      for (let i = 0; i < 7; i++) x.fillRect(40 + i * 90, h * 0.42, 16, h * 0.28);
      x.fillStyle = "#07140c";
      if (photoId === "beast" || photoId === "upright") x.fillRect(w * 0.62, h * 0.28, 28, h * 0.4);
      else x.beginPath(), x.ellipse(w * 0.58, h * 0.58, 70, 28, 0, 0, 7), x.fill();
    }
    x.globalCompositeOperation = "multiply";
    x.fillStyle = "#1a3c22";
    x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "screen";
    x.fillStyle = "rgba(90,255,140,0.16)";
    x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "source-over";
    const idata = x.getImageData(0, 0, w, h);
    const d = idata.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 42;
      d[i] = clamp(d[i] + n - 10, 0, 255);
      d[i + 1] = clamp(d[i + 1] + n + 26, 0, 255);
      d[i + 2] = clamp(d[i + 2] + n - 24, 0, 255);
    }
    x.putImageData(idata, 0, 0);
    x.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < h; y += 3) x.fillRect(0, y, w, 1);
    const g = x.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.72)");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.fillStyle = "rgba(180,255,190,0.9)";
    x.font = "15px ui-monospace, monospace";
    const hh = Math.floor((6 + state.t * 16) % 24);
    const mm = Math.floor(((6 + state.t * 16) % 1) * 60);
    const ap = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    x.fillText("DAY " + state.day + "  " + h12 + ":" + String(mm).padStart(2, "0") + " " + ap, 14, h - 16);
    x.fillText(String(spotId || "CAM").toUpperCase(), w - 150, 24);
    x.fillStyle = "#d6ffd0";
    x.beginPath(); x.arc(22, 22, 5, 0, 7); x.fill();
  }

  function feedFire() {
    if (state.area !== "camp") return;
    if (state.wood <= 0) { toast("You need dead wood. The timber and the creek have it."); return; }
    state.wood--;
    state.fire = Math.min(260, state.fire + 90);
    state.stats.fires = (state.stats.fires || 0) + 1;
    toast("The fire stands up. The dark has to wait.");
    if (!state.found.fed) {
      state.found.fed = 1;
      journal("Fed the fire at camp. As long as it lives, the knoll is yours.");
    }
    queueScene("firemem");
  }
  function askSleep() {
    let body = "Sleep until dawn. The day will turn over, and the fire will burn down some.";
    if (state.fire <= 0) body = "There is no fire. Things walk the tent wall when the ring is dark. Sleep anyway?";
    if (state.day >= 7) body = "This is the last day. Sleep, and you will not get another morning, and you will not walk out.";
    ask("The tent", "Sleep until dawn?", body, "Sleep", doSleep);
  }
  function doSleep() {
    if (state.fire <= 0 && state.fear >= 80) {
      journal("You closed your eyes. The canvas bowed inward.");
      return lose("beast");
    }
    if (state.day >= 7) return lose("days");
    const cold = state.fire <= 0;
    state.day += 1;
    state.t = 0.08;
    state.warmth = cold ? 32 : Math.min(100, state.warmth + 36);
    state.fear = cold ? Math.min(100, state.fear + 32) : Math.max(0, state.fear - 16);
    state.fire = Math.max(0, state.fire - 55);
    state.alive = {};
    developAllNow();
    if (cold) toast("You slept cold. Something paced the guy-lines.");
    queueScene("dawn" + state.day);
    save();
  }
  function developAllNow() {
    Object.keys(state.posts).forEach((id) => {
      const p = state.posts[id];
      if (p && !p.ready) { p.photo = rollPhoto(id, p.setDay); p.ready = true; p.told = true; }
    });
  }
  function nearFire() {
    if (state.fire <= 0 || state.area !== "camp") return false;
    const f = spotById("camp", "fire");
    return !!(f && Math.abs(f.x - state.x) < 230);
  }
  function endOfDay() {
    if (state.tagged && state.area === "trailhead") return win();
    state.day += 1;
    state.t = 0.08;
    if (state.day > 7) return lose("days");
    state.alive = {};
    developAllNow();
    queueScene("dawn" + state.day);
    save();
  }

  function openGlass() {
    if (state.mode !== "play") return;
    if (!AREAS[state.area].open) { toast("Dog-hair timber. You cannot glass through it."); return; }
    audio.ensure();
    state.mode = "glass";
    state.glassT = 0;
    const dusk = state.t >= 0.45 && state.t < 0.74;
    state.glassBeast = state.day >= 2 && (dusk || isNight(state.t)) && (hashString(state.area + ":" + state.day + ":" + Math.floor(state.t * 5)) % 100) < 60;
    chromeMode = "";
    refreshChrome();
  }
  function closeGlass() {
    if (state.mode !== "glass") return;
    state.mode = "play";
    chromeMode = "";
    refreshChrome();
  }
  function glassTarget() {
    if (state.area === "ridge") return "basin";
    if (state.area === "trailhead") return "ridge";
    return state.area;
  }
  function glassInfo() {
    const list = scheduledAnimals(glassTarget()).filter((a) => a.kind !== "cow" || state.area === "seep");
    list.sort((a, b) => (b.old === true) - (a.old === true));
    return { animal: list[0] || null, beast: state.glassBeast, area: glassTarget() };
  }
  function markGlass() {
    if (state.mode !== "glass") return;
    const info = glassInfo();
    if (state.glassT < 0.7) { toast("Hold the glass steady."); return; }
    if (info.beast && !state.found.upright) {
      state.found.upright = 1;
      state.fear = Math.min(100, state.fear + 12);
      state.stats.signs = (state.stats.signs || 0) + 1;
      journal("Through the glass, on the far ridge, something walked upright. Father called them shadow walkers.");
      toast("It walks upright.");
    }
    if (info.animal) {
      const d = describeAnimal(info.animal);
      if (info.animal.old && !state.glassedBull) {
        state.glassedBull = true;
        state.clues++;
        journal("Glassed the old bull. Pale rack, notched brow, using the high country at the edge of day.");
      } else if (!state.found["glass-" + info.animal.id]) {
        state.found["glass-" + info.animal.id] = 1;
        journal("Glassed a " + d.name.toLowerCase() + ". " + d.note);
      }
      toast(d.name + " — written in the journal.");
    } else if (!info.beast) toast("Nothing to mark but country.");
  }
  function syncGlass() {
    if (state.mode !== "glass") return;
    const info = glassInfo();
    let text = "Empty country. Snow, spruce, a long way of nothing.";
    if (state.glassT > 0.75 && info.animal) {
      const d = describeAnimal(info.animal);
      text = d.name + " — " + d.note;
    } else if (state.glassT > 0.75 && info.beast) text = "On the far skyline, something standing up. Too tall, and too still.";
    else text = "The glass steadies…";
    $("prompt").textContent = "Looking into " + SHORT[info.area] + ". E marks · G lowers · " + text;
  }

  function aimZone() {
    const still = state.aim ? state.aim.still : state.stillness;
    return clamp(0.12 + still * 0.16 - state.fear * 0.0007, 0.07, 0.32);
  }
  function tryAim() {
    if (state.mode !== "play") return;
    if (!state.crouch) { toast("Be still. Get low before you bring the rifle up."); return; }
    const an = nearestAnimal(210);
    if (!an) { toast("Nothing in range. A far animal is for the glass, not the rifle."); return; }
    const d = describeAnimal(an);
    let note = d.note;
    if (an.old) note += state.glassedBull || state.clues >= 2 ? " This is the one." : " He has the look of the old one.";
    else note += " Filling a tag with him would be a mistake.";
    $("aim-name").textContent = d.name;
    $("aim-note").textContent = note;
    state.mode = "aim";
    state.aim = { phase: Math.PI * 0.65, id: an.id, still: state.stillness };
    audio.ensure();
    chromeMode = "";
    refreshChrome();
  }
  function cancelAim() {
    if (state.mode !== "aim") return;
    state.mode = "play";
    state.aim = null;
    chromeMode = "";
    refreshChrome();
  }
  function fireShot() {
    if (state.mode !== "aim" || !state.aim) return;
    const swing = Math.sin(state.aim.phase);
    const zone = aimZone();
    const an = state.alive[state.aim.id];
    const hit = Math.abs(swing) < zone;
    state.mode = "play";
    state.aim = null;
    chromeMode = "";
    refreshChrome();
    if (!an) { toast("The moment is gone."); return; }
    if (!hit) {
      an.flee = an.x >= state.x ? 1 : -1;
      state.fear = Math.min(100, state.fear + 10);
      toast("The shot goes wide. The timber takes him.");
      journal("A missed shot. The report will carry farther than the bullet.");
      return;
    }
    state.gone[an.id] = state.day;
    delete state.alive[an.id];
    if (an.old) {
      state.tagged = true;
      state.escaping = true;
      state.fear = Math.min(100, state.fear + 16);
      state.safe = 18;
      queueScene("tagged");
    } else {
      state.fear = Math.min(100, state.fear + 20);
      const msg = an.kind === "deer"
        ? "The mule deer drops. He was never the tag, and the timber knows you were careless."
        : an.kind === "cow"
          ? "The cow falls. This is not the animal you walked up here for."
          : "A young bull. Even rack, light in the shoulder. Not the old warrior.";
      toast(msg);
      journal(msg);
    }
  }
  function syncAim() {
    if (state.mode !== "aim" || !state.aim) return;
    const swing = Math.sin(state.aim.phase);
    const zone = aimZone();
    $("aim-mark").style.left = ((swing + 1) / 2 * 100) + "%";
    $("aim-zone").style.left = (((-zone + 1) / 2) * 100) + "%";
    $("aim-zone").style.width = (zone * 100) + "%";
  }

  function startChase() {
    if (state.mode !== "play") return;
    audio.ensure();
    audio.pulse();
    state.mode = "chase";
    state.chase = { y: 0, vy: 0, hits: 0, passed: 0, need: 8, obs: [], spawnIn: 0.7, beast: 0.24, flash: 0 };
    toast("Deadfall. Run. Jump.");
    chromeMode = "";
    refreshChrome();
  }
  function jump() {
    if (state.mode !== "chase" || !state.chase) return;
    if (state.chase.y >= -0.5) state.chase.vy = -640;
  }
  function updateChase(dt) {
    const ch = state.chase;
    if (!ch) return;
    ch.flash = Math.max(0, ch.flash - dt);
    ch.spawnIn -= dt;
    if (ch.spawnIn <= 0) {
      ch.obs.push({ x: viewW + 30, w: 54 + Math.random() * 26, h: 26 + Math.random() * 10 });
      ch.spawnIn = 1.25 + Math.random() * 0.45;
    }
    ch.vy += 1700 * dt;
    ch.y += ch.vy * dt;
    if (ch.y > 0) { ch.y = 0; ch.vy = 0; }
    ch.obs.forEach((o) => {
      o.x -= 340 * dt;
      const overlap = o.x < 220 && o.x + o.w > 160;
      if (overlap && !o.resolved && ch.y > -44) {
        o.resolved = "hit";
        ch.hits++;
        ch.beast += 0.2;
        ch.flash = 0.18;
      }
      if (!o.resolved && o.x + o.w < 160) {
        o.resolved = "clear";
        ch.passed++;
        ch.beast = Math.max(0.08, ch.beast - 0.05);
      }
    });
    ch.obs = ch.obs.filter((o) => o.x > -80);
    ch.beast += dt * 0.018;
    state.prompt = "Space · Jump the deadfall";
    if (ch.hits >= 3 || ch.beast >= 1) return endChase(false);
    if (ch.passed >= ch.need) return endChase(true);
  }
  function endChase(ok) {
    state.chase = null;
    if (!ok) {
      journal("It came through the deadfall faster than a man can climb.");
      return lose("beast");
    }
    state.mode = "play";
    state.safe = 46;
    state.fear = Math.max(0, state.fear - 10);
    state.charge = 0;
    toast("You break clear of the timber. Do not stop.");
    journal("Ran the deadfall and got clear. It is still on the mountain.");
    chromeMode = "";
    refreshChrome();
  }

  function updateDanger(dt) {
    if (state.safe > 0) {
      state.safe -= dt;
      state.charge = Math.max(0, state.charge - dt * 0.04);
      return;
    }
    const night = isNight(state.t);
    const pressured = night || standingIn("silence") || (state.escaping && (night || state.area === "timber"));
    let rate;
    if (nearFire()) rate = -0.1;
    else if (pressured) {
      rate = 0;
      if (night) rate += 0.012;
      if (night && state.warmth < 30) rate += 0.008;
      if (state.fear > 60) rate += 0.006;
      if (state.escaping && (state.area === "timber" || night)) rate += 0.016;
      if (state.day >= 6 && night) rate += 0.006;
      if (standingIn("silence")) rate += 0.01;
    } else rate = -0.025;
    state.charge = clamp(state.charge + rate * dt, 0, 1.3);
    if (state.charge >= 1) {
      state.charge = 0;
      startChase();
    }
  }
  function updateMeters(dt) {
    const night = isNight(state.t);
    if (nearFire()) {
      state.warmth = Math.min(100, state.warmth + 8 * dt);
      state.fear = Math.max(0, state.fear - 3.2 * dt);
    } else if (night) {
      state.warmth = Math.max(0, state.warmth - 0.58 * dt);
      state.fear = Math.min(100, state.fear + 0.26 * dt);
    } else {
      state.warmth = Math.min(100, state.warmth + 0.28 * dt);
      state.fear = Math.max(0, state.fear - 0.1 * dt);
    }
    if (state.warmth <= 0) state.fear = Math.min(100, state.fear + 0.7 * dt);
    if (state.fire > 0) state.fire = Math.max(0, state.fire - dt);
  }
  function updatePlay(dt) {
    const dir = axis();
    if (state.fade <= 0) {
      if (dir) state.face = dir;
      if (dir && sprinting()) state.crouch = false;
      let sp = state.crouch ? 68 : (sprinting() ? 228 : 134);
      sp *= 0.7 + 0.3 * (state.warmth / 100);
      if (state.lock > 0) state.lock -= dt;
      else state.x += dir * sp * dt;
      if (dir) state.walk += dt * (state.crouch ? 7 : 12);
      const a = AREAS[state.area];
      if (state.lock <= 0 && state.fade <= 0) {
        if (state.x < 64) {
          const to = leftDest();
          if (to) beginTravel(to, destX(state.area, to));
          else state.x = 64;
        } else if (state.x > a.w - 64) {
          if (a.right) beginTravel(a.right, destX(state.area, a.right));
          else state.x = a.w - 64;
        }
      }
      state.x = clamp(state.x, 36, a.w - 36);
    }
    if (state.crouch && dir === 0) state.stillness = Math.min(1, state.stillness + dt / 2);
    else state.stillness = Math.max(0, state.stillness - dt * 0.85);
    state.t += dt / DAY_LEN;
    if (state.t >= 1) endOfDay();
    if (state.mode !== "play") return;
    updateAnimals(dt);
    updateMeters(dt);
    updateDanger(dt);
    developPosts();
    updatePrompt();
    if (state.day === 1 && state.t > 0.72 && !state.screamed) {
      state.screamed = true;
      state.fear = Math.min(100, state.fear + 14);
      toast("Something screams up the canyon. It is not an elk.");
      journal("First night. A scream up canyon, long and wrong. Then the mountain talking to itself.");
      audio.pulse();
    }
    const bugleCountry = state.area === "ridge" || state.area === "meadow" || state.area === "basin";
    const bugleTime = state.t < 0.2 || (state.t > 0.46 && state.t < 0.7);
    if (bugleCountry && bugleTime && state.mode === "play") {
      state.bugleIn -= dt;
      if (state.bugleIn <= 0) {
        audio.bugle(state.area === "basin" || state.area === "ridge");
        state.bugleIn = 28 + Math.random() * 24;
        if (!state.heardBugle) {
          state.heardBugle = true;
          journal("A bugle rolls off the high country, deep, and then a younger answer. You want the deep one.");
          toast("A deep bugle, then a younger answer.");
        }
      }
    }
    if (isNight(state.t) && state.fear > 64 && state.flicker <= 0 && Math.random() < dt * 0.18) state.flicker = 0.32;
    if (state.flicker > 0) state.flicker -= dt;
  }
  function updateFade(dt) {
    if (state.fade <= 0) return;
    state.fade += dt / 0.28;
    if (state.fadeTo && state.fade >= 1) {
      const dest = state.fadeTo;
      state.fadeTo = null;
      state.area = dest.area;
      state.x = dest.x;
      state.face = dest.face;
      onEnterArea();
    }
    if (!state.fadeTo && state.fade >= 2) state.fade = 0;
  }
  function updateSnow(dt) {
    const wind = (AREAS[state.area] && (AREAS[state.area].biome === "high" || AREAS[state.area].snow > 0.6)) ? 22 : 8;
    FLAKES.forEach((f) => {
      f.y += f.v * dt / Math.max(300, viewH);
      f.x += Math.sin(visT * 0.4 + f.d) * wind * dt / Math.max(300, viewW);
      if (f.y > 1) f.y = 0;
      if (f.x > 1) f.x -= 1;
      if (f.x < 0) f.x += 1;
    });
  }

  function biomeColors(biome) {
    if (biome === "low") return { far: "#7f97ad", mid: "#415868", tree: "#24382e", ground: "#6d5d4b" };
    if (biome === "high") return { far: "#c5d2df", mid: "#60788e", tree: "#24362e", ground: "#8b97a4" };
    if (biome === "park") return { far: "#8eabc0", mid: "#4c6556", tree: "#2c4636", ground: "#7d6b49" };
    if (biome === "creek") return { far: "#6d8b9e", mid: "#3c524c", tree: "#20362c", ground: "#5a4e42" };
    if (biome === "dark") return { far: "#465868", mid: "#1a2926", tree: "#101c16", ground: "#2a2622" };
    return { far: "#6e8aa0", mid: "#3a4e46", tree: "#203428", ground: "#5e564c" };
  }
  function drawSky() {
    const sky = skySample(state.t);
    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, sky.top);
    g.addColorStop(0.55, lerpHex(sky.top, sky.hor, 0.55));
    g.addColorStop(1, sky.hor);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
    if (sky.stars > 0.04) {
      STARS.forEach((s) => {
        const tw = reduce ? 0.8 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(visT * 2 + s.p * 12));
        ctx.globalAlpha = sky.stars * tw;
        ctx.fillStyle = "#f7f4ea";
        ctx.fillRect(s.x * viewW, s.y * viewH * 0.7, s.r, s.r);
      });
      ctx.globalAlpha = 1;
    }
    if (sky.sun > 0.04) {
      const u = clamp((state.t - 0.05) / 0.58, 0, 1);
      const sx = viewW * (0.12 + 0.76 * u);
      const sy = 150 - Math.sin(u * Math.PI) * 90;
      ctx.globalAlpha = sky.sun;
      const sg = ctx.createRadialGradient(sx, sy, 6, sx, sy, 78);
      sg.addColorStop(0, "rgba(255,248,230,0.95)");
      sg.addColorStop(1, "rgba(255,210,140,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, 78, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff8ea";
      ctx.beginPath(); ctx.arc(sx, sy, 11, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (sky.moon > 0.05) {
      const mx = viewW * (0.78 - 0.35 * ((state.t + 0.3) % 1));
      const my = 86 + Math.sin(state.t * 2) * 16;
      ctx.globalAlpha = sky.moon;
      ctx.fillStyle = "#f6f1e4";
      ctx.beginPath(); ctx.arc(mx, my, 16, 0, 7); ctx.fill();
      ctx.globalAlpha = sky.moon * 0.92;
      ctx.fillStyle = sky.top;
      ctx.beginPath(); ctx.arc(mx + 14 - state.day * 1.4, my - 2, 15, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (sky.amb > 0.4 && !reduce) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 3; i++) {
        const cx = ((visT * 12 + i * 220) % (viewW + 180)) - 80;
        ctx.beginPath(); ctx.ellipse(cx, 70 + i * 18, 50, 12, 0, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  function drawRidge(yBase, amp, freq, color, parallax, snow) {
    const cam = cameraX() * parallax + AREAS[state.area].seed * 420;
    ctx.beginPath();
    ctx.moveTo(-10, viewH);
    for (let x = -10; x <= viewW + 16; x += 14) {
      const wx = x + cam;
      const h = n1(wx * freq) * amp + n1(wx * freq * 2.2 + 3) * amp * 0.38;
      ctx.lineTo(x, yBase - h);
    }
    ctx.lineTo(viewW + 16, viewH);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (snow) {
      ctx.beginPath();
      for (let x = -10; x <= viewW + 16; x += 14) {
        const wx = x + cam;
        const h = n1(wx * freq) * amp + n1(wx * freq * 2.2 + 3) * amp * 0.38;
        if (x === -10) ctx.moveTo(x, yBase - h); else ctx.lineTo(x, yBase - h);
      }
      ctx.strokeStyle = "rgba(244,248,252,0.85)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }
  function drawTree(tr, cam, biome) {
    const sx = tr.x - cam;
    if (sx < -90 || sx > viewW + 90) return;
    const gy = groundY(tr.x);
    const sc = tr.sc;
    ctx.save();
    ctx.translate(sx, gy);
    if (tr.kind === "aspen" || tr.kind === "willow") {
      ctx.fillStyle = tr.kind === "aspen" ? "#ddd6c8" : "#6a5a40";
      ctx.fillRect(-2 * sc, -70 * sc, 4 * sc, 70 * sc);
      ctx.fillStyle = tr.kind === "aspen" ? "#6d7d4a" : "#3e5a3a";
      ctx.beginPath(); ctx.ellipse(0, -78 * sc, 16 * sc, 20 * sc, 0, 0, 7); ctx.fill();
      ctx.restore();
      return;
    }
    if (tr.kind === "dead") {
      ctx.strokeStyle = biome === "dark" ? "#1a1612" : "#3a3228";
      ctx.lineWidth = 3.2 * sc;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(3 * sc, -78 * sc);
      ctx.moveTo(2 * sc, -48 * sc); ctx.lineTo(24 * sc, -62 * sc);
      ctx.moveTo(1 * sc, -36 * sc); ctx.lineTo(-16 * sc, -50 * sc);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.fillStyle = biome === "dark" ? "#122018" : "#1c3428";
    for (let i = 0; i < 4; i++) {
      const y = -(16 + i * 16) * sc;
      const w = (32 - i * 6) * sc;
      ctx.beginPath();
      ctx.moveTo(0, y - 20 * sc);
      ctx.lineTo(w, y);
      ctx.lineTo(-w, y);
      ctx.fill();
    }
    if ((AREAS[state.area].snow || 0) > 0.45) {
      ctx.fillStyle = "rgba(246,250,252,0.88)";
      ctx.beginPath();
      ctx.moveTo(0, -86 * sc);
      ctx.lineTo(12 * sc, -66 * sc);
      ctx.lineTo(-12 * sc, -66 * sc);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawBoard(sx, gy, text) {
    if (sx < -120 || sx > viewW + 120) return;
    ctx.fillStyle = "#3a2a1c";
    ctx.fillRect(sx - 2, gy - 62, 4, 62);
    ctx.font = "12px Georgia, serif";
    const w = Math.max(58, ctx.measureText(text).width + 14);
    ctx.fillStyle = "#d7b483";
    ctx.fillRect(sx - w / 2, gy - 78, w, 18);
    ctx.fillStyle = "#2a1c10";
    ctx.textAlign = "center";
    ctx.fillText(text, sx, gy - 65);
    ctx.textAlign = "left";
  }
  function drawSignArt(s, sx, gy) {
    if (s.sign === "tracks") {
      ctx.fillStyle = "rgba(36,30,26,0.38)";
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(sx - 14 + i * 9, gy - 6, 3.2, 2.1, -0.5, 0, 7);
        ctx.fill();
      }
    } else if (s.sign === "branch") {
      ctx.strokeStyle = "rgba(42,32,24,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, gy - 58);
      ctx.lineTo(sx + 22, gy - 34);
      ctx.stroke();
    } else if (s.sign === "claw") {
      ctx.strokeStyle = "rgba(24,18,14,0.5)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(sx + i * 4, gy - 50);
        ctx.lineTo(sx + i * 4 + 2, gy - 30);
        ctx.stroke();
      }
    }
  }
  function drawWoodPile(sx, gy) {
    ctx.save();
    ctx.translate(sx, gy - 6);
    ctx.rotate(-0.25);
    ctx.fillStyle = "#5b4332";
    ctx.fillRect(-20, -5, 40, 8);
    ctx.fillStyle = "#3e2e22";
    ctx.fillRect(-8, -12, 28, 7);
    ctx.restore();
  }
  function drawCamPost(sx, gy, armed) {
    ctx.fillStyle = "#2c261f";
    ctx.fillRect(sx - 2, gy - 64, 5, 64);
    ctx.fillStyle = armed ? "#1a2420" : "#4a4036";
    ctx.fillRect(sx - 10, gy - 74, 22, 12);
    ctx.fillStyle = armed ? "#b6f0be" : "#222";
    ctx.fillRect(sx + 6, gy - 70, 3, 3);
  }
  function drawTent(sx, gy) {
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.beginPath(); ctx.ellipse(sx, gy, 36, 5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#8a7a58";
    ctx.beginPath();
    ctx.moveTo(sx - 40, gy);
    ctx.lineTo(sx, gy - 58);
    ctx.lineTo(sx + 40, gy);
    ctx.fill();
    ctx.fillStyle = "#6e6248";
    ctx.beginPath();
    ctx.moveTo(sx - 8, gy);
    ctx.lineTo(sx, gy - 58);
    ctx.lineTo(sx + 8, gy);
    ctx.fill();
  }
  function drawCabin(sx, gy) {
    ctx.fillStyle = "#3a2c22";
    ctx.fillRect(sx - 34, gy - 48, 68, 48);
    ctx.fillStyle = "#5a4030";
    ctx.beginPath();
    ctx.moveTo(sx - 40, gy - 44);
    ctx.lineTo(sx, gy - 70);
    ctx.lineTo(sx + 40, gy - 44);
    ctx.fill();
    ctx.fillStyle = "#1a1410";
    ctx.fillRect(sx - 8, gy - 28, 16, 28);
    ctx.fillStyle = "#c9d7e4";
    ctx.globalAlpha = 0.35;
    ctx.fillRect(sx + 12, gy - 36, 10, 8);
    ctx.globalAlpha = 1;
  }
  function drawTruck(sx, gy) {
    ctx.fillStyle = "#1c242c";
    ctx.fillRect(sx - 42, gy - 28, 70, 22);
    ctx.fillRect(sx - 10, gy - 42, 32, 16);
    ctx.fillStyle = "#8aa0b4";
    ctx.globalAlpha = 0.4;
    ctx.fillRect(sx - 4, gy - 38, 16, 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(sx - 24, gy - 6, 7, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 16, gy - 6, 7, 0, 7); ctx.fill();
  }
  function drawFire(sx, gy, lit) {
    ctx.fillStyle = "#4a4038";
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(sx + Math.cos(a) * 16, gy - 4 + Math.sin(a) * 5, 5, 3, a, 0, 7);
      ctx.fill();
    }
    if (!lit) return;
    const flick = reduce ? 0 : Math.sin(visT * 14) * 4;
    ctx.fillStyle = "rgba(255,150,40,0.9)";
    ctx.beginPath();
    ctx.moveTo(sx, gy - 28 - flick);
    ctx.quadraticCurveTo(sx + 12, gy - 16, sx + 4, gy - 4);
    ctx.quadraticCurveTo(sx, gy - 14, sx - 6, gy - 4);
    ctx.quadraticCurveTo(sx - 12, gy - 18, sx, gy - 28 - flick);
    ctx.fill();
    ctx.fillStyle = "#ffe6a8";
    ctx.beginPath(); ctx.ellipse(sx, gy - 12, 3, 6, 0, 0, 7); ctx.fill();
  }
  function drawActor(sx, gy, opt) {
    const sc = opt.crouch ? 0.78 : 1;
    const bob = opt.moving ? Math.abs(Math.sin(opt.walk || visT * 8)) * 2.5 : 0;
    ctx.save();
    ctx.translate(sx, gy);
    ctx.scale(opt.face || 1, 1);
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 4, 0, 0, 7); ctx.fill();
    const step = Math.sin(opt.walk || 0) * (opt.moving ? 6 : 0);
    ctx.strokeStyle = "#241c16";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-4, -26 * sc); ctx.lineTo(-6 + step, 0);
    ctx.moveTo(4, -26 * sc); ctx.lineTo(6 - step, 0);
    ctx.stroke();
    ctx.fillStyle = "#6a5340";
    ctx.fillRect(-11, -50 * sc - bob, 22, 26 * sc);
    ctx.strokeStyle = "rgba(236,224,206,0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-11, -50 * sc - bob, 22, 26 * sc);
    ctx.fillStyle = "#9a3a2e";
    ctx.fillRect(-8, -50 * sc - bob, 16, 5);
    ctx.fillStyle = "#c4a07a";
    ctx.beginPath(); ctx.arc(0, -56 * sc - bob, 6.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#d8d2c8";
    ctx.fillRect(-5, -54 * sc - bob, 8, 5);
    ctx.strokeStyle = "#f2f2f2";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, -58 * sc - bob); ctx.lineTo(-5, -54 * sc - bob); ctx.stroke();
    ctx.fillStyle = "#1c1612";
    ctx.fillRect(-8, -66 * sc - bob, 16, 4);
    ctx.fillRect(-5, -72 * sc - bob, 10, 8);
    ctx.strokeStyle = "#1a120c";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(8, -40 * sc); ctx.lineTo(28, -52 * sc);
    ctx.stroke();
    ctx.restore();
  }
  function antler(x, y, old) {
    ctx.strokeStyle = old ? "#f3ecdf" : "#cbbda8";
    ctx.lineWidth = old ? 2.3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 18);
    ctx.moveTo(x + 1, y - 8); ctx.lineTo(x + 14, y - 12);
    ctx.moveTo(x + 2, y - 14); ctx.lineTo(x - 6, y - 20);
    if (!old) { ctx.moveTo(x, y - 4); ctx.lineTo(x + 10, y - 2); }
    ctx.stroke();
  }
  function drawElkBody(old, sc) {
    ctx.scale(sc, sc);
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath(); ctx.ellipse(0, 0, 24, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = old ? "#6e5844" : "#4a3c32";
    ctx.beginPath(); ctx.ellipse(-2, -32, 28, 15, 0, 0, 7); ctx.fill();
    if (old) {
      ctx.fillStyle = "#d9cdb6";
      ctx.beginPath(); ctx.ellipse(10, -36, 9, 6, 0, 0, 7); ctx.fill();
    }
    ctx.fillStyle = old ? "#5c483a" : "#3a3128";
    ctx.beginPath(); ctx.ellipse(24, -46, 8, 13, 0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(34, -56, 11, 6, 0.05, 0, 7); ctx.fill();
    ctx.strokeStyle = "#2a221c";
    ctx.lineWidth = 3;
    const step = Math.sin(visT * 3) * 3;
    ctx.beginPath();
    ctx.moveTo(-16, -18); ctx.lineTo(-18, step);
    ctx.moveTo(-4, -18); ctx.lineTo(-2, -step);
    ctx.moveTo(10, -18); ctx.lineTo(12, step);
    ctx.moveTo(18, -18); ctx.lineTo(20, -step);
    ctx.stroke();
    antler(36, -62, old);
    if (old) antler(30, -60, true);
  }
  function drawDeerBody() {
    ctx.scale(0.8, 0.8);
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 3, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#8e9294";
    ctx.beginPath(); ctx.ellipse(0, -28, 20, 11, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#f2f0ea";
    ctx.beginPath(); ctx.ellipse(-14, -30, 6, 5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#6e6a64";
    ctx.beginPath(); ctx.ellipse(22, -40, 7, 8, 0.3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, -52, 3, 8, -0.7, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(26, -50, 3, 7, 0.5, 0, 7); ctx.fill();
    ctx.strokeStyle = "#3a342e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -16); ctx.lineTo(-8, 0);
    ctx.moveTo(2, -16); ctx.lineTo(4, 0);
    ctx.moveTo(10, -16); ctx.lineTo(12, 0);
    ctx.stroke();
    antler(24, -54, false);
  }
  function drawAnimal(an) {
    const sx = an.x - cameraX();
    if (sx < -100 || sx > viewW + 100) return;
    const face = an.flee ? (an.flee > 0 ? 1 : -1) : (an.x < state.x ? 1 : -1);
    ctx.save();
    ctx.translate(sx, groundY(an.x));
    ctx.scale(face || 1, 1);
    if (an.kind === "deer") drawDeerBody();
    else if (an.kind === "cow") drawElkBody(false, 1);
    else drawElkBody(!!an.old, an.old ? 1.48 : 1.08);
    ctx.restore();
  }
  function drawBeast(sx, gy, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#07080a";
    ctx.fillRect(sx - 7, gy - 98, 14, 46);
    ctx.fillRect(sx - 20, gy - 78, 40, 7);
    ctx.beginPath(); ctx.ellipse(sx, gy - 108, 8, 12, 0, 0, 7); ctx.fill();
    ctx.fillRect(sx - 8, gy - 52, 5, 52);
    ctx.fillRect(sx + 3, gy - 52, 5, 52);
    ctx.fillStyle = "#d5ecc0";
    ctx.fillRect(sx - 4, gy - 112, 2, 2);
    ctx.fillRect(sx + 2, gy - 112, 2, 2);
    ctx.restore();
  }
  function drawWorld() {
    const a = AREAS[state.area];
    const cols = biomeColors(a.biome);
    const cam = cameraX();
    drawSky();
    drawRidge(viewH * 0.46, 90, 0.0045, cols.far, 0.15, a.snow > 0.5);
    drawRidge(viewH * 0.58, 70, 0.006, cols.mid, 0.32, a.snow > 0.35);
    drawFarTimber(cam);
    ctx.beginPath();
    ctx.moveTo(0, viewH);
    for (let x = 0; x <= viewW; x += 10) ctx.lineTo(x, groundY(x + cam));
    ctx.lineTo(viewW, viewH);
    ctx.fillStyle = cols.ground;
    ctx.fill();
    if (a.snow > 0.2) {
      ctx.beginPath();
      for (let x = 0; x <= viewW; x += 10) {
        const y = groundY(x + cam) - 1;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(244,248,252," + (0.25 + a.snow * 0.55) + ")";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (a.biome === "park") {
      ctx.strokeStyle = "rgba(70,60,30,0.45)";
      ctx.lineWidth = 1.4;
      for (let wx = Math.floor(cam / 18) * 18; wx < cam + viewW; wx += 18) {
        if (hash(wx * 0.17) < 0.6) continue;
        const sx = wx - cam, gy = groundY(wx);
        ctx.beginPath();
        ctx.moveTo(sx, gy);
        ctx.lineTo(sx - 2, gy - 8 - hash(wx) * 6);
        ctx.moveTo(sx, gy);
        ctx.lineTo(sx + 3, gy - 7);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "rgba(62,48,34,0.45)";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = 0; x <= viewW; x += 12) {
      const y = groundY(x + cam) + 3;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#d2652a";
    for (let wx = Math.floor(cam / 150) * 150; wx < cam + viewW; wx += 150) {
      const sx = wx - cam;
      ctx.fillRect(sx, groundY(wx) - 52, 8, 3);
    }
    if (a.creek) {
      ctx.fillStyle = "rgba(86,140,156,0.45)";
      ctx.beginPath();
      const y0 = groundBase() - 8;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= viewW; x += 8) ctx.lineTo(x, y0 + Math.sin((x + cam) * 0.02 + visT * 2) * 3);
      ctx.lineTo(viewW, y0 + 18);
      ctx.lineTo(0, y0 + 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(220,240,245,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= viewW; x += 8) {
        const y = y0 + Math.sin((x + cam) * 0.03 + visT * 3) * 2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    (PROPS[state.area].trees).forEach((tr) => drawTree(tr, cam, a.biome));
    PROPS[state.area].rocks.forEach((r) => {
      const sx = r.x - cam;
      if (sx < -20 || sx > viewW + 20) return;
      ctx.fillStyle = "rgba(50,54,58,0.55)";
      ctx.beginPath(); ctx.ellipse(sx, groundY(r.x) - 2, r.r, r.r * 0.45, 0, 0, 7); ctx.fill();
    });
    (SPOTS[state.area] || []).forEach((s) => {
      const sx = s.x - cam;
      const gy = groundY(s.x);
      if (s.kind === "wood" && state.woodTaken[s.id] !== state.day) drawWoodPile(sx, gy);
      if (s.kind === "cam") drawCamPost(sx, gy, !!state.posts[s.id]);
      if (s.kind === "sign") drawSignArt(s, sx, gy);
      if (s.board) drawBoard(sx, gy, s.board);
    });
    if (state.area === "trailhead") {
      const truck = spotById("trailhead", "truck");
      drawTruck(truck.x - cam, groundY(truck.x));
    }
    if (state.area === "camp") {
      const tent = spotById("camp", "tent");
      const fire = spotById("camp", "fire");
      const cabin = spotById("camp", "cabin");
      drawTent(tent.x - cam, groundY(tent.x));
      drawCabin(cabin.x - cam, groundY(cabin.x));
      drawFire(fire.x - cam, groundY(fire.x), state.fire > 0);
    }
    const left = leftDest();
    if (left) drawBoard(100 - cam, groundY(100), "← " + SHORT[left]);
    if (a.right) drawBoard(a.w - 120 - cam, groundY(a.w - 120), SHORT[a.right] + " →");
    Object.keys(state.alive).forEach((id) => drawAnimal(state.alive[id]));
    if (state.mode !== "chase") {
      drawActor(state.x - cam, groundY(state.x), {
        face: state.face, crouch: state.crouch, moving: state.mode === "play" && axis() !== 0 && state.fade <= 0, walk: state.walk
      });
    }
    if (!(isNight(state.t) || standingIn("silence"))) {
      ctx.strokeStyle = "rgba(20,16,12,0.75)";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 3; i++) {
        const x = (visT * 28 + i * 200) % (viewW + 40) - 20;
        const y = 90 + i * 26 + Math.sin(visT * 2 + i) * 8;
        ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x, y + 3); ctx.lineTo(x + 6, y); ctx.stroke();
      }
    }
  }
  function drawOverlay() {
    const sky = skySample(state.t);
    ctx.globalAlpha = 0.18;
    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, sky.top);
    g.addColorStop(0.5, "rgba(0,0,0,0)");
    g.addColorStop(1, sky.hor);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.globalAlpha = 1;
    if (AREAS[state.area].biome === "dark") {
      ctx.fillStyle = "rgba(4,8,10,0.28)";
      ctx.fillRect(0, 0, viewW, viewH);
    }
    FLAKES.forEach((f) => {
      const alpha = 0.35 + AREAS[state.area].snow * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#fff";
      ctx.fillRect(f.x * viewW, f.y * viewH, f.s, f.s);
    });
    ctx.globalAlpha = 1;
    drawNightShade();
    if (nearFire()) {
      const f = spotById("camp", "fire");
      const fx = f.x - cameraX(), fy = groundY(f.x) - 16;
      const glow = ctx.createRadialGradient(fx, fy, 8, fx, fy, 160);
      glow.addColorStop(0, "rgba(255,160,60,0.28)");
      glow.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(fx, fy, 160, 0, 7); ctx.fill();
    }
    if (state.fear > 28) {
      const vg = ctx.createRadialGradient(viewW / 2, viewH / 2, viewW * 0.2, viewW / 2, viewH / 2, viewW * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(50,0,0," + ((state.fear - 28) / 220) + ")");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, viewW, viewH);
    }
    if (state.flicker > 0) {
      drawBeast(state.x - cameraX() - state.face * 170, groundY(state.x), 0.55);
    }
    ctx.fillStyle = "rgba(6,10,8,0.9)";
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(54, 0); ctx.lineTo(8, viewH * 0.42); ctx.lineTo(0, viewH * 0.28); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(viewW, 0); ctx.lineTo(viewW - 40, 30); ctx.lineTo(viewW, 120); ctx.fill();
  }
  function drawFarTimber(cam) {
    const pc = cam * 0.55;
    const base = viewH * 0.64;
    ctx.fillStyle = "rgba(10,22,18,0.72)";
    const start = Math.floor(pc / 26) * 26 - 40;
    for (let wx = start; wx < pc + viewW + 40; wx += 26) {
      const sx = wx - pc;
      const h = 36 + hash(wx * 0.17) * 58;
      ctx.beginPath();
      ctx.moveTo(sx, base);
      ctx.lineTo(sx + 7, base - h);
      ctx.lineTo(sx + 14, base);
      ctx.fill();
    }
  }
  const lightLayer = document.createElement("canvas");
  const lightCtx = lightLayer.getContext("2d");
  function softPunch(c, x, y, r) {
    const g = c.createRadialGradient(x, y, r * 0.12, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }
  function drawNightShade() {
    const darkness = nightAmount(state.t);
    const cold = state.warmth < 28 ? (28 - state.warmth) / 90 : 0;
    const alpha = clamp(darkness * 0.8 + cold, 0, 0.88);
    if (alpha <= 0.02) return;
    if (lightLayer.width !== canvas.width || lightLayer.height !== canvas.height) {
      lightLayer.width = canvas.width;
      lightLayer.height = canvas.height;
    }
    lightCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lightCtx.globalCompositeOperation = "source-over";
    lightCtx.clearRect(0, 0, viewW, viewH);
    lightCtx.fillStyle = "rgba(2,6,12," + alpha + ")";
    lightCtx.fillRect(0, 0, viewW, viewH);
    lightCtx.globalCompositeOperation = "destination-out";
    softPunch(lightCtx, state.x - cameraX(), groundY(state.x) - 36, 200);
    if (nearFire()) {
      const f = spotById("camp", "fire");
      softPunch(lightCtx, f.x - cameraX(), groundY(f.x) - 16, 250);
    }
    lightCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(lightLayer, 0, 0, viewW, viewH);
  }
  function drawGlass() {
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(0, 0, viewW, viewH);
    const cx = viewW / 2, cy = viewH / 2 - 20, R = Math.min(viewW, viewH) * 0.33;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    const info = glassInfo();
    const sky = skySample(state.t);
    const g = ctx.createLinearGradient(0, cy - R, 0, cy + R);
    g.addColorStop(0, sky.top); g.addColorStop(1, sky.hor);
    ctx.fillStyle = g;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.fillStyle = "#8aa0b4";
    ctx.beginPath();
    ctx.moveTo(cx - R, cy + 20);
    ctx.lineTo(cx - 40, cy - 30);
    ctx.lineTo(cx + 20, cy + 8);
    ctx.lineTo(cx + R, cy - 10);
    ctx.lineTo(cx + R, cy + R);
    ctx.lineTo(cx - R, cy + R);
    ctx.fill();
    ctx.fillStyle = "#1d3328";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - R + i * 46, cy + 30);
      ctx.lineTo(cx - R + i * 46 + 8, cy - 10);
      ctx.lineTo(cx - R + i * 46 + 16, cy + 30);
      ctx.fill();
    }
    if (info.animal) {
      ctx.save();
      ctx.translate(cx + 10, cy + 36);
      ctx.scale(1.6, 1.6);
      if (info.animal.kind === "deer") drawDeerBody();
      else if (info.animal.kind === "cow") drawElkBody(false, 0.9);
      else drawElkBody(!!info.animal.old, info.animal.old ? 1.15 : 0.95);
      ctx.restore();
    }
    if (info.beast) drawBeast(cx + R * 0.45, cy + 40, 0.85);
    ctx.restore();
    ctx.strokeStyle = "rgba(230,238,244,0.85)";
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy); ctx.lineTo(cx - 6, cy);
    ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 18, cy);
    ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy - 6);
    ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 18);
    ctx.stroke();
  }
  function drawFade() {
    if (state.fade <= 0) return;
    const a = state.fade < 1 ? state.fade : Math.max(0, 2 - state.fade);
    ctx.fillStyle = "rgba(4,6,10," + clamp(a, 0, 1) + ")";
    ctx.fillRect(0, 0, viewW, viewH);
  }
  function drawChase() {
    const ch = state.chase;
    const sky = skySample(0.8);
    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, sky.top); g.addColorStop(1, "#0c1210");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.fillStyle = "#10201a";
    for (let i = 0; i < 16; i++) {
      const x = ((i * 78 - visT * 320) % (viewW + 100) + viewW + 100) % (viewW + 100) - 50;
      const h = 90 + (i % 4) * 28;
      ctx.beginPath();
      ctx.moveTo(x, groundBase());
      ctx.lineTo(x + 6, groundBase() - h);
      ctx.lineTo(x + 18, groundBase());
      ctx.fill();
    }
    ctx.fillStyle = "#f4efe4";
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(viewW * 0.72, 78, 14, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#24302a";
    ctx.fillRect(0, groundBase(), viewW, viewH);
    ctx.strokeStyle = "rgba(210,100,40,0.7)";
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(0, groundBase() + 8);
    ctx.lineTo(viewW, groundBase() + 8);
    ctx.stroke();
    ctx.setLineDash([]);
    if (ch) {
      ch.obs.forEach((o) => {
        ctx.fillStyle = "#3a2a1e";
        ctx.fillRect(o.x, groundBase() - o.h, o.w, o.h);
        ctx.fillStyle = "#5a4636";
        ctx.fillRect(o.x, groundBase() - o.h, o.w, 4);
      });
      drawBeast(40 + ch.beast * 130, groundBase(), 0.35 + ch.beast * 0.6);
      drawActor(190, groundBase() + ch.y, { face: 1, crouch: false, moving: true, walk: visT * 16 });
      if (ch.flash > 0) {
        ctx.fillStyle = "rgba(80,0,0," + (ch.flash * 1.4) + ")";
        ctx.fillRect(0, 0, viewW, viewH);
      }
      ctx.fillStyle = "rgba(188,217,238,0.9)";
      ctx.font = "16px Georgia, serif";
      ctx.fillText("Jump the deadfall    " + ch.passed + " / " + ch.need, 20, 36);
    }
  }
  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewW, viewH);
    if (state.mode === "chase") {
      drawChase();
      return;
    }
    drawWorld();
    drawOverlay();
    if (state.mode === "glass") drawGlass();
    drawFade();
  }

  function handleKeys(q) {
    q.forEach((code) => {
      if (code === "KeyM") { toggleMute(); return; }
      if (state.mode === "title") {
        if (code === "Enter") $("btn-new").click();
        return;
      }
      if (state.mode === "cutscene") {
        if (["Enter", "Space", "KeyE", "Escape"].indexOf(code) !== -1) advanceScene();
        return;
      }
      if (state.mode === "confirm") {
        if (code === "Enter") closeConfirm(true);
        if (code === "Escape") closeConfirm(false);
        return;
      }
      if (state.mode === "help") { if (code === "Escape" || code === "Enter") closeHelp(); return; }
      if (state.mode === "journal") { if (code === "Escape" || code === "KeyJ") { state.mode = "play"; chromeMode = ""; refreshChrome(); } return; }
      if (state.mode === "cam") { if (["Escape", "Enter", "Space"].indexOf(code) !== -1) { state.mode = "play"; chromeMode = ""; refreshChrome(); } return; }
      if (state.mode === "pause") { if (code === "Escape" || code === "Enter") { state.mode = "play"; chromeMode = ""; refreshChrome(); } return; }
      if (state.mode === "end") return;
      if (state.mode === "aim") {
        if (code === "Space" || code === "Enter" || code === "KeyF") fireShot();
        if (code === "Escape") cancelAim();
        return;
      }
      if (state.mode === "chase") {
        if (code === "Space" || code === "ArrowUp" || code === "KeyW") jump();
        return;
      }
      if (state.mode === "glass") {
        if (code === "KeyG" || code === "Escape") closeGlass();
        if (code === "KeyE" || code === "Enter") markGlass();
        return;
      }
      if (code === "KeyE") use();
      if (code === "KeyG") { if (state.mode === "play") openGlass(); }
      if (code === "KeyJ") openJournal();
      if (code === "KeyC" || code === "ArrowDown") toggleCrouch();
      if (code === "Space") tryAim();
      if (code === "Escape") openPause();
    });
  }
  function toggleCrouch() {
    if (state.mode !== "play" && state.mode !== "glass") return;
    state.crouch = !state.crouch;
    if (state.crouch) toast("Still. Let the country forget you.");
  }
  function toggleMute() {
    audio.muted = !audio.muted;
    audio.ensure();
    const b = $("h-sound");
    b.textContent = audio.muted ? "Muted" : "Sound";
    b.setAttribute("aria-pressed", audio.muted ? "true" : "false");
  }
  function primary() {
    audio.ensure();
    if (state.mode === "chase") return jump();
    if (state.mode === "aim") return fireShot();
    if (state.mode === "glass") return markGlass();
    if (state.mode !== "play") return;
    if (state.crouch && nearestAnimal(210)) return tryAim();
    return use();
  }
  function toggleGlassKey() {
    audio.ensure();
    if (state.mode === "glass") closeGlass();
    else if (state.mode === "play") openGlass();
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(viewW * dpr));
    canvas.height = Math.max(1, Math.floor(viewH * dpr));
  }
  function update(dt) {
    visT += dt;
    const q = once.splice(0, once.length);
    handleKeys(q);
    if (state.toastT > 0) state.toastT -= dt;
    updateSnow(dt);
    if (state.mode === "title") {
      state.area = "ridge";
      state.x = 780 + Math.sin(visT * 0.12) * 200;
      state.t += dt / (DAY_LEN * 3);
      if (state.t > 0.62) state.t = 0.08;
    } else if (state.mode === "play") updatePlay(dt);
    else if (state.mode === "chase") updateChase(dt);
    else if (state.mode === "aim" && state.aim) state.aim.phase += dt * (1.35 + state.fear / 140);
    else if (state.mode === "glass") {
      state.glassT += dt;
      state.t += dt / DAY_LEN * 0.15;
      if (state.t >= 1) endOfDay();
    }
    if (state.mode !== "title") updateFade(dt);
    audio.update(dt);
    if (state.mode === "play" || state.mode === "glass" || state.mode === "aim") {
      saveT += dt;
      if (saveT > 8) { saveT = 0; save(); }
    }
    refreshHud();
    syncAim();
    syncGlass();
    refreshChrome();
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function bindHold(id, key) {
    $(id).addEventListener("pointerdown", function (e) {
      e.preventDefault();
      ptr[e.pointerId] = key;
      hold[key] = true;
    });
  }
  function releasePtr(e) {
    const key = ptr[e.pointerId];
    if (!key) return;
    delete ptr[e.pointerId];
    hold[key] = Object.keys(ptr).some((id) => ptr[id] === key);
  }
  function bindTap(id, fn) {
    $(id).addEventListener("pointerdown", function (e) {
      e.preventDefault();
      fn();
    });
  }

  function boot() {
    buildProps();
    state.mode = "title";
    state.area = "ridge";
    state.x = 800;
    state.t = 0.12;
    ["om01_ridge", "om02_rifle", "om15_shadow_walkers", "om20_trail_camera", "om26_silent_snow", "om28_blowdown_buck", "om31_caleb", "om36_brooks_range", "om19_upright", "om46_chorus", "om32_old_warrior", "om33_attack", "om47_walk_out", "om10_rifle_dark", "om29_bull", "om18_cow_elk", "om21_smudge", "om14_following_tracks", "om06_bugles", "om30_blood_trail", "om25_fire_blazes"].forEach((n) => image(ART + n + ".webp"));
    image("images/old-man-on-the-mountain.jpg");
    resize();
    refreshTitle();
    refreshChrome();
    addEventListener("resize", resize);
    addEventListener("keydown", function (e) {
      if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.code) !== -1) e.preventDefault();
      if (e.repeat || down[e.code]) return;
      down[e.code] = true;
      once.push(e.code);
    });
    addEventListener("keyup", function (e) { down[e.code] = false; });
    addEventListener("pointerup", releasePtr);
    addEventListener("pointercancel", releasePtr);
    canvas.addEventListener("pointerdown", function (e) {
      if (state.mode !== "play" || state.fade > 0) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      if (sy < groundBase() - 170) return;
      const wx = sx + cameraX();
      if (Math.abs(wx - state.x) > 140) { toast("Too far to make it out."); return; }
      let best = null, bd = 56;
      (SPOTS[state.area] || []).forEach((s) => {
        if (s.kind === "wood" && state.woodTaken[s.id] === state.day) return;
        const d = Math.abs(s.x - wx);
        if (d < bd) { bd = d; best = s; }
      });
      if (best) activate(best);
    });
    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    bindHold("b-left", "left");
    bindHold("b-right", "right");
    bindTap("b-still", function () { audio.ensure(); toggleCrouch(); });
    bindTap("b-use", primary);
    bindTap("b-glass", toggleGlassKey);
    bindTap("b-journal", function () { openJournal(); });
    $("h-sound").addEventListener("click", function () { audio.ensure(); toggleMute(); });
    $("h-journal").addEventListener("click", openJournal);
    $("h-pause").addEventListener("click", openPause);
    $("btn-new").addEventListener("click", function () {
      audio.ensure();
      if (readSave()) {
        ask("Begin again", "Forget the saved hunt?", "The hunt saved on this machine will be wiped, and you will start again at the trailhead.", "Wipe it and begin", function () {
          try { localStorage.removeItem(KEY); } catch (e) {}
          newGame();
        });
        return;
      }
      newGame();
    });
    $("btn-continue").addEventListener("click", function () { audio.ensure(); loadGame(); });
    $("btn-how").addEventListener("click", openHelp);
    $("help-close").addEventListener("click", closeHelp);
    $("cut-next").addEventListener("click", advanceScene);
    $("j-close").addEventListener("click", function () { state.mode = "play"; chromeMode = ""; refreshChrome(); });
    $("cam-close").addEventListener("click", function () { state.mode = "play"; chromeMode = ""; refreshChrome(); });
    $("aim-fire").addEventListener("click", fireShot);
    $("aim-cancel").addEventListener("click", cancelAim);
    $("p-resume").addEventListener("click", function () { state.mode = "play"; chromeMode = ""; refreshChrome(); });
    $("p-journal").addEventListener("click", openJournal);
    $("p-how").addEventListener("click", openHelp);
    $("p-leave").addEventListener("click", save);
    $("cf-yes").addEventListener("click", function () { closeConfirm(true); });
    $("cf-no").addEventListener("click", function () { closeConfirm(false); });
    $("end-again").addEventListener("click", function () { audio.ensure(); newGame(); });
    addEventListener("visibilitychange", function () { if (document.hidden) save(); });
    addEventListener("beforeunload", save);
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "1") newGame();
    requestAnimationFrame(frame);
  }

  window.OM = {
    get state() { return state; },
    hold: hold,
    newGame: newGame,
    loadGame: loadGame,
    save: save,
    readSave: readSave,
    setTime: function (day, t) { state.day = day; state.t = t; },
    goto: function (area, x) { state.area = area; state.x = x == null ? 200 : x; state.alive = {}; state.fade = 0; state.fadeTo = null; },
    setWood: function (n) { state.wood = n; },
    setMeters: function (w, f) { state.warmth = w; state.fear = f; },
    press: function (code) { once.push(code); },
    use: use,
    activate: activate,
    openGlass: openGlass,
    closeGlass: closeGlass,
    markGlass: markGlass,
    tryAim: tryAim,
    fireShot: fireShot,
    cancelAim: cancelAim,
    startChase: startChase,
    jump: jump,
    primary: primary,
    toggleCrouch: toggleCrouch,
    nearestAnimal: nearestAnimal,
    closestSpot: closestSpot,
    skySample: skySample,
    phaseName: phaseName,
    nightAmount: nightAmount,
    feedFire: feedFire,
    doSleep: doSleep,
    endOfDay: endOfDay,
    queueScene: queueScene,
    advanceScene: advanceScene,
    audio: function () { return audio; },
    win: win,
    lose: lose,
    AREAS: AREAS,
    SPOTS: SPOTS
  };

  boot();
})();
