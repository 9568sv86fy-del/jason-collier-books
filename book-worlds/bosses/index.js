// One boss module per world. Add a file and a line here when a station goes live.
// Each module exports { boss } with:
//   id, world, name, hp, radius, home {x,z,yaw}, drain {inner,outer},
//   lines {jang, tom, lasso, win}, objective {waiting, fighting, thinning(left)},
//   create() -> { root, update(dt, {moving, state, hit}) }
import { boss as californiaTrail } from "./california-trail.js";

const bosses = {
  "california-trail": californiaTrail,
};

export function bossFor(worldId) {
  const boss = bosses[worldId];
  if (!boss) throw new Error("No signature boss for " + worldId);
  return boss;
}
