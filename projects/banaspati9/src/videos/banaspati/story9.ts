// Ep.9 story planner — U1 sub-shot grammar over the approved 27-line script.
// Every narration line gets 2 sub-shots (climax lines 3), cuts at phrase
// boundaries, framing never repeats consecutively, the camera shoots what the
// narration names. Timings come from timing9.ts (generated from the measured
// narration timeline). Set geography (from nworld.ts): road along Z on the
// near bank (z<3), kali z 3..7.4 (water y -0.5), bamboo bridge x=0 crossing
// z 1.2..9.2, house front wall z=-2.2 (porch x -5..-2, z -0.7), gentong at
// (0.55, 0, 0.2), far-bank bamboo at z 12+.
import { LB, LE, TOTAL, HOLD } from "./timing9";

export const FPS = 30;
export { TOTAL };
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const deckY = (z: number) => 0.55 + 0.25 * Math.sin(((z - 1.2) / 8) * Math.PI);

export const lineAt = (f: number) => { let s = 0; for (let i = 0; i < 27; i++) if (f >= LB[i]) s = i; return s; };
export const lineU = (f: number) => { const i = lineAt(f); return clamp01((f - LB[i]) / Math.max(1, LE[i] - LB[i])); };
/** ambient-motion gate: 1 normally, near 0 across L12 and the pre-reveal HOLD */
export const swayAt = (f: number) => {
  const i = lineAt(f);
  if (f >= HOLD[0] && f < HOLD[1]) return 0.05;
  if (i === 11) return 1 - 0.88 * smooth(lineU(f));
  if (i === 12) return 0.12;
  return 1;
};
const AMBT9: number[] = (() => { const out = [0]; for (let f = 1; f <= TOTAL + 1; f++) out.push(out[f - 1] + swayAt(f - 1) / FPS); return out; })();
export const ambT9 = (f: number) => AMBT9[Math.max(0, Math.min(TOTAL, Math.floor(f)))];

// ---------------- sub-shots ----------------
// fracs: cut points inside each line (2 sub-shots default; L15/L16/L18/L20 get 3)
const FRACS: Record<number, number[]> = {
  14: [0.42, 0.72], 15: [0.4, 0.7], 17: [0.38, 0.68], 19: [0.45, 0.75],
};
export const subAt = (f: number): { line: number; sub: number; u: number } => {
  const i = lineAt(f), u = lineU(f);
  const fr = FRACS[i] ?? [0.55];
  let sub = 0; for (const c of fr) if (u >= c) sub++;
  const bounds = [0, ...fr, 1];
  return { line: i, sub, u: (u - bounds[sub]) / (bounds[sub + 1] - bounds[sub]) };
};

// ---------------- shared anchors ----------------
export const PORCH = { karso: { x: -3.6, z: -0.7 }, rendi: { x: -2.1, z: -0.15 }, tono: { x: -5.05, z: -0.3 } };
export const WAIT = { x: 0.3, z: -1.5 };            // Rendi's waiting spot on the road
export const FB_FAR: V3 = [-0.6, 1.85, 12.2];       // fireball over the far path (L1-2)
export const FB_BRIDGE: V3 = [0, 1.95, 5.2];        // fireball over the bridge (L13-17)
export const FIG_Z = 4.6;                            // figure stands on the deck here
export const WATER_POS = { x: 1.55, y: -1.12, z: 5.15 }; // Rendi in the kali

export type PoseId =
  | "stand" | "strollF" | "marchS" | "sit" | "bust" | "back"
  | "senterF" | "senterS" | "throwS" | "frozen" | "water" | "fill";
export type ActorState = { x: number; y: number; z: number; pose: PoseId; expr: string; mirror: boolean; scale: number; phase: number; ph?: number };
export type FireState = { ball?: { pos: V3; size: number; face: number; spin: number }; figure?: { pos: V3; side: boolean; scale: number; jet: number; ph?: number } };
/** metres of ground travel per march-cycle at stride 1.05 (bodySide model:
 *  2 steps x 0.8 m x 1.05). Locomotion phases are DISTANCE-driven so the
 *  planted foot is stationary in world space — a time-driven phase at any
 *  other rate makes the feet slide and the run reads as backwards. */
export const CYCLE_M = 1.68;
export type Stage = {
  phase: "night" | "dusk" | "dawn"; sway: number;
  rendi?: ActorState; karso?: ActorState; tono?: ActorState;
  fire: FireState; stone?: V3; senter: boolean; lamp: boolean;
};

const A = (x: number, z: number, pose: PoseId, expr: string, extra: Partial<ActorState> = {}): ActorState =>
  ({ x, y: 0, z, pose, expr, mirror: false, scale: 1, phase: 0, ...extra });

// ---------------- choreography ----------------
export const stageAt = (f: number): Stage => {
  const i = lineAt(f), u = lineU(f), t = f / FPS;
  const st: Stage = { phase: "night", sway: swayAt(f), fire: {}, senter: false, lamp: false };

  switch (i) {
    case 0: // L1 hook: the fireball over the far path
      st.fire.ball = { pos: [FB_FAR[0] + Math.sin(t * 0.7) * 0.15, FB_FAR[1] + Math.sin(t * 1.3) * 0.08, FB_FAR[2]], size: 0.34, face: 0, spin: t * 0.4 };
      break;
    case 1: // L2: it drifts past leaves, nothing burns
      st.fire.ball = { pos: [FB_FAR[0] + Math.sin(t * 0.5) * 0.3, FB_FAR[1] + Math.cos(t * 0.9) * 0.1, FB_FAR[2] - u * 0.8], size: 0.36, face: 0, spin: t * 0.5 };
      break;
    case 2: // L3: Tono and his burn
      st.lamp = true;
      st.tono = A(PORCH.tono.x, PORCH.tono.z, "stand", "stern");
      st.karso = A(PORCH.karso.x, PORCH.karso.z, "sit", "neutral");
      st.rendi = A(PORCH.rendi.x, PORCH.rendi.z, "stand", "neutral");
      if (subAt(f).sub === 1) st.tono = A(PORCH.tono.x, PORCH.tono.z, "bust", "stern", { scale: 1.5 });
      break;
    case 3: // L4: the warga theory at the porch
      st.lamp = true;
      st.karso = A(PORCH.karso.x, PORCH.karso.z, "sit", "stern");
      st.rendi = A(PORCH.rendi.x, PORCH.rendi.z, "stand", "neutral");
      st.tono = A(PORCH.tono.x, PORCH.tono.z, "stand", "neutral");
      break;
    case 4: // L5: Karso's warning (his quoted line)
      st.lamp = true;
      st.karso = A(PORCH.karso.x, PORCH.karso.z, subAt(f).sub === 0 ? "bust" : "sit", "stern", { scale: subAt(f).sub === 0 ? 1.5 : 1 });
      st.rendi = A(PORCH.rendi.x, PORCH.rendi.z, "stand", "nervous");
      st.tono = A(PORCH.tono.x, PORCH.tono.z, "stand", "nervous");
      break;
    case 5: // L6: "kalau dikejar, cari air" — Karso gestures, then the kali itself
      st.lamp = true;
      st.karso = A(PORCH.karso.x, PORCH.karso.z, "sit", "stern");
      st.rendi = A(PORCH.rendi.x, PORCH.rendi.z, "stand", "neutral");
      break;
    case 6: // L7: Rendi laughs it off
      st.lamp = true;
      st.rendi = A(PORCH.rendi.x, PORCH.rendi.z, subAt(f).sub === 1 ? "bust" : "stand", subAt(f).sub === 1 ? "laugh" : "laugh", { scale: subAt(f).sub === 1 ? 1.5 : 1 });
      st.karso = A(PORCH.karso.x, PORCH.karso.z, "sit", "stern");
      st.tono = A(PORCH.tono.x, PORCH.tono.z, "stand", "nervous");
      break;
    case 7: // L8: "Itu gas rawa..."
      st.lamp = true;
      st.rendi = A(PORCH.rendi.x, PORCH.rendi.z, "stand", u < 0.5 ? "stern" : "grin");
      st.karso = A(PORCH.karso.x, PORCH.karso.z, "sit", "neutral");
      break;
    case 8: { // L9: next night — Rendi walks the road and waits
      // walk spans sub0 + the head of sub1 (arrives u=0.75); phase is
      // distance-driven: path = sqrt(2.9^2 + 5^2) = 5.78 m
      const wu = glide(clamp01(u / 0.75));
      if (wu < 1) {
        const x = lerp(-2.6, WAIT.x, wu), z = lerp(-6.5, WAIT.z, wu);
        st.rendi = A(x, z, "marchS", "stern", { phase: wu * (5.78 / CYCLE_M), mirror: false });
      } else st.rendi = A(WAIT.x, WAIT.z, "stand", "stern");
      break;
    }
    case 9: // L10: senter + stone, showing off
      st.rendi = A(WAIT.x, WAIT.z, "senterF", "grin");
      st.senter = true;
      break;
    case 10: // L11: the burnt smell from nowhere
      st.rendi = A(WAIT.x, WAIT.z, subAt(f).sub === 1 ? "bust" : "stand", "nervous", { scale: subAt(f).sub === 1 ? 1.5 : 1 });
      break;
    case 11: // L12: the crickets stop — Rendi listens, world stills
      st.rendi = A(WAIT.x, WAIT.z, subAt(f).sub === 1 ? "bust" : "stand", "dazed", { scale: subAt(f).sub === 1 ? 1.55 : 1 });
      break;
    case 12: { // L13: the fireball ignites over the bridge
      const ignite = smooth((u - 0.08) / 0.25);
      st.fire.ball = { pos: FB_BRIDGE, size: 0.36 * ignite, face: 0, spin: t * 0.6 };
      st.rendi = A(WAIT.x, WAIT.z, subAt(f).sub === 1 ? "back" : "stand", "nervous");
      break;
    }
    case 13: { // L14: the throw — windup, release at u .55, stone through the fire
      const sub = subAt(f).sub;
      st.fire.ball = { pos: FB_BRIDGE, size: 0.37, face: 0, spin: t * 0.6 };
      if (sub === 0) {
        st.rendi = A(WAIT.x, WAIT.z, "throwS", "stern", { ph: Math.min(1, u / 0.55 * 0.55) });
        if (u >= 0.5) { const su = (u - 0.5) / 0.5; st.stone = [WAIT.x + 0.5 + su * 0.1, 1.6 + Math.sin(su * Math.PI) * 0.75 - su * su * 0.4, WAIT.z + su * 3.4]; }
      } else {
        st.rendi = A(WAIT.x, WAIT.z, "throwS", "stern", { ph: 0.55 + Math.min(0.45, u * 0.45) });
        const su = clamp01(u * 1.15);
        st.stone = [0.1 + su * 0.25, Math.max(0.06, 1.35 - su * su * 1.3), 5.4 + su * 3.4];
        if (u > 0.85) st.stone = [0.35, 0.06, 8.8];
      }
      break;
    }
    case 14: // L15: it spins, then grows
      st.fire.ball = { pos: FB_BRIDGE, size: lerp(0.37, 0.62, smooth((u - 0.45) / 0.5)), face: 0, spin: t * (1.2 + u * 2.2) };
      st.rendi = A(WAIT.x, WAIT.z, "stand", "nervous");
      break;
    case 15: // L16: it grows with his trembling — baskom, then tampah
      st.fire.ball = { pos: FB_BRIDGE, size: lerp(0.62, 1.18, smooth(u)), face: 0.35 * u, spin: t * 2.6 };
      st.rendi = A(WAIT.x, WAIT.z, subAt(f).sub === 0 ? "bust" : "frozen", "shock", { scale: subAt(f).sub === 0 ? 1.55 : 1 });
      break;
    case 16: // L17: the frozen whisper
      st.fire.ball = { pos: FB_BRIDGE, size: 1.2, face: 0.4, spin: t * 2.2 };
      st.rendi = A(WAIT.x, WAIT.z, "frozen", "shock");
      break;
    case 17: { // L18: REVEAL — it drops and unfolds into the inverted figure
      const drop = smooth(u / 0.3);
      if (u < 0.3) st.fire.ball = { pos: [FB_BRIDGE[0], lerp(FB_BRIDGE[1], deckY(FIG_Z) + 1.05, drop), FB_BRIDGE[2]], size: lerp(1.2, 0.9, drop), face: 0.4, spin: t * 3 };
      else st.fire.figure = { pos: [0, deckY(FIG_Z) + 0.01, FIG_Z], side: false, scale: lerp(0.82, 1.0, smooth((u - 0.3) / 0.25)), jet: 0 };
      st.rendi = A(WAIT.x, WAIT.z, "frozen", "shock");
      break;
    }
    case 18: { // L19: the flame tongue lashes toward Rendi
      const lash = u < 0.4 ? smooth(u / 0.4) : u < 0.7 ? 1 : 1 - smooth((u - 0.7) / 0.3) * 0.6;
      st.fire.figure = { pos: [0, deckY(FIG_Z) + 0.01, FIG_Z], side: true, scale: 1, jet: lash };
      const back = subAt(f).sub === 1 ? smooth((u - 0.55) / 0.45) * 0.3 : 0;
      st.rendi = A(WAIT.x, WAIT.z - back, "frozen", "shock");
      break;
    }
    case 19: { // L20: the chase down the road (toward -z)
      const run = (off: number) => lerp(0.5, -8.6, clamp01(u * 1.06 - off));
      const rz = run(0), fz = run(0.16);
      st.rendi = A(0.25, rz, "marchS", "shock", { phase: (0.5 - rz) / CYCLE_M, mirror: true });
      if (fz > -8.4) st.fire.figure = { pos: [0.05, 0, fz + 2.6], side: true, scale: 0.98, jet: 0.25, ph: (0.5 - fz) / CYCLE_M };
      break;
    }
    case 20: // L21: the grass it passes does not burn
      st.rendi = A(0.25, lerp(-8.6, -11.5, u), "marchS", "shock", { phase: (2.9 * u) / CYCLE_M, mirror: true });
      st.fire.figure = { pos: [0.9, 0, lerp(-6.2, -9.2, u)], side: true, scale: 0.98, jet: 0.2, ph: (3.0 * u) / CYCLE_M };
      break;
    case 21: { // L22: he remembers — stops, turns, runs back toward the bridge
      if (subAt(f).sub === 0) st.rendi = A(0.25, -11.5, "bust", u < 0.45 ? "dazed" : "stern", { scale: 1.55 });
      else {
        const rz = lerp(-11.5, -2.2, glide(u));
        const ph = (9.3 * (glide(u) - glide(0.55))) / CYCLE_M;
        st.rendi = A(0.25, rz, "marchS", "stern", { phase: ph, mirror: false });
        st.fire.figure = { pos: [0.4, 0, rz - 3.4], side: true, scale: 0.98, jet: 0.2, ph };
      }
      break;
    }
    case 22: { // L23: he leaps from the bridge into the kali
      if (subAt(f).sub === 0) {
        const lu = smooth(u);
        const x = lerp(0, WATER_POS.x, lu), z = lerp(3.4, WATER_POS.z, lu);
        const y = lerp(deckY(3.4), WATER_POS.y, lu) + Math.sin(lu * Math.PI) * 0.85;
        st.rendi = A(x, z, "frozen", "shock", { y });
      } else st.rendi = A(WATER_POS.x, WATER_POS.z, "water", "shock", { y: WATER_POS.y });
      st.fire.figure = { pos: [0, deckY(5.6) + 0.01, 5.6], side: false, scale: 1, jet: 0 };
      break;
    }
    case 23: // L24: stopped at the edge, it shrinks back to a fist
      st.rendi = A(WATER_POS.x, WATER_POS.z, "water", "nervous", { y: WATER_POS.y });
      if (u < 0.55) st.fire.figure = { pos: [0, deckY(3.4) + 0.01, 3.4], side: false, scale: lerp(1, 0.55, smooth(u / 0.55)), jet: 0 };
      else st.fire.ball = { pos: [0, deckY(3.4) + 1.15, 3.4], size: lerp(0.5, 0.36, smooth((u - 0.55) / 0.45)), face: 0, spin: t * 1.2 };
      break;
    case 24: { // L25: it dies like a blown candle
      const out = 1 - smooth((u - 0.35) / 0.45);
      if (out > 0.02) st.fire.ball = { pos: [0, deckY(3.4) + 1.15 + (1 - out) * 0.1, 3.4], size: 0.36 * out, face: 0, spin: t };
      st.rendi = A(WATER_POS.x, WATER_POS.z, "water", "relief", { y: WATER_POS.y });
      break;
    }
    case 25: // L26: every dusk he fills the gentong
      st.phase = "dusk";
      st.rendi = A(-0.55, 0.55, "fill", "neutral", { ph: u });
      break;
    case 26: // L27: every morning the water is warm, smelling of burnt
      st.phase = "dawn";
      st.rendi = A(-0.95, 0.35, "stand", "relief");
      break;
  }
  return st;
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Partial<Cam> & { pos: V3; look: V3 } };
const full = (c: Partial<Cam> & { pos: V3; look: V3 }): Cam => ({ fov: 42, roll: 0, ...c });
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3,
  look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const runKeys = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixC(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
// one key per sub-shot, built from the line timings; cam functions are static
// poses with a built-in creep (evaluated per frame via the u of the sub-shot)
const creep = (pos: V3, look: V3, fov: number, amt = 0.16): Key["s"] => (f) => {
  const { u } = subAt(f); const k = 1 - amt * u;
  return { pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, fov };
};
const S = (line: number, sub: number, s: Key["s"]): Key => {
  const fr = FRACS[line] ?? [0.55]; const bounds = [0, ...fr, 1];
  const start = Math.round(LB[line] + bounds[sub] * (LE[line] - LB[line]));
  return { f: start, cut: true, s };
};
const KEYS: Key[] = [
  S(0, 0, creep([3.4, 2.3, -7.6], [0, 1.5, 7], 44, 0.1)),
  S(0, 1, creep([1.7, 1.8, 2.5], [-0.4, 1.8, 11.5], 38)),
  S(1, 0, creep([2.3, 2.1, 8.6], [-0.6, 1.85, 12.2], 40)),
  S(1, 1, creep([0.9, 2.05, 10.4], [-0.6, 1.85, 12.2], 33)),
  S(2, 0, creep([-4.4, 1.55, 2.7], [-5.0, 1.05, -0.3], 40)),
  S(2, 1, creep([-4.9, 1.55, 4.3], [-5.05, 1.22, -0.3], 34)),
  S(3, 0, creep([-3.3, 1.85, 3.6], [-3.6, 1.0, -0.6], 46)),
  S(3, 1, creep([-1.9, 1.6, 3.0], [-3.4, 1.05, -0.5], 42)),
  S(4, 0, creep([-3.5, 1.5, 2.9], [-3.6, 1.3, -0.7], 32)),
  S(4, 1, creep([-2.9, 1.55, 2.4], [-3.5, 1.05, -0.45], 40)),
  S(5, 0, creep([-2.5, 1.55, 2.5], [-3.6, 1.05, -0.7], 40)),
  S(5, 1, creep([3.3, 1.15, 0.2], [0, 0.1, 5.4], 42)),
  S(6, 0, creep([-3.1, 1.6, 3.0], [-3.3, 1.05, -0.4], 44)),
  S(6, 1, creep([-2.0, 1.5, 3.45], [-2.1, 1.3, -0.15], 32)),
  S(7, 0, creep([-1.2, 1.5, 2.2], [-2.1, 1.1, -0.15], 40)),
  S(7, 1, creep([1.9, 1.65, -3.6], [0, 1.3, 4.5], 44)),
  S(8, 0, (f) => { const st = stageAt(f); const rz = st.rendi?.z ?? -4; return { pos: [3.0, 1.55, rz + 0.6], look: [0, 1.0, rz], fov: 42 }; }),
  S(8, 1, creep([0.5, 1.5, -5.6], [0.3, 1.1, -1.4], 40)),
  S(9, 0, creep([0.65, 1.45, -4.7], [0.3, 1.1, -1.5], 38)),
  S(9, 1, creep([2.5, 1.05, -3.5], [0.0, 0.25, -0.4], 40)),
  S(10, 0, creep([2.0, 1.5, -4.3], [0.3, 1.2, -1.5], 40)),
  S(10, 1, creep([0.5, 1.5, 2.1], [0.3, 1.3, -1.5], 32)),
  S(11, 0, creep([3.7, 2.05, -6.6], [0, 1.2, 2], 46, 0.08)),
  S(11, 1, creep([0.55, 1.5, 2.0], [0.3, 1.3, -1.5], 30, 0.22)),
  S(12, 0, creep([2.7, 1.85, -3.1], [0, 1.6, 5.2], 44)),
  S(12, 1, creep([1.75, 1.95, 1.1], [0, 1.95, 5.2], 36)),
  S(13, 0, creep([3.2, 1.5, -1.1], [0.3, 1.15, -1.5], 40)),
  S(13, 1, creep([1.7, 1.3, 3.2], [0.2, 0.6, 7.2], 40)),
  S(14, 0, creep([1.6, 2.05, 2.7], [0, 1.95, 5.2], 34)),
  S(14, 1, creep([2.5, 1.85, -0.6], [0, 1.75, 5.0], 42)),
  S(14, 2, creep([2.6, 1.9, -1.2], [0, 1.8, 5.2], 44)),
  S(15, 0, creep([0.5, 1.5, 2.1], [0.3, 1.3, -1.5], 30, 0.2)),
  S(15, 1, creep([1.9, 1.6, -2.2], [0.1, 1.5, 3.4], 38)),
  S(15, 2, creep([3.9, 2.5, -4.6], [0, 1.9, 5.2], 46)),
  S(16, 0, creep([1.2, 1.42, -4.0], [0.3, 1.15, -1.5], 32, 0.26)),
  S(16, 1, creep([1.35, 1.45, -4.3], [0.3, 1.18, -1.5], 30, 0.3)),
  S(17, 0, creep([2.0, 0.85, 0.4], [0, 1.5, 4.6], 40, 0.12)),
  S(17, 1, creep([2.3, 1.15, 0.5], [0, 1.3, 4.6], 36)),
  S(17, 2, creep([2.0, 1.25, 0.8], [0, 1.3, 4.5], 36)),
  S(18, 0, creep([3.9, 2.4, 2.0], [0, 1.25, 4.5], 42)),
  S(18, 1, creep([1.9, 1.5, -4.3], [0.3, 1.15, -1.9], 38)),
  S(19, 0, (f) => { const st = stageAt(f); const rz = st.rendi?.z ?? -4; return { pos: [3.1, 1.5, rz + 1.6], look: [0.2, 1.0, rz], fov: 42 }; }),
  S(19, 1, creep([4.3, 2.05, -7.6], [0, 1.1, -1.5], 46, 0.1)),
  S(19, 2, (f) => { const st = stageAt(f); const rz = st.rendi?.z ?? -8; return { pos: [2.7, 1.45, rz + 1.2], look: [0.25, 1.05, rz], fov: 36 }; }),
  S(20, 0, creep([2.0, 0.6, -3.6], [0.7, 0.7, -7.3], 40)),
  S(20, 1, (f) => { const st = stageAt(f); const rz = st.rendi?.z ?? -10; return { pos: [2.6, 1.4, rz + 1.0], look: [0.25, 1.05, rz], fov: 38 }; }),
  S(21, 0, creep([0.45, 1.5, -7.9], [0.25, 1.3, -11.5], 32, 0.18)),
  S(21, 1, creep([3.7, 1.95, -7.0], [0, 1.1, -0.6], 46, 0.1)),
  S(22, 0, creep([3.6, 1.7, 7.4], [0.75, 0.55, 4.3], 44)),
  S(22, 1, creep([3.1, 1.25, 7.7], [1.55, 0.1, 5.15], 40)),
  S(23, 0, creep([3.55, 1.25, 10.3], [0.1, 0.8, 3.5], 44, 0.08)),
  S(23, 1, creep([3.3, 1.2, 9.6], [0.4, 0.75, 3.8], 42, 0.08)),
  S(24, 0, creep([2.9, 1.85, 10.9], [0, 1.0, 4.2], 46, 0.08)),
  S(24, 1, creep([2.7, 1.7, 10.2], [0.3, 0.9, 4.4], 44, 0.08)),
  S(25, 0, creep([2.9, 1.6, 3.0], [-0.2, 0.8, 0.3], 42)),
  S(25, 1, creep([2.7, 1.5, 2.7], [-0.1, 0.75, 0.3], 42)),
  S(26, 0, creep([2.6, 1.6, 3.4], [-0.5, 0.85, -0.1], 42)),
  S(26, 1, creep([1.5, 1.35, 1.5], [0.55, 0.84, 0.2], 32)),
];
export const camAt = (f: number): Cam => runKeys(KEYS, f);

// ---------------- lens ----------------
export const dofAt = (f: number): { cInf: number; focus: V3 } => {
  const { line, sub } = subAt(f);
  const st = stageAt(f);
  const face = (a?: ActorState) => a ? [a.x, 1.28, a.z] as V3 : [0, 1.2, 0] as V3;
  if (line <= 1) return { cInf: 6, focus: st.fire.ball?.pos ?? FB_FAR };
  if (line === 2) return { cInf: sub ? 14 : 10, focus: face(st.tono) };
  if (line === 4 && sub === 0) return { cInf: 14, focus: face(st.karso) };
  if (line === 6 && sub === 1) return { cInf: 14, focus: face(st.rendi) };
  if (line === 10 && sub === 1) return { cInf: 14, focus: face(st.rendi) };
  if (line === 11) return { cInf: sub ? 15 : 5, focus: face(st.rendi) };
  if (line === 15 && sub === 0) return { cInf: 15, focus: face(st.rendi) };
  if (line === 16) return { cInf: 13, focus: face(st.rendi) };
  if (line === 17) return { cInf: sub === 1 ? 12 : 6, focus: [0, 1.4, FIG_Z] };
  if (line === 18 && sub === 1) return { cInf: 12, focus: face(st.rendi) };
  if (line === 21 && sub === 0) return { cInf: 14, focus: face(st.rendi) };
  if (line === 26 && sub === 1) return { cInf: 12, focus: [0.55, 0.87, 0.2] };
  if (st.fire.figure) return { cInf: 7, focus: st.fire.figure.pos };
  if (st.fire.ball) return { cInf: 6, focus: st.fire.ball.pos };
  return { cInf: 8, focus: face(st.rendi ?? st.karso) };
};
