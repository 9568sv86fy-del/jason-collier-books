// Post-processing chain + environment lighting, scaled by quality tier.
// high: bloom + GTAO + FXAA-free MSAA target; medium: bloom only; low: plain render.
import * as THREE from "three";
import { EffectComposer, RenderPass, UnrealBloomPass, GTAOPass, OutputPass, HDRLoader } from "three/addons";
import { Q } from "./quality.js";

export function createPost(renderer, scene, camera) {
  const state = { bloom: Q.bloom, ao: Q.ao, composer: null, bloomPass: null, aoPass: null, renderPass: null };
  let w = 2, h = 2, pr = 1;

  function build() {
    if (state.composer) { state.composer.dispose?.(); state.composer = null; }
    if (!state.bloom && !state.ao) return;
    const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: Q.high ? 4 : 0 });
    const c = new EffectComposer(renderer, rt);
    c.setPixelRatio(pr);
    c.setSize(w, h);
    state.renderPass = new RenderPass(scene, camera);
    c.addPass(state.renderPass);
    if (state.ao) {
      const ao = new GTAOPass(scene, camera, w, h);
      ao.output = GTAOPass.OUTPUT.Default;
      ao.blendIntensity = 0.85;
      ao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.2, scale: 1, samples: 12 });
      ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
      // keep the sky, ridges and see-through effects out of the AO depth/normal pass
      const base = ao._overrideVisibility.bind(ao), cache = ao._visibilityCache;
      ao._overrideVisibility = () => {
        base();
        scene.traverse((o) => {
          if (!o.visible || !o.isMesh && !o.isSprite) return;
          const m = o.material;
          if (o.userData.noAO || m.transparent || m.isShaderMaterial || m.isMeshBasicMaterial || m.isSpriteMaterial) { cache.push(o); o.visible = false; }
        });
      };
      c.addPass(ao);
      state.aoPass = ao;
    } else state.aoPass = null;
    if (state.bloom) {
      const b = new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.55, 0.95);
      c.addPass(b);
      state.bloomPass = b;
    } else state.bloomPass = null;
    c.addPass(new OutputPass());
    state.composer = c;
  }

  // HDRI -> PMREM environment for the PBR materials
  const env = { loaded: false };
  if (Q.tier !== "low") {
    new HDRLoader().load(Q.tier === "high" ? "assets/env/snow_field_2_1k.hdr" : "assets/env/snow_field_2_512.hdr", (hdr) => {
      const pm = new THREE.PMREMGenerator(renderer);
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = pm.fromEquirectangular(hdr).texture;
      scene.environmentIntensity = 0.4;
      hdr.dispose(); pm.dispose();
      env.loaded = true;
    }, undefined, () => {});
  }

  return {
    state, env,
    setSize(cw, ch, ratio) {
      w = cw; h = ch; pr = ratio;
      if (!state.composer) build();
      else { state.composer.setPixelRatio(pr); state.composer.setSize(w, h); state.aoPass?.setSize(w * pr, h * pr); }
    },
    /** night: lower threshold so fire, eyes and the lamp glow; day: only very hot pixels */
    setLook(dark, fire) {
      if (state.bloomPass) {
        state.bloomPass.threshold = 1.05 - dark * 0.55;
        state.bloomPass.strength = 0.35 + dark * 0.4 + fire * 0.15;
      }
    },
    render(cam) {
      if (!state.composer) { renderer.render(scene, cam); return; }
      state.renderPass.camera = cam;
      if (state.aoPass) state.aoPass.camera = cam;
      state.composer.render();
    },
    /** FPS fallback: drop the most expensive effect first. returns false when nothing is left */
    degrade() {
      if (state.ao) { state.ao = false; build(); return "ao"; }
      if (state.bloom) { state.bloom = false; build(); return "bloom"; }
      return false;
    },
  };
}
