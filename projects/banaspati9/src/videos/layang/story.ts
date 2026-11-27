// Layang (kite) test short — timeline, staging paths, camera and lens.
// Built on the cartoon_3d_short template systems (story.ts CAMS/DOF pattern).
// Narration: 7 Indonesian lines (Charon, Gemini API), timeline measured from the
// assembled voice.wav — see audio/layang/final/timeline.json. 30 fps, 1082 frames.
export type V3 = [number, number, number];
export const FPS = 30;
export const TOTAL = 1082;
export const D0 = 0; // ground height (build.ts imports this from ./story)

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- narration timeline (seconds -> frames) ----------------
export const LB = [9, 112, 238, 379, 566, 747, 871];   // line start frames
export const LE = [103, 229, 370, 513, 738, 862, 1061]; // line end frames
export const HENING: [number, number] = [518, 557];     // the designed still/silent beat
export const STALL = 433;                               // the moment the wind dies (mid L4)

// ---------------- shots ----------------
// 0 S1 wide establishing | 1 S2 tracking run | 2 S3 low angle | 3 S4a medium fall
// 4 S4b close-up + hening | 5 S5 two-shot teaching | 6 S6 tracking run 2 | 7 S7 closing wide
export const SHOT_START = [0, 109, 235, 376, 469, 563, 744, 868];
export const shotAt = (f: number) => { let s = 0; for (let i = 0; i < SHOT_START.length; i++) if (f >= SHOT_START[i]) s = i; return s; };

// ---------------- wind + gated ambient time ----------------
/** wind strength 0..1.15 across the story (drives kite dance, tree sway, sag) */
export const windAt = (f: number): number => {
  const s = shotAt(f);
  if (s === 0) return 0.5;
  if (s === 1) return 1.0;
  if (s === 2) return 1.15;
  if (s === 3) return f < 425 ? 1.1 : 1.1 * (1 - smooth((f - 425) / 35));
  if (s === 4) return 0;
  if (s === 5) return f < 700 ? 0.18 : 0.18 + 0.25 * smooth((f - 700) / 38);
  if (s === 6) return 1.1;
  return 1.0;
};
/** ambient gate: 1 normally, 0 across the hening beat (ramps 500-518 and 557-575) */
export const ambGate = (f: number): number => {
  if (f < 500) return 1;
  if (f < HENING[0]) return 1 - smooth((f - 500) / (HENING[0] - 500));
  if (f <= HENING[1]) return 0;
  if (f < 575) return smooth((f - HENING[1]) / (575 - HENING[1]));
  return 1;
};
/** gated ambient time in seconds (freezes during hening): clouds, trees, birds, dance phase */
export const AMBT: number[] = (() => {
  const out = [0];
  for (let f = 1; f <= TOTAL; f++) out.push(out[f - 1] + ambGate(f - 1) / FPS);
  return out;
})();
export const ambT = (f: number) => AMBT[Math.max(0, Math.min(TOTAL, Math.floor(f)))];

// ---------------- character paths ----------------
export type Pose =
  | "walkCarry" | "runSide" | "lookUp" | "frontPull" | "frontShock" | "cu" | "holdSide" | "standFront"
  | "sit" | "stroll" | "teach" | "stand";
export type CharState = { x: number; z: number; face: number; pose: Pose; phase: number };

export const dikaAt = (f: number): CharState => {
  const s = shotAt(f);
  switch (s) {
    case 0: { const u = glide(f / 108); const [x, z] = lerp3([-7.5, 0, 5.5], [-2.0, 0, 2.8], u); return { x, z, face: 1, pose: "walkCarry", phase: (f / FPS) * 1.1 }; }
    case 1: { const u = (f - 109) / 125; return { x: -11 + 16 * u, z: 2.2, face: 1, pose: "runSide", phase: ((f - 109) / FPS) * 1.6 }; }
    case 2: return { x: 3.0, z: 2.0, face: -1, pose: "lookUp", phase: 0 };
    case 3: return { x: 3.0, z: 2.0, face: 0, pose: f < STALL ? "frontPull" : "frontShock", phase: 0 };
    case 4: return { x: 3.0, z: 2.0, face: 0, pose: "cu", phase: 0 };
    case 5: return { x: 2.3, z: 2.5, face: -1, pose: "holdSide", phase: 0 };
    case 6: { const u = (f - 744) / 123; return { x: 7 - 16 * u, z: 3.6, face: -1, pose: "runSide", phase: ((f - 744) / FPS) * 1.62 }; }
    default: return { x: 0.5, z: 1.5, face: 0, pose: "standFront", phase: 0 };
  }
};

const HUT: V3 = [-6.5, 0, -7.15];
const TEACH_POS: V3 = [0.55, 0, 2.95];
export const kakekAt = (f: number): CharState => {
  if (f < 376) return { x: HUT[0], z: HUT[2], face: 0, pose: "sit", phase: 0 };
  if (f < 640) {
    const u = smooth((f - 376) / 264);
    const [x, z] = lerp3(HUT, TEACH_POS, u);
    const walked = u * 13.4;
    return { x, z, face: 1, pose: "stroll", phase: walked / 1.1 };
  }
  if (f < 744) return { x: TEACH_POS[0], z: TEACH_POS[2], face: 1, pose: "teach", phase: 0 }; // face +1: he stands west of Dika and teaches TOWARD him (was -1: profile + raised arm pointed away from both Dika and the kite)
  if (f < 868) return { x: TEACH_POS[0], z: TEACH_POS[2], face: 0, pose: "stand", phase: 0 };
  return { x: -0.7, z: 1.05, face: 0, pose: "stand", phase: 0 };
};

// ---------------- expressions (template Expr names) ----------------
export const dikaExpr = (f: number): string => {
  const s = shotAt(f);
  if (s === 0) return "smile";
  if (s === 1) return f < 171 ? "grin" : "laugh";
  if (s === 2) return "grin";
  if (s === 3) return f < STALL ? "grin" : "shock";
  if (s === 4) return "nervous";
  if (s === 5) return f < 656 ? "nervous" : "smile_closed";
  if (s === 6) return f < 821 ? "stern" : "grin";
  return "laugh";
};
export const kakekExpr = (f: number): string => {
  const s = shotAt(f);
  if (s <= 3) return "neutral";
  if (s === 5) return f < 640 ? "relief_open" : "smile";
  if (s === 7) return "smile_closed";
  return "smile";
};
/** Dika's pupil look in the CU shot: up-left while the kite sinks out of frame, then down */
export const cuLook = (f: number): [number, number] => {
  if (f < 505) return [-0.6, -0.8];
  const u = smooth((f - 505) / 12);
  return [lerp(-0.6, -0.2, u), lerp(-0.8, 0.55, u)];
};

// ---------------- the kite ----------------
type Anchor = [number, number, number, number]; // frame, x, y, z
const KITE_KEYS: Anchor[] = [
  [109, -12.5, 1.9, -1.0], [165, -5.5, 4.6, -3.0], [205, 1.0, 6.0, -3.6], [234, 7.0, 7.6, -4.2],
  [300, -3.5, 11.0, -5.5], [375, -3.5, 11.0, -5.5],
  [376, -4.8, 10.5, -5.6], [433, -4.7, 10.2, -5.55], [468, -4.4, 5.6, -5.3],
  [557, -4.3, 4.4, -5.2], [699, -4.3, 4.5, -5.2], [738, -4.1, 5.3, -5.0],
  [744, -4.0, 5.8, -4.9], [800, -7.5, 10.5, -6.5], [867, -12.5, 15.5, -8.5],
  [930, -7.0, 15.6, -10.5], [1081, -7.0, 15.6, -10.5], // 15.6, not 17.5: at 17.5 the S7 camera crops the kite at the top edge (f950 proof)
];
const kiteBase = (f: number): V3 => {
  if (f < 109) { const d = dikaAt(f); return [d.x - 0.62, 1.02, d.z + 0.18]; } // carried at his side
  let i = 0;
  while (i + 1 < KITE_KEYS.length && f >= KITE_KEYS[i + 1][0]) i++;
  const a = KITE_KEYS[i], b = KITE_KEYS[Math.min(i + 1, KITE_KEYS.length - 1)];
  if (b[0] === a[0]) return [a[1], a[2], a[3]];
  const u = glide((f - a[0]) / (b[0] - a[0]));
  return [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
};
export type KiteState = { pos: V3; roll: number; dance: number };
export const kiteAt = (f: number): KiteState => {
  const base = kiteBase(f), w = windAt(f), t = ambT(f), s = shotAt(f);
  if (s === 0) return { pos: base, roll: -0.5 + 0.03 * Math.sin(t * 2.1), dance: 0 };
  const amp = 1.15 * Math.min(1, w);
  const dx = Math.sin(t * 1.7) * amp, dy = Math.sin(t * 2.3 + 1.2) * amp * 0.55, dz = Math.cos(t * 1.3) * amp * 0.5;
  let roll = Math.sin(t * 2.3) * 0.28 * Math.min(1, w) - 0.05;
  if (f >= STALL && f < 470) roll += Math.sin((f - STALL) * 0.55) * Math.exp(-(f - STALL) / 13) * 0.85; // oleng wobble, decaying
  if (s >= 4 && f < 700) roll = lerp(roll, -0.14, 0.85); // limp while the wind is dead
  return { pos: [base[0] + dx, base[1] + dy, base[2] + dz], roll, dance: t };
};
/** string sag in metres (0 = taut) */
export const sagAt = (f: number): number => {
  const s = shotAt(f);
  if (s === 0) return 0.12;
  if (s <= 2) return 0.04;
  if (s === 3) return f < STALL ? 0.06 : lerp(0.06, 0.95, smooth((f - STALL) / 35));
  if (s === 4) return 1.05;
  if (s === 5) return f < 700 ? 0.85 : lerp(0.85, 0.3, smooth((f - 700) / 38));
  return 0.04;
};

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
const KEYS: Key[] = [
  { f: 0, s: () => ({ pos: [10.6, 3.6, 16.5], look: [-3.4, 1.0, -1.5], fov: 42 }) },
  { f: 55, dur: 53, s: () => ({ pos: [9.2, 3.1, 14.6], look: [-3.1, 1.0, -1.2], fov: 42 }) }, // S1 slow push-in
  { f: 109, cut: true, s: (f) => { const d = dikaAt(f); return { pos: [d.x - 1.9, 1.75, 7.6 - 0.4 * clamp01((f - 109) / 125)], look: [d.x + 1.2, 2.4, -0.5], fov: 40 }; } },
  { f: 235, cut: true, s: (f) => ({ pos: [5.8 - 0.2 * clamp01((f - 235) / 140), 0.55, 7.0], look: [0.2, 4.2, -2.0], fov: 48 }) },
  { f: 376, cut: true, s: (f) => ({ pos: [5.6 - 0.3 * clamp01((f - 376) / 92), 1.6, 5.6 - 0.3 * clamp01((f - 376) / 92)], look: [1.9, 1.75, 0.5], fov: 46 }) },
  { f: 469, cut: true, s: (f) => { const u = clamp01((f - 469) / 36); return { pos: [3.95 - 0.1 * u, 1.3 - 0.02 * u, 3.55 - 0.13 * u], look: [2.98, 1.08, 1.98], fov: 42 }; } }, // creep ends f505, dead still through hening
  { f: 563, cut: true, s: () => ({ pos: [6.9, 1.7, 8.3], look: [1.15, 1.15, 1.6], fov: 42 }) },
  { f: 640, dur: 103, s: () => ({ pos: [6.1, 1.6, 7.3], look: [1.05, 1.15, 1.7], fov: 42 }) },
  { f: 744, cut: true, s: (f) => { const d = dikaAt(f); return { pos: [d.x + 1.6, 1.0, 8.6], look: [d.x - 0.4, 1.05, 3.2], fov: 44 }; } },
  { f: 868, cut: true, s: () => ({ pos: [1.6, 3.4, 17.6], look: [-3.0, 6.6, -10.0], fov: 40 }) },
  { f: 950, dur: 131, s: () => ({ pos: [1.2, 3.1, 15.8], look: [-3.0, 6.6, -10.0], fov: 40 }) },
];
export const camAt = (f: number): Cam => run(KEYS, f);

// ---------------- lens: depth of field (template cInf table values) ----------------
export type Dof = { cInf: number; focus: V3 };
export const dofAt = (f: number): Dof => {
  const s = shotAt(f), d = dikaAt(f), k = kakekAt(f);
  switch (s) {
    case 0: return { cInf: 0, focus: [0, 1, 0] };
    case 1: return { cInf: 11, focus: [d.x, 1.0, d.z] };
    case 2: return { cInf: 12, focus: [3.0, 1.15, 2.0] };
    case 3: return { cInf: 12, focus: [3.0, 1.05, 2.0] };
    case 4: return { cInf: 15, focus: [3.0, 1.12, 2.0] };
    case 5: return { cInf: 10, focus: [(d.x + k.x) / 2, 1.1, (d.z + k.z) / 2] };
    case 6: return { cInf: 11, focus: [d.x, 1.0, d.z] };
    default: return { cInf: 3, focus: [0, 2, -2] };
  }
};
