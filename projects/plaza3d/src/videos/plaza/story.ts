// Plaza test scene timeline (original content for the cartoon_3d_short look test).
// One continuous shot, 390 frames = 13 s at 30 fps: a kid rides a bicycle across a painted 3D town
// plaza while the camera glides alongside. Camera grammar follows the skill's measured rules:
// smootherstep glides, a look target that tracks the subject, no static holds.
export type V3 = [number, number, number];
export const FPS = 30;
export const TOTAL = 390;
export const D0 = 0; // ground height (build.ts imports this from ./story)

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

// ---------------- the ride ----------------
/** kid world position at frame f: straight along the street (z = 0), -25 m -> +25 m */
export const kidAt = (f: number): V3 => [-25 + (50 * f) / (TOTAL - 1), 0, 0];
/** pedal phase in revolutions (cadence ~1.8 rev/s) */
export const pedalRev = (f: number) => (f / FPS) * 1.8;

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3,
  look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** look target: on the kid, led ~1.1 m ahead of his front wheel, at chest height */
const lookKid = (f: number, lead = 1.1, h = 0.95): V3 => { const k = kidAt(f); return [k[0] + lead, h, k[2]]; };

/** camera rides alongside the kid: pos = kid position + a gliding offset (5-7 m away, low) */
const off = (dx: number, y: number, dz: number, lead = 0.9, fov = 40, roll = 0) => (f: number): Shot => {
  const k = kidAt(f);
  return { pos: [k[0] + dx, y, k[2] + dz], look: lookKid(f, lead, 0.92), fov, roll };
};
const KEYS: Key[] = [
  { f: 0, s: off(-2.4, 1.95, 6.6, 0.5, 42) },              // front-quarter, widest
  { f: 90, dur: 160, s: off(0.8, 1.7, 5.6, 0.9, 39) },      // drifts to a pure side track
  { f: 240, dur: 120, s: off(1.9, 1.55, 5.6, 0.7, 38, 0.012) }, // rear-quarter, closest; fg tree sweeps past
  { f: 330, dur: 59, s: off(4.6, 2.05, 7.2, 0.45, 41, 0) },  // pulls back as he rides away
];
export const camAt = (f: number): Cam => run(KEYS, f);

// ---------------- lens: depth of field ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },                                        // establishing: all sharp
  { f: 55, dur: 45, cInf: 11, focus: (f) => { const k = kidAt(f); return [k[0] + 0.3, 0.95, k[2]]; } },
  { f: 300, cInf: 12, focus: (f) => { const k = kidAt(f); return [k[0] + 0.3, 0.95, k[2]]; } },
  { f: 352, dur: 30, cInf: 3 },                             // release as he rides away
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
