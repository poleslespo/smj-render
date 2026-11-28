// Ep.9 REWORK camera planner (Phase 2) — the SHOTPLAN.md grammar applied to
// the full timeline. Choreography (stageAt) and timings are story9's,
// untouched; ONLY the cameras and lens change:
//  - every shot pulled back one class (28 Nov amendment bars: W = main
//    figure <= ~1/3 frame height, MW <= ~1/2, environment readable);
//  - cameras HOLD, PAN or TRACK laterally, or CUT — the creep/push-in of
//    v1 survives ONLY at the two sanctioned beats (L16-B push-in #1,
//    L18-A push-in #2); L12-A is LOCKED (designed hening);
//  - exactly ONE close-up: L17-A on Rendi's frozen face.
// Gate-still cameras (rworld.ts DEFS v3) are reused verbatim where a beat
// matches a still: S1=L1-A, S2=L3-A, S3=L6-A, S4=L7-A, S5=L11-B/L12-A,
// S6=L16-A, S7=L18-B, S10=L26-A, S1-axis=L27-B.
// S9 FIX (tasked in Phase 2): the plunge beats (L23/L24) leave the old
// south-east axis — L23-A/L24 from the west far bank, L23-B from the
// north-east far bank; measured perpendicular clearance of the bridge
// post at (0.95, z 5.85) from the camera->figure sightline is 0.66-0.89 m
// on the new axes, vs ~0.55 m (inside the silhouette) on the old one.
// Pre-flight stills (out/banaspati/qc-v2-pre/) verified the fixes.
import { LB, TOTAL, subAt, stageAt, smooth, V3, Cam, ActorState } from "./story9";

export type { Cam };

// ---------------- key machinery (story9's, cuts only) ----------------
type Key = { f: number; s: (f: number) => Cam };
const full = (c: Partial<Cam> & { pos: V3; look: V3 }): Cam => ({ fov: 42, roll: 0, ...c });
const runKeys = (keys: Key[], f: number): Cam => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    if (f < keys[i].f) break;
    cur = full(keys[i].s(f));
  }
  return cur;
};
// first frame of each (line, sub) segment, scanned from story9's own subAt
const START = new Map<string, number>();
for (let f = 0; f < TOTAL; f++) {
  const { line, sub } = subAt(f);
  const k = line + ":" + sub;
  if (!START.has(k)) START.set(k, f);
}
const S = (line: number, sub: number, s: Key["s"]): Key => ({ f: START.get(line + ":" + sub) ?? LB[line], s });

// ---------------- shot shapes ----------------
const hold = (pos: V3, look: V3, fov = 44): Key["s"] => () => ({ pos, look, fov });
/** slow lateral drift (L1-A only) */
const drift = (pos: V3, look: V3, fov: number, dx: number): Key["s"] => (f) => {
  const { u } = subAt(f);
  return { pos: [pos[0] + dx * u, pos[1], pos[2]], look, fov };
};
/** slow pan of the look target (L4-B) */
const pan = (pos: V3, lookA: V3, lookB: V3, fov = 44): Key["s"] => (f) => {
  const { u } = subAt(f); const k = smooth(u);
  return { pos, look: lookA.map((v, i) => v + (lookB[i] - v) * k) as V3, fov };
};
/** sanctioned push-in (L16-B, L18-A only) */
const push = (posA: V3, posB: V3, look: V3, fov: number, amt = 1): Key["s"] => (f) => {
  const { u } = subAt(f); const k = smooth(u) * amt;
  return { pos: posA.map((v, i) => v + (posB[i] - v) * k) as V3, look, fov };
};
/** lateral track following Rendi's z (walk/chase/return beats) */
const trackR = (dx: number, y: number, dz: number, lookDx: number, lookDy: number, lookDz: number, fov = 44): Key["s"] => (f) => {
  const rz = stageAt(f).rendi?.z ?? 0;
  return { pos: [dx, y, rz + dz], look: [lookDx, lookDy, rz + lookDz], fov };
};
/** lateral track following the fire figure's z (L21 grass beat) */
const trackF = (dx: number, y: number, dz: number, lookDx: number, lookDy: number, lookDz: number, fov = 42): Key["s"] => (f) => {
  const fz = stageAt(f).fire.figure?.pos[2] ?? 0;
  return { pos: [dx, y, fz + dz], look: [lookDx, lookDy, fz + lookDz], fov };
};
/** track the drifting fireball (L2-A) */
const trackBall = (dx: number, y: number, dz: number, fov = 44): Key["s"] => (f) => {
  const b = stageAt(f).fire.ball?.pos ?? [-0.6, 1.85, 12.2];
  return { pos: [b[0] + dx, y, b[2] + dz], look: [b[0], b[1], b[2]], fov };
};

const KEYS: Key[] = [
  // L1 hook — S1 gate camera (W, full geography) + slow lateral drift; B road-level MW
  S(0, 0, drift([2.23, 5.0, -17.3], [-0.5, 0.4, 7.8], 46, -0.9)),
  S(0, 1, hold([2.7, 1.75, -1.6], [-0.55, 1.75, 12.0], 44)),
  // L2 leaves paradox — track with the ball; B object shot on the ball + leaves
  S(1, 0, trackBall(4.2, 2.3, -5.8, 44)),
  S(1, 1, hold([2.0, 2.05, 8.9], [-0.6, 1.85, 12.0], 40)),
  // L3 Tono's scar — A = S2 gate camera (MW group over the kali); B = M on
  // Tono with Karso seated at his side (Rendi cannot share a 9:16 M frame
  // from 2.95 m away — he is established in A; disclosed in the QC report)
  S(2, 0, hold([-3.6, 2.22, 10.3], [-3.6, 1.0, -0.5], 44)),
  S(2, 1, hold([-4.55, 1.5, 4.6], [-4.35, 1.1, -0.35], 40)),
  // L4 warga theory — A W (group small in the village night); B MW slow pan
  S(3, 0, hold([-3.3, 2.7, 14.8], [-3.5, 0.85, -0.6], 46)),
  S(3, 1, pan([-3.55, 1.9, 8.6], [-5.0, 1.05, -0.3], [-2.2, 1.05, -0.2], 44)),
  // L5 Karso's warning — A MW group (all three, amendment-rated class);
  // B MW reverse from the road side
  S(4, 0, hold([-3.6, 1.7, 7.2], [-3.6, 1.0, -0.55], 44)),
  // B reverse from the north-west across the kali (the east side is
  // cursed: bridge rails + house posts slice the group — pre-flight
  // f_640/g_640); from here all three stay readable in one W row
  S(4, 1, hold([-8.2, 2.8, 7.6], [-3.6, 1.0, -0.7], 44)),
  // L6 "cari air" — A = S3 gate camera; B = W of the bridge/kali itself
  S(5, 0, hold([-6.81, 2.15, 10.03], [-3.3, 1.0, -0.5], 44)),
  S(5, 1, hold([4.1, 2.3, -4.8], [-0.1, 0.25, 5.6], 46)),
  // L7 Rendi mocks — A = S4 gate camera; B MW angled two-shot (all three
  // readable, Rendi largest)
  S(6, 0, hold([-3.48, 1.59, 9.61], [-3.55, 1.05, -0.45], 44)),
  S(6, 1, hold([-0.7, 1.5, 4.6], [-3.45, 1.05, -0.28], 46)),
  // L8 "gas rawa" — A M on Rendi (group edges); B W cutaway to the empty far path
  S(7, 0, hold([-0.9, 1.5, 3.6], [-2.6, 1.08, -0.2], 42)),
  S(7, 1, hold([2.5, 2.5, -5.2], [-0.6, 1.7, 12.2], 46)),
  // L9 next night — A W lateral track of the walk; B MW hold at the waiting spot
  S(8, 0, trackR(5.6, 2.7, 3.2, -0.2, 0.85, -0.4, 44)),
  S(8, 1, hold([3.6, 1.75, -9.6], [0.1, 1.0, -0.7], 44)),
  // L10 senter + stone — A MW (beam readable); B M low on the light pool
  S(9, 0, hold([3.1, 1.65, -6.0], [0.25, 1.0, -1.55], 44)),
  S(9, 1, hold([1.85, 0.7, -4.9], [-0.35, 0.3, -2.4], 42)),
  // L11 burnt smell — A MW (emptiness around him); B = S5 gate camera (W)
  S(10, 0, hold([3.5, 1.85, -6.4], [0.2, 1.05, -1.2], 44)),
  S(10, 1, hold([3.6, 1.7, -10.6], [-0.2, 0.95, 1.8], 44)),
  // L12 crickets stop — A = S5 gate camera LOCKED (designed hening, no
  // drift); B M listening, bridge + kali sharp behind him
  S(11, 0, hold([3.6, 1.7, -10.6], [-0.2, 0.95, 1.8], 44)),
  S(11, 1, hold([2.15, 1.5, -4.75], [0.3, 1.18, -1.5], 40)),
  // L13 ignition over the bridge — A W from behind Rendi; B MW two-shot
  S(12, 0, hold([1.55, 1.85, -9.6], [0.0, 1.5, 5.2], 44)),
  S(12, 1, hold([3.35, 1.8, -4.7], [0.1, 1.5, 4.8], 44)),
  // L14 the throw — A MW side view (action in space); B M from the bridge
  // side: the stone arcs through the ball
  S(13, 0, hold([5.3, 1.75, -1.3], [0.15, 1.1, 0.6], 44)),
  S(13, 1, hold([2.2, 1.9, 8.2], [0, 1.6, 5.2], 42)),
  // L15 it turns, then grows — A MW two-shot; B M object; C MW west axis
  S(14, 0, hold([3.45, 1.85, -3.3], [0.1, 1.6, 4.4], 44)),
  S(14, 1, hold([2.35, 2.0, 1.7], [0, 1.95, 5.2], 40)),
  S(14, 2, hold([-3.3, 1.95, -2.8], [0, 1.8, 5.0], 44)),
  // L16 grows with his fear — A = S6 gate camera (W); B PUSH-IN #1 (MW);
  // C MW west axis at tampah size
  S(15, 0, hold([2.34, 1.6, -9.24], [0, 1.6, 4.8], 42)),
  S(15, 1, push([3.2, 1.85, -5.6], [2.55, 1.7, -3.5], [0.1, 1.6, 4.6], 44)),
  S(15, 2, hold([-3.5, 2.05, -4.9], [0, 1.7, 4.8], 44)),
  // L17 the frozen whisper — A = THE episode's one close-up (ball glow
  // rims the frame beyond him); B MW frozen full body, huge ball looming
  S(16, 0, hold([1.02, 1.44, -3.05], [0.3, 1.3, -1.5], 36)),
  S(16, 1, hold([2.65, 1.65, -7.7], [0.05, 1.55, 4.6], 43)),
  // L18 REVEAL — A MW PUSH-IN #2 begins (drop + unfold in place);
  // B = S7 gate camera, the REVEAL WIDE, held; C MW west-axis hold
  S(17, 0, push([3.1, 1.85, -4.4], [2.6, 1.7, -3.1], [0, 1.5, 4.7], 44, 0.5)),
  S(17, 1, hold([1.6, 1.35, -8.6], [0, 1.5, 4.4], 44)),
  S(17, 2, hold([-3.2, 1.85, -4.6], [0, 1.45, 4.6], 44)),
  // L19 flame tongue — A MW side view from the east bank, off the bridge
  // (a deck-level placement filled the frame with planks and cut the
  // figure at the waist with the rail — pre-flight f_2470); the jet
  // lashes across open space toward the near bank. B M on Rendi's
  // recoil, figure visible beyond him
  S(18, 0, hold([7.4, 2.6, 4.4], [-0.3, 1.2, 4.6], 44)),
  S(18, 1, hold([2.35, 1.55, -6.0], [0.25, 1.2, -2.4], 40)),
  // L20 the chase — the pair separates along z, so a square lateral
  // track loses the pursuer (pre-flight f_2620), and a far lateral
  // track lands inside the east tree line (g_2620). All three beats
  // are DIAGONAL tracks from ahead of the run, where the z-gap
  // projects across the frame and both bodies stay in it
  S(19, 0, trackR(5.2, 2.6, -4.6, 0.15, 1.0, 1.6, 44)),
  S(19, 1, trackR(5.6, 2.0, -3.4, 0.15, 1.05, 1.9, 46)),
  S(19, 2, trackR(-5.6, 2.0, -3.4, 0.15, 1.05, 1.8, 50)),
  // L21 unburned grass — A MW low diagonal track (figure + grass strip
  // in the foreground, Rendi ahead in frame); B W hold as the pair passes
  S(20, 0, trackF(5.6, 1.05, -5.4, 0.45, 0.8, -1.2, 42)),
  S(20, 1, hold([4.9, 2.45, -13.8], [0.3, 0.9, -8.8], 46)),
  // L22 he remembers — A M (bridge in frame behind him); B W diagonal
  // track back toward the bridge, figure in frame behind him
  S(21, 0, hold([1.95, 1.55, -14.7], [0.25, 1.25, -9.2], 40)),
  S(21, 1, trackR(6.8, 2.4, 6.4, 0.15, 1.0, -0.2, 46)),
  // L23 the leap — A W from the WEST far bank (whole leap, post clear);
  // B MW splash from the NORTH-EAST far bank: the west placement hid
  // Rendi under the deck's south corner (pre-flight f_3230); from here
  // he sits in open water east of the deck, and the post at (0.95, 5.85)
  // clears the figure's sightline by ~0.66 m perpendicular
  S(22, 0, hold([-5.4, 2.2, 11.5], [0.3, 0.8, 4.9], 46)),
  S(22, 1, hold([4.6, 2.3, 12.6], [0.6, 0.3, 5.0], 44)),
  // L24 it shrinks at the edge — west axis, raised so Rendi in the water
  // clears the deck edge: A MW against the rails;
  // B M fist-size ball again, Rendi watching from the water
  S(23, 0, hold([-4.9, 2.3, 10.9], [0.35, 0.75, 3.9], 44)),
  S(23, 1, hold([-3.6, 1.6, 9.7], [0.35, 0.9, 3.7], 42)),
  // L25 it dies like a candle — A MW quiet frame; B W empty bridge at rest
  S(24, 0, hold([-3.9, 1.9, 10.8], [0.3, 0.9, 3.9], 44)),
  S(24, 1, hold([5.3, 2.5, -6.6], [0, 0.9, 5.4], 46)),
  // L26 gentong at dusk — A = S10 gate camera (W); B MW the pour
  S(25, 0, hold([4.63, 2.35, -4.07], [-0.2, 0.85, 0.3], 42)),
  S(25, 1, hold([3.1, 1.6, 3.3], [-0.25, 0.8, 0.3], 42)),
  // L27 warm water at dawn — A MW gentong foreground; B W dawn bookend
  // on the S1 axis
  S(26, 0, hold([2.55, 1.5, 3.15], [-0.35, 0.85, 0.05], 42)),
  S(26, 1, hold([2.23, 5.0, -17.3], [-0.5, 0.4, 7.8], 46)),
];
export const camAt2 = (f: number): Cam => runKeys(KEYS, f);

// ---------------- lens (rework values: surroundings stay readable) ----
// story9's dofAt targets, with cInf clamped to the rework band (3-6);
// only the L17 close-up gets a shallower field (9) — and even there the
// ball's glow stays present behind him.
export const dofAt2 = (f: number): { cInf: number; focus: V3 } => {
  const { line, sub } = subAt(f);
  const st = stageAt(f);
  const face = (a?: ActorState) => a ? [a.x, 1.28, a.z] as V3 : [0, 1.2, 0] as V3;
  if (line <= 1) return { cInf: 4.5, focus: st.fire.ball?.pos ?? [-0.6, 1.85, 12.2] };
  if (line === 16 && sub === 0) return { cInf: 9, focus: face(st.rendi) };
  if (line === 17) return { cInf: 4.5, focus: [0, 1.4, 4.6] };
  if (line === 25 && sub === 1) return { cInf: 5, focus: face(st.rendi) };
  if (line === 26 && sub === 0) return { cInf: 5, focus: [0.55, 0.87, 0.2] };
  if (st.fire.figure) return { cInf: 5, focus: st.fire.figure.pos };
  if (st.fire.ball) return { cInf: 4.5, focus: st.fire.ball.pos };
  return { cInf: 4.5, focus: face(st.rendi ?? st.karso ?? st.tono) };
};
