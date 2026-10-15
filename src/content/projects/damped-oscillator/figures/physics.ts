// Closed-form solutions used by the figures. Units: x0 = 1, v0 = 0.

/** Free response x(t) of x'' + 2ζω₀x' + ω₀²x = 0. */
export function freeResponse(t: number, zeta: number, w0: number, x0 = 1, v0 = 0) {
  if (zeta < 1 - 1e-6) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const e = Math.exp(-zeta * w0 * t);
    return e * (x0 * Math.cos(wd * t) + ((v0 + zeta * w0 * x0) / wd) * Math.sin(wd * t));
  }
  if (zeta < 1 + 1e-6) {
    return (x0 + (v0 + w0 * x0) * t) * Math.exp(-w0 * t);
  }
  const s = Math.sqrt(zeta * zeta - 1);
  const l1 = -w0 * (zeta - s);
  const l2 = -w0 * (zeta + s);
  const A = (v0 - l2 * x0) / (l1 - l2);
  return A * Math.exp(l1 * t) + (x0 - A) * Math.exp(l2 * t);
}

/** Steady-state amplitude ratio X / (F₀/k) at frequency ratio r = Ω/ω₀. */
export const gain = (r: number, zeta: number) =>
  1 / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2);

/** Phase lag φ (radians) of the response behind the drive. */
export const phase = (r: number, zeta: number) => Math.atan2(2 * zeta * r, 1 - r * r);

export const regime = (zeta: number) =>
  zeta === 0 ? 'undamped' : zeta < 1 ? 'underdamped' : zeta === 1 ? 'critically damped' : 'overdamped';
