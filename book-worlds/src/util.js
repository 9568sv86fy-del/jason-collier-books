export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export function angDelta(a, b) {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

export function dampAngle(a, b, lambda, dt) {
  return a + angDelta(a, b) * (1 - Math.exp(-lambda * dt));
}

// Critically damped yaw spring. omega is the natural frequency; maxSpeed is rad/s.
export function springAngle(angle, vel, target, omega, dt, maxSpeed) {
  const err = angDelta(angle, target);
  const acc = omega * omega * err - 2 * omega * vel;
  let v = vel + acc * dt;
  if (maxSpeed > 0) v = Math.max(-maxSpeed, Math.min(maxSpeed, v));
  return { angle: angle + v * dt, vel: v };
}

export function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function hypot2(x, z) {
  return Math.hypot(x, z);
}
