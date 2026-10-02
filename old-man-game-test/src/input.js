// Touch-first input: left virtual stick walks, drag anywhere else looks.
// Keyboard: WASD/arrows walk+turn, Q/E strafe, Shift run, C sneak, mouse drag looks.
export function createInput(root, stickEl, knobEl) {
  const st = {
    mx: 0, my: 0, // stick: x strafe/turn, y forward
    lookDX: 0, lookDY: 0,
    run: false, sneak: false,
    keys: new Set(),
    enabled: true,
    lastInput: performance.now(),
    usedStick: false,
    usedKeys: false,
  };
  let stickId = null, stickCX = 0, stickCY = 0, lastStickUp = 0;
  const lookIds = new Map();
  const R = () => Math.max(44, Math.min(70, stickEl.clientWidth / 2));

  const setKnob = (dx, dy) => {
    knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const isUI = (el) => el && el.closest && el.closest("button, .ui, .sheet, .overlay-card, a, input");

  root.addEventListener("pointerdown", (e) => {
    if (!st.enabled) return;
    if (isUI(e.target)) return;
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    // left-lower 45% of the screen (touch) starts the stick wherever the thumb lands
    const stickZone = e.pointerType !== "mouse" && x < rect.width * 0.48 && y > rect.height * 0.45;
    if (stickZone && stickId === null) {
      stickId = e.pointerId;
      stickCX = e.clientX;
      stickCY = e.clientY;
      stickEl.style.left = `${x - stickEl.clientWidth / 2}px`;
      stickEl.style.top = `${y - stickEl.clientHeight / 2}px`;
      stickEl.classList.add("active");
      st.usedStick = true;
      // double-tap and hold the stick to run
      st.runLatch = performance.now() - lastStickUp < 320;
    } else {
      lookIds.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    root.setPointerCapture?.(e.pointerId);
    st.lastInput = performance.now();
  });
  root.addEventListener("pointermove", (e) => {
    if (e.pointerId === stickId) {
      let dx = e.clientX - stickCX, dy = e.clientY - stickCY;
      const r = R();
      const d = Math.hypot(dx, dy);
      if (d > r) { dx *= r / d; dy *= r / d; }
      setKnob(dx, dy);
      st.mx = dx / r;
      st.my = -dy / r;
      st.lastInput = performance.now();
    } else if (lookIds.has(e.pointerId)) {
      const p = lookIds.get(e.pointerId);
      st.lookDX += e.clientX - p.x;
      st.lookDY += e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      st.lastInput = performance.now();
    }
  });
  const end = (e) => {
    if (e.pointerId === stickId) {
      stickId = null;
      lastStickUp = performance.now();
      st.runLatch = false;
      st.mx = st.my = 0;
      setKnob(0, 0);
      stickEl.classList.remove("active");
      stickEl.style.left = "";
      stickEl.style.top = "";
    }
    lookIds.delete(e.pointerId);
  };
  root.addEventListener("pointerup", end);
  root.addEventListener("pointercancel", end);
  root.addEventListener("lostpointercapture", end);

  const down = (e) => {
    if (e.target && e.target.tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    st.keys.add(k);
    st.usedKeys = true;
    st.lastInput = performance.now();
  };
  const up = (e) => st.keys.delete(e.key.toLowerCase());
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", () => st.keys.clear());

  st.clear = () => {
    st.keys.clear();
    st.mx = st.my = 0;
    st.lookDX = st.lookDY = 0;
    stickId = null;
    lookIds.clear();
    setKnob(0, 0);
    stickEl.classList.remove("active");
  };
  /** combined axes: {fwd, strafe, turn} each -1..1 */
  st.axes = () => {
    const k = st.keys;
    let fwd = st.my, strafe = 0, turn = 0;
    if (k.has("w") || k.has("arrowup")) fwd = 1;
    if (k.has("s") || k.has("arrowdown")) fwd = -1;
    if (k.has("a") || k.has("arrowleft")) turn -= 1;
    if (k.has("d") || k.has("arrowright")) turn += 1;
    // touch stick: x turns Harlan in place (tank steering), y walks forward/back
    strafe += st.mx;
    const run = k.has("shift") || (st.my > 0.85 && !!st.runLatch);
    const sneak = k.has("c") || k.has("control") || (Math.abs(st.my) > 0.08 && Math.abs(st.my) < 0.5);
    return { fwd, strafe, turn, run, sneak };
  };
  return st;
}
