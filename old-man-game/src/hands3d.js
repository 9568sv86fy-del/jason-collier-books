// 3D close-up hands for the minigames: gloved fists built from capsules, lit warm/cool, drawn by a small
// transparent WebGL canvas laid exactly over the 2D minigame canvas. Units are the 2D canvas pixels
// (orthographic camera), so the minigame positions them with the same numbers it uses for its art.
// Created when a minigame opens and disposed when it closes (no second context lingers on phones).
import * as THREE from "three";

const leather = () => new THREE.MeshStandardMaterial({ color: new THREE.Color().setHex(0x4a3424, THREE.SRGBColorSpace), roughness: 0.78, metalness: 0 });
function fist(side = 1) {
  const g = new THREE.Group(), m = leather(), cuffM = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHex(0x56442d, THREE.SRGBColorSpace), roughness: 0.95 });
  const palm = new THREE.Mesh(new THREE.CapsuleGeometry(16, 22, 6, 12), m); palm.rotation.z = Math.PI / 2; palm.scale.set(1, 1.15, 0.8); g.add(palm);
  for (let i = 0; i < 4; i++) { // curled fingers: knuckle row + folded tips
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(6.2, 10, 4, 8), m);
    f.position.set(-15 + i * 10, 14, 10); f.rotation.x = 1.1; g.add(f);
    const t = new THREE.Mesh(new THREE.CapsuleGeometry(5.6, 6, 4, 8), m);
    t.position.set(-15 + i * 10, 6, 20); t.rotation.x = 2.4; g.add(t);
  }
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(6.5, 16, 4, 8), m); th.position.set(side * 22, 2, 16); th.rotation.set(0.6, 0, side * 0.9); g.add(th);
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(17, 19, 34, 14), m); wrist.position.set(0, -26, -4); g.add(wrist);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(22, 24, 30, 14), cuffM); cuff.position.set(0, -54, -6); g.add(cuff);
  return g;
}

export function createHands(overCanvas, kind = "flint") {
  const W = overCanvas.width, H = overCanvas.height;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  cv.className = "hands3d";
  overCanvas.parentElement.style.position = "relative";
  overCanvas.after(cv);
  const place = () => { cv.style.left = overCanvas.offsetLeft + "px"; cv.style.top = overCanvas.offsetTop + "px"; cv.style.width = overCanvas.offsetWidth + "px"; cv.style.height = overCanvas.offsetHeight + "px"; };
  place();
  let r;
  try { r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: "low-power" }); }
  catch (e) { cv.remove(); return null; } // no WebGL: the 2D hands stay
  r.setPixelRatio(1); r.setSize(W, H, false); r.setClearColor(0x000000, 0);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, W, 0, -H, -500, 500); // canvas px, y down = -y
  scene.add(new THREE.HemisphereLight(0x9fb0c8, 0x2a1c12, 0.9));
  const key = new THREE.PointLight(0xffa860, 2.2, 0, 0); key.position.set(W * 0.5, -H * 0.75, 220); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8d8ff, 1.2); rim.position.set(-1, 1, 1); scene.add(rim);
  const L = fist(1), R = fist(-1);
  // flint in the left hand, the C-shaped steel striker in the right
  const flint = new THREE.Mesh(new THREE.DodecahedronGeometry(17, 0), new THREE.MeshStandardMaterial({ color: 0x6f6d68, roughness: 0.5 }));
  flint.scale.set(1.5, 0.9, 0.8); flint.position.set(4, 30, 18); L.add(flint);
  const steel = new THREE.Mesh(new THREE.TorusGeometry(20, 4.2, 8, 24, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: 0xa9adb3, roughness: 0.3, metalness: 0.85 }));
  steel.position.set(-34, 8, 14); steel.rotation.z = Math.PI * 0.25; R.add(steel);
  L.scale.setScalar(1.6); R.scale.setScalar(1.6);
  scene.add(L, R);
  return {
    /** positions in 2D-canvas px. o: { lx, ly, rx, ry, swing (-1..1), show } */
    update(o) {
      place();
      L.visible = R.visible = o.show !== false;
      flint.visible = steel.visible = o.props !== false;
      L.position.set(o.lx, -o.ly, 0); R.position.set(o.rx, -o.ry, 40);
      if (o.pose === "cup") { // both hands cupped round the ember, shielding it from the wind
        L.rotation.set(-1.2, 0.9, 1.35); R.rotation.set(-1.2, -0.9, -1.35);
      } else if (o.pose === "strap") { // left palm pins the camera to the bark, right fist hauls the strap tail
        L.rotation.set(-0.2, 0.2, 0.15); R.rotation.set(-0.3, -0.5, -1.3 - (o.pull || 0) * 0.35);
      } else {
        L.rotation.set(-0.5, 0.35, 0.5); R.rotation.set(-0.4, -0.3, -0.5 - (o.swing || 0) * 0.45);
      }
      key.intensity = 1.6 + (o.glow || 0) * 3;
      r.render(scene, cam);
    },
    dispose() { scene.traverse((m) => { m.geometry?.dispose?.(); m.material?.dispose?.(); }); r.dispose(); r.forceContextLoss?.(); cv.remove(); },
  };
}
