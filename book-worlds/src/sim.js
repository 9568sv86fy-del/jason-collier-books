import * as THREE from "three";
import { clamp, damp, dampAngle, hypot2 } from "./util.js";
import { halfWidth, heightAt } from "./world.js";
import { createHuman, createShade, createCoach, handbillMesh } from "./rigs.js";

const LINES = {
  jang: {
    greet: "Experienced navigators. The experience is mostly running from Philadelphia.",
    fight: "If it doesn't bleed, bill it as weather.",
    bill: "Handbill to the face. Surprisingly binding.",
    chest: "A chest. Honest men would walk away. We are saving them the trip.",
    boss: "That coach has too many wheels and an opinion.",
    low: "Keeper, if you fall I will write a very moving handbill.",
    win: "I guaranteed the crossing. I was only mostly lying.",
    gate: "The picture is rolling. That is the way back to the set.",
    circus: "A floating circus. I invented it just now, which is the same as planning.",
    ford: "The river forgot how a crossing works. Wagons in. We will call it a circus.",
    rope: "Those bandits want the trail. The rope wants a weight. Introduce them.",
    ropeHint: "The key is not the punchline, Keeper. The rope is.",
    rout: "The clumsiest pendulum in the West. Do not examine why it worked.",
  },
  tom: {
    greet: "Neck's itching. That usually means the map was a suggestion.",
    fight: "I can shove it. Shoving is the whole of my education.",
    boss: "I don't like a wagon that growls, Jang.",
    hurt: "Still here. Still broad. Neck saw it coming.",
    win: "River's a river again. I'll take that.",
    gate: "I can see the knobs from here. I don't trust knobs.",
    circus: "The wagon is a boat. My neck has filed a complaint.",
    rout: "I was the weight on that rope. I did not apply for the job.",
    half: "It's leaning, Jang. So am I. Different reasons.",
  },
};

export function createSim(scene, world, audio) {
  const keeper = createHuman({
    cloth: 0xc4a574, cloth2: 0x6e3832, pants: 0x4a453c, boots: 0x2c2118,
    hat: 0x6a5134, hair: 0x3a2a22, skin: 0xd2a07c, coat: 0xb08960,
    key: true, lantern: true, sharp: true, chest: 1.02, height: 1, bulk: 1,
  });
  const jang = createHuman({
    cloth: 0xe6d8c4, cloth2: 0x2c3338, pants: 0x3e4650, boots: 0x241c16,
    hat: 0x2a2420, hatTilt: -0.22, hatPitch: 0.12, hatBand: 0x6a2430,
    hair: 0x1c1612, skin: 0xc99570, mustache: true, sharp: true, neckerchief: 0x7a2430,
    bills: true, height: 0.9, bulk: 0.92, chest: 0.96, shoulder: 0.21,
  });
  const tom = createHuman({
    cloth: 0x6d7e8a, cloth2: 0x8a5a3c, pants: 0x5a4634, boots: 0x2a2018,
    hat: 0x6a5340, hatTilt: 0.08, hair: 0x4a3428, skin: 0xd7a888,
    suspenders: true, scratch: true, roundFace: true, sleeves: 0xc4a888,
    height: 1.12, bulk: 1.18, chest: 1.28, shoulder: 0.28,
  });
  scene.add(keeper.root, jang.root, tom.root);

  const allies = [
    { id: "jang", rig: jang, x: -1.5, z: 0.6, yaw: 0.2, side: -1.15, back: 1.65, cd: 1.2, anim: "idle", animT: 0 },
    { id: "tom", rig: tom, x: 1.7, z: 0.4, yaw: -0.1, side: 1.3, back: 1.8, cd: 1.6, anim: "idle", animT: 0 },
  ];

  const player = {
    x: 0, y: 0, z: -6, yaw: 0, vx: 0, vz: 0, vy: 0,
    hp: 100, hpMax: 100, coins: 0, potions: 1,
    iframes: 0, action: "idle", actionT: 0, actionDur: 0.4,
    combo: 0, comboQueue: false, dodgeSide: 0,
    flashCd: 0, flashMax: 7, grounded: true, hurt: 0,
  };
  const swingHit = new Set();
  let playerHits = 0;
  let allyHold = 8;
  let sayLock = 0;
  let bossWall = true;
  const flags = {};
  const events = [];
  const bills = [];
  const enemies = [];
  let seq = 1;

  const spawns = [
    ["shade", 0.2, 11, false],
    ["shade", -2.2, 38, false],
    ["bandit", 2.2, 52, false],
    ["shade", -1.4, 70, false],
    ["bandit", -1.6, 76, true],
    ["bandit", 1.4, 84.5, true],
    ["shade", -2.6, 93, false],
  ];
  for (const [kind, x, z, pendulum] of spawns) enemies.push(makeEnemy(kind, x, z, pendulum));

  const bossRig = createCoach();
  scene.add(bossRig.root);
  const boss = {
    id: "boss", kind: "boss", alive: true, active: false,
    x: 0, z: 114, yaw: Math.PI, hp: 280, hpMax: 280, radius: 2.05,
    state: "idle", t: 0, pattern: 0, didHit: false, hit: 0, stunFor: 0,
  };
  bossRig.root.visible = true;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1, 32),
    new THREE.MeshBasicMaterial({ color: 0xe7c48a, transparent: true, opacity: 0.0, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);

  let circus = false;

  function makeEnemy(kind, x, z, pendulum = false) {
    const shade = kind === "shade";
    const rig = shade
      ? createShade()
      : createHuman({
        cloth: 0x4a4038, cloth2: 0x2a2420, pants: 0x3a342c, boots: 0x1c1612,
        hat: 0x3a3028, hair: 0x1a1410, skin: 0xb08a68, bandana: true, club: true, wisp: true,
        height: 1.02, bulk: 1.02, chest: 1.05,
      });
    scene.add(rig.root);
    return {
      id: "e" + (seq++), kind, rig, x, z, yaw: Math.PI, y: 0,
      hp: shade ? 42 : 58, hpMax: shade ? 42 : 58,
      radius: shade ? 0.6 : 0.48,
      state: "idle", t: 0, alive: true, hit: 0, didHit: false,
      speed: 0, stunFor: 0, homeX: x, homeZ: z, pendulum, routed: false,
    };
  }

  const pending = [];
  function speak(who, text) {
    if (sayLock > 0) return;
    sayLock = 3.5;
    pending.push({ type: "say", who, text });
  }

  function damageEnemy(e, amount, src) {
    if (!e.alive) return;
    if (e.pendulum) {
      e.hit = 1;
      const dx = e.x - (src ? src.x : player.x);
      const dz = e.z - (src ? src.z : player.z);
      const l = hypot2(dx, dz) || 1;
      e.x += (dx / l) * 0.45;
      e.z += (dz / l) * 0.45;
      audio.hit();
      if (!flags.ropeHint) {
        flags.ropeHint = true;
        speak("jang", LINES.jang.ropeHint);
      }
      return;
    }
    e.hp -= amount;
    e.hit = 1;
    const dx = e.x - (src ? src.x : player.x);
    const dz = e.z - (src ? src.z : player.z);
    const l = hypot2(dx, dz) || 1;
    const shove = e.kind === "boss" ? 0.35 : 1.4;
    e.x += (dx / l) * shove;
    e.z += (dz / l) * shove;
    events.push({ type: "dmg", x: e.x, y: 1.6, z: e.z, n: Math.round(amount) });
    audio.hit();
    if (e.hp <= 0) {
      e.hp = 0;
      e.alive = false;
      e.state = "dead";
      e.t = 0;
      player.coins += e.kind === "boss" ? 40 : 5;
      events.push({ type: "dmg", x: e.x, y: 2.1, z: e.z, n: e.kind === "boss" ? 40 : 5, coin: true });
      if (e.kind === "boss") {
        audio.roar();
        flags.won = true;
        bossWall = false;
        events.push({ type: "bossDead" });
        speak("jang", LINES.jang.win);
      }
    }
  }

  function hurtPlayer(amount, sx, sz) {
    if (player.iframes > 0 || player.hp <= 0) return;
    if (player.action === "dodge" && player.actionT < 0.72) return;
    player.hp = Math.max(0, player.hp - amount);
    player.iframes = 0.75;
    player.hurt = 1;
    const dx = player.x - sx;
    const dz = player.z - sz;
    const l = hypot2(dx, dz) || 1;
    player.vx += (dx / l) * 5;
    player.vz += (dz / l) * 5;
    audio.hurt();
    events.push({ type: "hurt", amount });
    if (!flags.low && player.hp < 40 && player.hp > 0) {
      flags.low = true;
      speak("tom", LINES.tom.hurt);
    }
    if (player.hp <= 0) events.push({ type: "dead" });
  }

  function inFront(ax, az, yaw, bx, bz, reach, minDot) {
    const dx = bx - ax;
    const dz = bz - az;
    const d = hypot2(dx, dz);
    if (d > reach) return false;
    if (d < 0.001) return true;
    const dot = (Math.sin(yaw) * dx + Math.cos(yaw) * dz) / d;
    return dot > minDot;
  }

  function nearest(x, z, max) {
    let best = null;
    let bestD = max;
    for (const e of living()) {
      const d = hypot2(e.x - x, e.z - z);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  function living() {
    return enemies.filter((e) => e.alive).concat(boss.alive && boss.active ? [boss] : []);
  }

  function updateEnemy(e, dt) {
    if (!e.alive) {
      e.t += dt;
      e.rig.root.position.y = heightAt(e.x, e.z) - Math.min(1.2, e.t) * 0.8;
      e.rig.root.rotation.x = Math.min(1.2, e.t);
      if (e.t > 1.3) e.rig.root.visible = false;
      return;
    }
    const dx = player.x - e.x;
    const dz = player.z - e.z;
    const dist = hypot2(dx, dz);
    e.hit = Math.max(0, e.hit - dt * 3);
    if (e.state === "stun") {
      e.t += dt;
      e.speed = 0;
      if (e.t > e.stunFor) { e.state = "recover"; e.t = 0; }
    } else if (e.state === "idle") {
      e.speed = 0;
      const leash = e.pendulum && (player.z > 94 || player.z < 68);
      if (dist < 11 && player.hp > 0 && !leash) {
        e.state = "chase";
        if (!flags.fight) { flags.fight = true; speak("jang", LINES.jang.fight); }
      }
    } else if (e.state === "chase" && e.pendulum && (player.z > 94 || player.z < 68 || hypot2(e.x - e.homeX, e.z - e.homeZ) > 14)) {
      e.state = "idle";
      e.speed = 0;
    } else if (e.state === "chase") {
      e.speed = dist > 1.65 ? (e.kind === "shade" ? 2.5 : 2.15) : 0;
      if (dist > 0.2) e.yaw = dampAngle(e.yaw, Math.atan2(dx, dz), 8, dt);
      if (dist < (e.pendulum ? 0.9 : 1.7)) { e.state = "tele"; e.t = 0; e.didHit = false; }
      if (dist > 18) e.state = "idle";
    } else if (e.state === "tele") {
      e.speed = 0;
      e.t += dt;
      e.yaw = dampAngle(e.yaw, Math.atan2(dx, dz), 10, dt);
      const need = e.kind === "shade" ? 0.55 : 0.72;
      if (e.t > need) { e.state = "strike"; e.t = 0; }
    } else if (e.state === "strike") {
      e.t += dt;
      const lunge = e.kind === "shade" ? 7 : 2.2;
      e.speed = e.t < 0.28 ? lunge : 0;
      if (!e.didHit && e.t > 0.12 && e.t < 0.32) {
        const reach = e.kind === "shade" ? 1.55 : 1.7;
        if (dist < reach + 0.4) {
          e.didHit = true;
          hurtPlayer(e.kind === "shade" ? 8 : 12, e.x, e.z);
        }
      }
      if (e.t > 0.42) { e.state = "recover"; e.t = 0; }
    } else if (e.state === "recover") {
      e.speed = 0;
      e.t += dt;
      if (e.t > 0.55) e.state = "chase";
    }
    if (e.speed > 0 && e.state !== "dead") {
      e.x += Math.sin(e.yaw) * e.speed * dt;
      e.z += Math.cos(e.yaw) * e.speed * dt;
    }
    const c = world.resolve(e.x, e.z, e.radius * 0.6);
    e.x = c.x;
    e.z = c.z;
    e.y = heightAt(e.x, e.z);
    e.rig.root.position.set(e.x, e.y, e.z);
    e.rig.root.rotation.y = e.yaw;
    const anim = e.rig.update(dt, {
      speed: e.speed,
      air: false,
      action: e.state === "strike" ? "attack" : "idle",
      actionT: e.state === "strike" ? e.t / 0.42 : 0,
      combo: 1,
      look: 0,
      hurt: e.hit,
      tele: e.state === "tele",
      strike: e.state === "strike",
      hit: e.hit,
    });
    if (anim && anim.step) audio.step();
  }

  function updateBoss(dt) {
    boss.hit = Math.max(0, boss.hit - dt * 2.5);
    if (!boss.alive) {
      boss.t += dt;
      bossRig.root.position.y = heightAt(boss.x, boss.z) - Math.min(2, boss.t) * 0.5;
      bossRig.root.rotation.z = Math.sin(boss.t) * 0.2;
      bossRig.update(dt, { moving: false, state: "dead", hit: 0 });
      ring.material.opacity = 0;
      return;
    }
    const dist = hypot2(player.x - boss.x, player.z - boss.z);
    if (!boss.active && circus && player.z > 106.5) {
      boss.active = true;
      boss.state = "intro";
      boss.t = 0;
      audio.roar();
      audio.setTension(1);
      speak("jang", LINES.jang.boss);
      events.push({ type: "boss" });
    }
    if (!boss.active) {
      bossRig.root.position.set(boss.x, heightAt(boss.x, boss.z), boss.z);
      bossRig.root.rotation.y = boss.yaw;
      bossRig.update(dt, { moving: false, state: "idle", hit: 0 });
      return;
    }
    boss.t += dt;
    let moving = false;
    const face = Math.atan2(player.x - boss.x, player.z - boss.z);
    if (boss.state === "intro") {
      boss.yaw = dampAngle(boss.yaw, face, 4, dt);
      if (boss.t > 1.3) beginBoss("charge");
    } else if (boss.state === "chargeWind" || boss.state === "slamWind" || boss.state === "roarWind") {
      if (boss.state === "chargeWind") boss.yaw = boss.yaw;
      else boss.yaw = dampAngle(boss.yaw, face, 6, dt);
      const need = boss.state === "roarWind" ? 0.95 : 0.75;
      showRing(boss.state === "roarWind" ? 6.2 : boss.state === "slamWind" ? 4.3 : 3.4, boss.t / need);
      if (boss.t > need) {
        boss.state = boss.state.replace("Wind", "");
        boss.t = 0;
        boss.didHit = false;
        if (boss.state === "charge") audio.roar();
      }
    } else if (boss.state === "charge") {
      moving = true;
      const sp = 8.5;
      boss.x += Math.sin(boss.yaw) * sp * dt;
      boss.z += Math.cos(boss.yaw) * sp * dt;
      boss.x = clamp(boss.x, -12, 12);
      boss.z = clamp(boss.z, 106, 122);
      showRing(3.2, 1);
      if (!boss.didHit && dist < boss.radius + 0.75) {
        boss.didHit = true;
        hurtPlayer(18, boss.x, boss.z);
      }
      if (boss.t > 1.05) { boss.state = "recover"; boss.t = 0; }
    } else if (boss.state === "slam" || boss.state === "roar") {
      const rad = boss.state === "roar" ? 5.6 : 4.1;
      showRing(rad, 1);
      if (!boss.didHit && boss.t > 0.08 && dist < rad) {
        boss.didHit = true;
        hurtPlayer(boss.state === "roar" ? 14 : 16, boss.x, boss.z);
      }
      if (boss.t > 0.34) { boss.state = "recover"; boss.t = 0; }
    } else if (boss.state === "stagger") {
      ring.material.opacity = 0;
      if (boss.t > boss.stunFor) { boss.state = "recover"; boss.t = 0; }
    } else if (boss.state === "recover" || boss.state === "idle") {
      ring.material.opacity = Math.max(0, ring.material.opacity - dt * 2);
      if (boss.t > 0.62) {
        const cycle = ["charge", "slam", "charge", "roar", "slam"];
        let name = cycle[boss.pattern % cycle.length];
        boss.pattern++;
        if (name === "roar" && boss.hp > boss.hpMax * 0.62) name = "slam";
        if (name === "slam" && boss.hp < boss.hpMax * 0.5 && !flags.half) {
          flags.half = true;
          speak("tom", LINES.tom.half);
        }
        beginBoss(name);
      }
    }
    const c = world.resolve(boss.x, boss.z, 1.2);
    boss.x = c.x;
    boss.z = clamp(c.z, 104, 123);
    bossRig.root.position.set(boss.x, heightAt(boss.x, boss.z), boss.z);
    bossRig.root.rotation.y = boss.yaw;
    bossRig.root.visible = true;
    bossRig.update(dt, { moving, state: boss.state, hit: boss.hit });
  }

  function beginBoss(name) {
    boss.state = name + "Wind";
    boss.t = 0;
    boss.didHit = false;
    if (name === "charge") boss.yaw = Math.atan2(player.x - boss.x, player.z - boss.z);
  }

  function showRing(radius, k) {
    ring.position.set(boss.x, heightAt(boss.x, boss.z) + 0.08, boss.z);
    const s = Math.max(0.2, radius * k);
    ring.scale.setScalar(s);
    ring.material.opacity = 0.15 + 0.45 * k;
    ring.material.color.set(boss.state.startsWith("roar") ? 0xd2c4ee : 0xe7c48a);
  }

  function separate(dt) {
    const list = enemies.filter((e) => e.alive);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        let dx = b.x - a.x;
        let dz = b.z - a.z;
        const d = hypot2(dx, dz) || 0.001;
        const min = a.radius + b.radius;
        if (d < min) {
          const p = (min - d) / d * 0.5;
          a.x -= dx * p; a.z -= dz * p;
          b.x += dx * p; b.z += dz * p;
        }
      }
    }
    void dt;
  }

  function updateAllies(dt, camYaw) {
    allyHold = Math.max(0, allyHold - dt);
    for (const a of allies) {
      const fx = Math.sin(player.yaw);
      const fz = Math.cos(player.yaw);
      const rx = Math.cos(player.yaw);
      const rz = -Math.sin(player.yaw);
      const tx = player.x - fx * a.back + rx * a.side;
      const tz = player.z - fz * a.back + rz * a.side;
      let dx = tx - a.x;
      let dz = tz - a.z;
      const d = hypot2(dx, dz);
      const speed = d > 5 ? 6.8 : 4.6;
      if (d > 0.2) {
        const step = Math.min(d, speed * dt);
        a.x += (dx / d) * step;
        a.z += (dz / d) * step;
      }
      const c = world.resolve(a.x, a.z, 0.35);
      a.x = c.x;
      a.z = c.z;
      const foe = nearest(a.x, a.z, 12);
      if (foe) a.yaw = dampAngle(a.yaw, Math.atan2(foe.x - a.x, foe.z - a.z), 8, dt);
      else if (d > 0.4) a.yaw = dampAngle(a.yaw, Math.atan2(dx, dz), 8, dt);
      a.cd = Math.max(0, a.cd - dt);
      if (a.anim !== "idle") {
        a.animT += dt / 0.4;
        if (a.animT >= 1) a.anim = "idle";
      }
      if (allyHold <= 0 && foe && player.hp > 0 && a.anim === "idle") {
        const fd = hypot2(foe.x - a.x, foe.z - a.z);
        if (a.id === "tom" && fd < 2.35 && a.cd <= 0) {
          a.cd = 3.3;
          a.anim = "shove";
          a.animT = 0;
          damageEnemy(foe, 15, a);
          if (foe.alive && foe.kind !== "boss") { foe.state = "stun"; foe.stunFor = 0.45; foe.t = 0; }
          if (!flags.tomFight) { flags.tomFight = true; speak("tom", LINES.tom.fight); }
        } else if (a.id === "jang" && fd < 11 && a.cd <= 0) {
          a.cd = 4;
          a.anim = "throw";
          a.animT = 0;
          const mesh = handbillMesh();
          scene.add(mesh);
          bills.push({ mesh, x: a.x, y: 1.3, z: a.z, foe, life: 0 });
        }
      }
      const y = heightAt(a.x, a.z);
      a.rig.root.position.set(a.x, y, a.z);
      a.rig.root.rotation.y = a.yaw;
      a.rig.update(dt, {
        speed: d > 0.3 ? Math.min(5, d) : 0,
        air: false,
        action: a.anim,
        actionT: a.animT,
        combo: 1,
        look: 0,
        hurt: 0,
        dodgeSide: 0,
      });
      void camYaw;
    }
    for (let i = bills.length - 1; i >= 0; i--) {
      const b = bills[i];
      b.life += dt;
      const target = b.foe && b.foe.alive ? b.foe : null;
      const tx = target ? target.x : b.x;
      const tz = target ? target.z : b.z + 0.5;
      const dx = tx - b.x;
      const dz = tz - b.z;
      const d = hypot2(dx, dz) || 0.001;
      b.x += (dx / d) * 13 * dt;
      b.z += (dz / d) * 13 * dt;
      b.y = 1.25 + Math.sin(b.life * 16) * 0.05;
      b.mesh.position.set(b.x, b.y, b.z);
      b.mesh.rotation.y += dt * 8;
      b.mesh.rotation.x = Math.sin(b.life * 10) * 0.4;
      if (target && d < 0.7) {
        damageEnemy(target, 7, { x: b.x, z: b.z });
        if (target.kind !== "boss") {
          target.state = "stun";
          target.t = 0;
          target.stunFor = 1.25;
        } else {
          target.hit = 1;
        }
        if (!flags.bill) { flags.bill = true; speak("jang", LINES.jang.bill); }
        scene.remove(b.mesh);
        bills.splice(i, 1);
      } else if (b.life > 1.6) {
        scene.remove(b.mesh);
        bills.splice(i, 1);
      }
    }
  }

  function tryChests() {
    for (const chest of world.chests) {
      const d = hypot2(chest.x - player.x, chest.z - player.z);
      if (!chest.open && d < 1.6) return chest;
    }
    return null;
  }

  function openChest(chest) {
    if (!chest || chest.open) return;
    chest.open = true;
    player.potions += 1;
    player.coins += 12;
    audio.chest();
    events.push({ type: "dmg", x: chest.x, y: 1.2, z: chest.z, n: 12, coin: true });
    speak("jang", LINES.jang.chest);
  }

  function pageCount() {
    return world.pages.filter((p) => p.got).length;
  }

  function collectPage() {
    for (const p of world.pages) {
      if (p.got) continue;
      if (hypot2(p.x - player.x, p.z - player.z) < 1.45) {
        p.got = true;
        p.mesh.visible = false;
        audio.chest();
        if (!flags.paged) {
          flags.paged = true;
          speak("jang", "A torn page. The book wants it back more than the dust does.");
        }
        return { type: "page", id: p.id, n: pageCount() };
      }
    }
    return null;
  }

  function updateFloats(dt) {
    for (const w of world.floats) {
      if (w.floated) continue;
      if (!w.drift) {
        let dx = w.x - player.x;
        let dz = w.z - player.z;
        let d = hypot2(dx, dz) || 0.001;
        const min = 1.72;
        if (d < min) {
          const overlap = min - d;
          w.x += (dx / d) * overlap;
          w.z += (dz / d) * overlap;
          if (player.z < w.z + 0.4) w.z += Math.max(overlap * 0.65, 0.05);
          const half = halfWidth(w.z) - 1.4;
          w.x = clamp(w.x, -half, half);
          w.z = clamp(w.z, 94, 107);
          dx = w.x - player.x;
          dz = w.z - player.z;
          d = hypot2(dx, dz) || 0.001;
          player.x = w.x - (dx / d) * min;
          if (player.z > w.z - 0.35) player.z = w.z - 0.35;
        }
        if (w.z > 102.45) w.drift = true;
      } else {
        w.z = Math.min(112.2, w.z + dt * 2.6);
        w.x = damp(w.x, clamp(w.x, -5.5, 5.5), 2, dt);
        if (w.z >= 111.6) w.floated = true;
      }
      w.mesh.position.set(w.x, heightAt(w.x, w.z) + (w.drift ? 0.16 : 0), w.z);
      w.mesh.rotation.y = Math.atan2(player.x - w.x, 2);
    }
    if (!circus && world.floats.every((w) => w.floated)) {
      circus = true;
      speak("jang", LINES.jang.circus);
      events.push({ type: "circus" });
    }
  }

  function checkRope() {
    const bob = world.rope;
    if (!bob || !bob.low) return;
    let any = false;
    for (const e of enemies) {
      if (!e.alive || !e.pendulum) continue;
      if (hypot2(e.x - bob.x, e.z - bob.z) > 1.6) continue;
      e.hp = 0;
      e.alive = false;
      e.state = "dead";
      e.t = 0;
      e.routed = true;
      e.x += Math.sign(e.x - bob.x || 1) * 1.4;
      e.z += 0.8;
      any = true;
    }
    if (any) {
      audio.hit();
      if (!flags.rout) {
        flags.rout = true;
        speak("tom", LINES.tom.rout);
        events.push({ type: "rout" });
      }
    }
  }

  function settleCircus() {
    circus = true;
    for (const w of world.floats) {
      w.drift = true;
      w.floated = true;
      w.z = 112;
      w.mesh.position.set(w.x, heightAt(w.x, 112) + 0.22, 112);
    }
  }

  let outroT = -1;
  let outroArmed = true;
  let playTime = 0;

  function update(dt, input, camYaw, play, fresh = true) {
    if (fresh) {
      events.length = 0;
      while (pending.length) events.push(pending.shift());
    }
    sayLock = Math.max(0, sayLock - dt);
    if (!play) {
      idlePresentation(dt);
      return snapshot(camYaw, null);
    }
    const edge = input.pull();
    const axes = input.axes();
    playTime += dt;
    if (!flags.g1) { flags.g1 = true; speak("jang", LINES.jang.greet); }
    if (!flags.g2 && playTime > 3.8) { flags.g2 = true; speak("tom", LINES.tom.greet); }
    player.flashCd = Math.max(0, player.flashCd - dt);
    player.iframes = Math.max(0, player.iframes - dt);
    player.hurt = Math.max(0, player.hurt - dt * 2);

    const mag = clamp(Math.hypot(axes.fwd, axes.strafe), 0, 1);
    let wishX = 0;
    let wishZ = 0;
    if (mag > 0.05) {
      const nx = axes.strafe / mag;
      const nz = axes.fwd / mag;
      wishX = Math.sin(camYaw) * nz + Math.cos(camYaw) * nx;
      wishZ = Math.cos(camYaw) * nz - Math.sin(camYaw) * nx;
    }
    if (edge.attack && player.action === "attack" && player.actionT > 0.34 && player.combo < 3) player.comboQueue = true;
    else if (edge.attack && (player.action === "idle" || player.action === "flash")) startAttack(1);
    if (edge.dodge && player.action !== "dodge" && player.grounded) startDodge(wishX, wishZ, camYaw);
    if (edge.jump && player.grounded && player.action !== "dodge") {
      player.vy = 7.5;
      player.grounded = false;
    }
    if (edge.flash && player.flashCd <= 0 && player.action !== "dodge") startFlash();
    if (edge.potion) drink();
    if (edge.lock) toggleLock();

    let speedMul = 5.35;
    if (player.action === "attack") speedMul *= 0.42;
    if (player.z > 109 && player.z < 121) speedMul *= 0.86;
    if (player.action === "dodge") {
      player.vx = Math.sin(player.dodgeYaw) * 11.5;
      player.vz = Math.cos(player.dodgeYaw) * 11.5;
    } else {
      player.vx = damp(player.vx, wishX * speedMul * mag, 9, dt);
      player.vz = damp(player.vz, wishZ * speedMul * mag, 9, dt);
    }

    player.x += player.vx * dt;
    player.z += player.vz * dt;
    const resolved = world.resolve(player.x, player.z, 0.38, boss.alive && boss.active ? [{ x: boss.x, z: boss.z, r: 1.15 }] : null);
    player.x = resolved.x;
    player.z = resolved.z;
    if (!circus && player.z > 103.2) player.z = 103.2;
    if (bossWall && boss.alive && player.z > 123) player.z = 123;

    player.vy -= 28 * dt;
    player.y += player.vy * dt;
    const ground = heightAt(player.x, player.z);
    if (player.y <= ground) {
      player.y = ground;
      if (player.vy < 0) player.vy = 0;
      player.grounded = true;
    } else player.grounded = false;

    const moving = hypot2(player.vx, player.vz) > 0.35;
    if (player.action === "attack" || player.action === "flash") {
      /* yaw snapped at the start */
    } else if (lockTarget && lockTarget.alive) {
      player.yaw = dampAngle(player.yaw, Math.atan2(lockTarget.x - player.x, lockTarget.z - player.z), 12, dt);
    } else if (moving) {
      player.yaw = dampAngle(player.yaw, Math.atan2(player.vx, player.vz), 10, dt);
    }

    if (player.action !== "idle") {
      player.actionT += dt / player.actionDur;
      if (player.action === "attack" && player.actionT > 0.18 && player.actionT < 0.62) {
        const reach = player.combo === 3 ? 2.15 : 1.9;
        for (const e of living()) {
          if (swingHit.has(e.id)) continue;
          if (inFront(player.x, player.z, player.yaw, e.x, e.z, reach + e.radius * 0.35, 0.15)) {
            swingHit.add(e.id);
            const dmg = player.combo === 3 ? 26 : player.combo === 2 ? 17 : 14;
            damageEnemy(e, dmg);
            playerHits++;
          }
        }
      }
      if (player.actionT >= 1) {
        if (player.action === "attack" && player.comboQueue && player.combo < 3) startAttack(player.combo + 1);
        else { player.action = "idle"; player.combo = 0; player.comboQueue = false; }
      }
    }

    for (const e of enemies) updateEnemy(e, dt);
    updateBoss(dt);
    separate(dt);
    updateAllies(dt, camYaw);

    for (const chest of world.chests) {
      const target = chest.open ? -1.15 : 0;
      chest.lid.rotation.x = damp(chest.lid.rotation.x, target, 8, dt);
    }

    updateFloats(dt);
    checkRope();
    const pageEv = collectPage();
    if (pageEv) events.push(pageEv);
    if (!flags.ford && !circus && player.z > 92) {
      flags.ford = true;
      speak("jang", LINES.jang.ford);
    }
    if (!flags.rope && player.z > 72 && player.z < 90) {
      flags.rope = true;
      speak("jang", LINES.jang.rope);
    }

    const chest = tryChests();
    let prompt = null;
    if (chest) prompt = { id: "chest", label: "Open the chest" };
    const gateD = hypot2(player.x, player.z - 126);
    const storyWhole = pageCount() >= world.pages.length;
    if (!boss.alive && storyWhole && gateD < 2.4) prompt = { id: "gate", label: "Step back through the screen" };
    if (edge.use && prompt) {
      if (prompt.id === "chest") openChest(chest);
      if (prompt.id === "gate") {
        world.gate.setOpen(true);
        events.push({ type: "gate" });
        speak("tom", LINES.tom.gate);
      }
    }

    if (flags.won && outroArmed && outroT < 0) {
      outroT = 1.5;
      outroArmed = false;
    }
    if (outroT > 0) {
      outroT -= dt;
      if (outroT <= 0) events.push({ type: "outro" });
    }

    const speed = hypot2(player.vx, player.vz);
    const step = keeper.update(dt, {
      speed,
      air: !player.grounded,
      action: player.action,
      actionT: Math.min(1, player.actionT),
      combo: player.combo,
      look: lockTarget ? clamp(Math.atan2(lockTarget.x - player.x, lockTarget.z - player.z) - player.yaw, -0.8, 0.8) : 0,
      hurt: player.hurt,
      dodgeSide: player.dodgeSide,
    });
    keeper.root.position.set(player.x, player.y, player.z);
    keeper.root.rotation.y = player.yaw;
    if (keeper.glow) {
      const ready = 1 - player.flashCd / player.flashMax;
      keeper.glow.scale.setScalar(0.8 + ready * 0.5);
    }
    if (step && step.step && player.grounded) audio.step();

    const got = pageCount();
    let objective = `The Hum tore pages from this book. Gather them. ${got}/5`;
    if (!flags.rout && player.z > 70 && player.z < 92 && boss.alive) objective = "Lure the bandits under the swinging rope.";
    if (!circus && player.z > 90) objective = "Push both wagons into the river. Stage the floating circus.";
    if (circus && boss.alive && !boss.active) objective = "The wagons are afloat. The dust coach is waiting in the ford.";
    if (boss.active && boss.alive) objective = "The dust coach is not a coach. Break it.";
    if (!boss.alive && got < 5) objective = `The coach is dust. The book still wants ${5 - got} page${got === 4 ? "" : "s"}.`;
    if (!boss.alive && got >= 5) objective = "The story is restored. Step back through the screen.";

    return snapshot(camYaw, prompt, objective);
  }

  let lockTarget = null;
  function findLock() {
    if (lockTarget && !lockTarget.alive) lockTarget = null;
    return lockTarget;
  }
  function toggleLock() {
    if (lockTarget) { lockTarget = null; return; }
    lockTarget = nearest(player.x, player.z, 16);
  }

  function startAttack(n) {
    player.action = "attack";
    player.combo = n;
    player.comboQueue = false;
    player.actionT = 0;
    player.actionDur = n === 3 ? 0.5 : 0.36;
    swingHit.clear();
    if (lockTarget && lockTarget.alive) player.yaw = Math.atan2(lockTarget.x - player.x, lockTarget.z - player.z);
    else if (hypot2(player.vx, player.vz) > 0.4) player.yaw = Math.atan2(player.vx, player.vz);
    audio.swing();
  }

  function startDodge(wx, wz, camYaw) {
    player.action = "dodge";
    player.actionT = 0;
    player.actionDur = 0.46;
    const mag = hypot2(wx, wz);
    if (mag > 0.2) player.dodgeYaw = Math.atan2(wx, wz);
    else player.dodgeYaw = camYaw + Math.PI;
    player.dodgeSide = Math.sin(player.dodgeYaw - camYaw);
    player.iframes = 0.34;
    player.combo = 0;
  }

  function startFlash() {
    player.action = "flash";
    player.actionT = 0;
    player.actionDur = 0.42;
    player.flashCd = player.flashMax;
    audio.flash();
    events.push({ type: "flash", x: player.x, z: player.z });
    for (const e of living()) {
      const d = hypot2(e.x - player.x, e.z - player.z);
      const rad = e.kind === "boss" ? 5.2 : 4.3;
      if (d < rad) {
        const dmg = e.kind === "shade" ? 30 : e.kind === "boss" ? 36 : 16;
        damageEnemy(e, dmg);
        if (e.alive && e.kind === "boss") {
          e.state = "stagger";
          e.t = 0;
          e.stunFor = 0.85;
        } else if (e.alive) {
          e.state = "stun";
          e.t = 0;
          e.stunFor = 1.35;
        }
        playerHits++;
      }
    }
  }

  function drink() {
    if (player.potions <= 0 || player.hp >= player.hpMax) return;
    player.potions -= 1;
    player.hp = Math.min(player.hpMax, player.hp + 40);
    audio.chest();
  }

  function idlePresentation(dt) {
    player.y = heightAt(player.x, player.z);
    keeper.root.position.set(player.x, player.y, player.z);
    keeper.root.rotation.y = player.yaw;
    keeper.update(dt, { speed: 0, action: "idle", actionT: 0, combo: 0, air: false, hurt: 0, look: 0.2, dodgeSide: 0 });
    for (const a of allies) {
      a.rig.root.position.set(a.x, heightAt(a.x, a.z), a.z);
      a.rig.root.rotation.y = a.yaw;
      a.rig.update(dt, { speed: 0, action: "idle", actionT: 0, combo: 0, air: false, hurt: 0, look: 0, dodgeSide: 0 });
    }
    for (const e of enemies) {
      e.y = heightAt(e.x, e.z);
      e.rig.root.position.set(e.x, e.y, e.z);
      e.rig.update(dt, { speed: 0, action: "idle", actionT: 0, combo: 0, air: false, hurt: 0, tele: false, strike: false, hit: 0 });
    }
    bossRig.root.position.set(boss.x, heightAt(boss.x, boss.z), boss.z);
    bossRig.root.rotation.y = boss.yaw;
    bossRig.update(dt, { moving: false, state: "idle", hit: 0 });
  }

  function snapshot(camYaw, prompt, objective) {
    const head = (rig, x, y, z) => ({ x, y: y + 1.85, z });
    return {
      player: {
        x: player.x, y: player.y, z: player.z, yaw: player.yaw, hp: player.hp, hpMax: player.hpMax,
        coins: player.coins, potions: player.potions,
        flash: 1 - player.flashCd / player.flashMax,
        combo: player.action === "attack" ? player.combo : 0,
        hits: playerHits,
      },
      heads: {
        keeper: head(keeper, player.x, player.y, player.z),
        jang: { x: allies[0].x, y: heightAt(allies[0].x, allies[0].z) + 1.7, z: allies[0].z },
        tom: { x: allies[1].x, y: heightAt(allies[1].x, allies[1].z) + 2.05, z: allies[1].z },
      },
      enemies: enemies.filter((e) => e.rig.root.visible).map((e) => ({
        id: e.id, kind: e.kind, hp: e.hp, alive: e.alive, x: e.x, y: e.y + 1.4, z: e.z,
        tele: e.state === "tele",
      })),
      boss: {
        alive: boss.alive, active: boss.active, hp: boss.hp, hpMax: boss.hpMax,
        x: boss.x, y: heightAt(boss.x, boss.z) + 2.4, z: boss.z,
      },
      lock: lockTarget && lockTarget.alive ? { id: lockTarget.id, x: lockTarget.x, y: heightAt(lockTarget.x, lockTarget.z) + (lockTarget.kind === "boss" ? 2.2 : 1.5), z: lockTarget.z } : null,
      prompt,
      pages: pageCount(),
      circus,
      objective: objective || "The Hum tore pages from this book.",
      events,
      camYaw,
    };
  }

  return {
    update,
    begin() {},
    place(x, z, yaw = 0) {
      player.x = x;
      player.z = z;
      player.y = heightAt(x, z);
      player.yaw = yaw;
      player.vx = player.vz = 0;
    },
    wakeBoss() {
      settleCircus();
      boss.active = true;
      boss.state = "intro";
      boss.t = 0;
    },
    revive() {
      player.hp = player.hpMax;
      player.iframes = 1.2;
      player.action = "idle";
      if (boss.active && boss.alive) {
        player.x = 0;
        player.z = 102;
        boss.hp = boss.hpMax;
        boss.x = 0;
        boss.z = 114;
        boss.state = "recover";
        boss.t = 0;
      } else {
        player.x = 0;
        player.z = -4;
      }
      player.y = heightAt(player.x, player.z);
    },
    resetTrail() {
      while (bills.length) {
        const b = bills.pop();
        scene.remove(b.mesh);
      }
      pending.length = 0;
      for (const k of Object.keys(flags)) delete flags[k];
      outroT = -1;
      outroArmed = true;
      playTime = 0;
      allyHold = 8;
      sayLock = 0;
      playerHits = 0;
      bossWall = true;
      lockTarget = null;
      swingHit.clear();
      player.x = 0;
      player.z = -6;
      player.y = heightAt(0, -6);
      player.yaw = 0;
      player.vx = player.vz = player.vy = 0;
      player.hp = player.hpMax;
      player.coins = 0;
      player.potions = 1;
      player.iframes = 0;
      player.action = "idle";
      player.actionT = 0;
      player.combo = 0;
      player.comboQueue = false;
      player.flashCd = 0;
      player.hurt = 0;
      player.grounded = true;
      const homes = [[-1.5, 0.6, 0.2], [1.7, 0.4, -0.1]];
      allies.forEach((a, i) => {
        a.x = homes[i][0];
        a.z = homes[i][1];
        a.yaw = homes[i][2];
        a.cd = 1.2;
        a.anim = "idle";
        a.animT = 0;
      });
      for (const e of enemies) {
        e.x = e.homeX;
        e.z = e.homeZ;
        e.yaw = Math.PI;
        e.y = heightAt(e.homeX, e.homeZ);
        e.hp = e.hpMax;
        e.alive = true;
        e.state = "idle";
        e.t = 0;
        e.hit = 0;
        e.didHit = false;
        e.speed = 0;
        e.stunFor = 0;
        e.rig.root.visible = true;
        e.rig.root.rotation.x = 0;
        e.rig.root.rotation.z = 0;
        e.rig.root.position.set(e.x, e.y, e.z);
      }
      boss.alive = true;
      boss.active = false;
      boss.x = 0;
      boss.z = 114;
      boss.yaw = Math.PI;
      boss.hp = boss.hpMax;
      boss.state = "idle";
      boss.t = 0;
      boss.pattern = 0;
      boss.didHit = false;
      boss.hit = 0;
      boss.stunFor = 0;
      bossRig.root.visible = true;
      bossRig.root.rotation.set(0, Math.PI, 0);
      bossRig.root.position.set(0, heightAt(0, 114), 114);
      for (const chest of world.chests) {
        chest.open = false;
        chest.lid.rotation.x = 0;
      }
      world.gate.setOpen(false);
      audio.setTension(0);
      circus = false;
      for (const p of world.pages) {
        p.got = false;
        p.mesh.visible = true;
      }
      for (const w of world.floats) {
        w.x = w.homeX;
        w.z = w.homeZ;
        w.drift = false;
        w.floated = false;
        w.mesh.position.set(w.x, heightAt(w.x, w.z), w.z);
        w.mesh.rotation.z = 0;
      }
      for (const e of enemies) e.routed = false;
    },
    skipToGate(withPages = true) {
      settleCircus();
      if (withPages) {
        for (const p of world.pages) {
          p.got = true;
          p.mesh.visible = false;
        }
      }
      boss.alive = false;
      boss.hp = 0;
      boss.active = true;
      boss.state = "dead";
      boss.t = 1.6;
      bossWall = false;
      flags.won = true;
      outroArmed = false;
      outroT = 0;
      player.x = 0;
      player.z = 124.2;
      player.y = heightAt(0, 124.2);
      player.yaw = 0;
      player.vx = player.vz = player.vy = 0;
      player.hp = player.hpMax;
      player.action = "idle";
    },
    pageCount,
    circusDone: () => circus,
    floats: () => world.floats.map((w) => ({ x: w.x, z: w.z, drift: w.drift, floated: w.floated })),
    player,
    enemies,
    boss,
    hits: () => playerHits,
  };
}
