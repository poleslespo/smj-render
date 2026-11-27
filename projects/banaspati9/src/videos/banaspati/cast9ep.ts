// Ep.9 episode painters — bespoke acting poses on the template character
// system (toon.ts geometry: headBlob 118 adult, torso blob, limbV crescent
// limbs), following the cast2.ts custom-pose pattern (legs -> torso -> head
// -> arms, grip points exact). Rendi: senter front/side, stone throw, frozen.
// Karso telling uses bodyFront sit + wave from cast9/story staging instead.
import { Pen, INK, headBlob, blobPts, faceFront, faceSide, hatOn, mul, mix, limbV, SH_SKIN, SH_CLOTH, SKINS, Blob, Outfit, Expr } from "../layang/toon";
import { RENDI, SEED_RENDI } from "./cast9";

const LIGHT = (-120 * Math.PI) / 180;
const rad = (d: number) => (d * Math.PI) / 180;
type Pt = [number, number];
const hh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const lidAt9 = (t: number, i: number) => {
  const cycle = 2.6 + hh(i * 7 + 3) * 2.6;
  const ph = (t + hh(i * 13 + 1) * 7) % cycle;
  return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
};

const U = () => 2 * headBlob(SEED_RENDI, 118).a / 100;
const torsoBlob = (cx: number, cy: number, a: number, b: number, seed: number): Blob =>
  ({ a, b, nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06, rot: 0, noise: 0.006, seed });

const limb = (p: Pen, pts: Pt[], w: number, col: string) =>
  limbV(p, pts, [w, w * 0.87, w * 0.74], col, LIGHT, w * 0.16);
const footS = (p: Pen, a: Pt, b: Pt, w: number, col: string) => { if (col !== INK) p.stroke([a, b], w + 3, INK); p.stroke([a, b], w, col); };

/** planted legs (front), slight brace */
const legsFront = (p: Pen, o: Outfit, spread = 1) => {
  const u = U(), lc = mix(o.pants, INK, 0.38);
  limb(p, [[276, 642], [266, 802], [262, 958]], 15.5 * u, lc); footS(p, [262, 958], [244, 975], 9.5 * u, o.boots);
  limb(p, [[324, 642], [336, 802], [340 + 8 * spread, 958]], 15.5 * u, lc); footS(p, [340 + 8 * spread, 958], [360 + 8 * spread, 975], 9.5 * u, o.boots);
};
const torsoFront = (p: Pen, o: Outfit, seed: number, cy = 505) => {
  const u = U();
  const pts = blobPts(300, cy, torsoBlob(300, cy, 74, 112, seed * 3 + 9));
  p.gradFill(pts, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.inkRing(pts, 5 * u, 0.7);
  for (let i = 0; i < 3; i++) { const y = cy - 38 + i * 40; p.dot(302, y, 3 * u, INK); p.dot(302, y, 2.2 * u, mul(o.jacket, SH_CLOTH)); }
};
const headFront = (p: Pen, o: Outfit, seed: number, expr: Expr, lid: number, look = 0, lookY = 0, pitch = 0) => {
  const u = U(), skin = o.skin ?? SKINS[0];
  if (pitch) p.rot = [rad(pitch), 300, 400];
  const hb = headBlob(seed, 118), pts = blobPts(300, 285, hb);
  p.shadedFill(pts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(pts, 5 * u, 0.7);
  hatOn(p, o, pts, hb, 300, 285, LIGHT, seed, 0, false);
  faceFront(p, 300, 285, 2 * hb.a, expr, look, lookY, lid, false, skin, o.moustache, false, undefined, lookY);
  p.rot = null;
};

/** the senter (flashlight): dark cylinder + bright lens, held at (x,y), tilted toward aim */
export const drawSenter = (p: Pen, x: number, y: number, tiltDeg = -18) => {
  p.rot = [rad(tiltDeg), x, y];
  p.poly([[x - 13, y - 34], [x + 13, y - 34], [x + 10, y + 26], [x - 10, y + 26]], "#20242c", 3);
  p.ell(x, y - 36, 14, 7, "#ffe9a8", 2.5);
  p.ell(x, y - 36, 8, 4, "#fff7d0", 0);
  p.rot = null;
};

/** Rendi front, senter raised in his near (screen-right) hand, beam up-forward.
 *  Grip/senter centre = [428,452]; the 3D cone anchors there. */
export const rendiSenterFront = (p: Pen, expr: Expr, lid: number) => {
  const o = RENDI, u = U(), skin = o.skin ?? SKINS[0];
  legsFront(p, o);
  limb(p, [[248, 430], [216, 548], [196, 668]], 13.5 * u, mix(o.jacket, INK, 0.5)); // far arm hangs
  p.dot(196, 672, 7 * u, INK); p.dot(196, 672, 5.6 * u, mul(skin, SH_SKIN));
  torsoFront(p, o, SEED_RENDI);
  headFront(p, o, SEED_RENDI, expr, lid, 0.25, -0.35);
  limb(p, [[352, 428], [398, 420], [424, 452]], 13.5 * u, o.jacket); // near arm up-forward
  drawSenter(p, 428, 452, -24);
  p.dot(424, 470, 7 * u, INK); p.dot(424, 470, 5.6 * u, mul(skin, SH_SKIN)); // hand under the senter body
};

/** Rendi front FROZEN (L17): arms half-raised, trembling handled by the world
 *  (card jitter); wide shock face, pupils up toward the fire. */
export const rendiFrozen = (p: Pen, lid: number) => {
  const o = RENDI, u = U(), skin = o.skin ?? SKINS[0];
  legsFront(p, o, 1.25);
  torsoFront(p, o, SEED_RENDI);
  limb(p, [[248, 430], [206, 500], [188, 596]], 13.5 * u, mix(o.jacket, INK, 0.5));
  p.dot(188, 600, 7 * u, INK); p.dot(188, 600, 5.6 * u, mul(skin, SH_SKIN));
  limb(p, [[352, 428], [398, 492], [416, 588]], 13.5 * u, o.jacket);
  p.dot(416, 592, 7 * u, INK); p.dot(416, 592, 5.6 * u, mul(skin, SH_SKIN));
  headFront(p, o, SEED_RENDI, "shock", lid, 0.1, -0.55);
};

/** Rendi profile (faces +x after world mirror), stone throw.
 *  ph: 0 = windup (arm back, stone in hand), 0.5 = release point, 1 = follow-through.
 *  Hand/stone point reported by throwHand(ph). */
export const throwHand = (ph: number): Pt => {
  const key: [number, Pt][] = [[0, [196, 330]], [0.35, [238, 296]], [0.55, [392, 330]], [0.75, [452, 428]], [1, [430, 520]]];
  for (let i = 1; i < key.length; i++) {
    if (ph <= key[i][0]) {
      const [t0, a] = key[i - 1], [t1, b] = key[i], u = (ph - t0) / (t1 - t0);
      const s = u * u * (3 - 2 * u);
      return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
    }
  }
  return key[key.length - 1][1];
};
export const rendiThrowSide = (p: Pen, expr: Expr, lid: number, ph: number, withStone: boolean) => {
  const o = RENDI, u = U(), skin = o.skin ?? SKINS[0], lc = mix(o.pants, INK, 0.38);
  // profile legs: braced, front leg forward
  limb(p, [[292, 648], [268, 812], [252, 960]], 15.5 * u, lc); footS(p, [252, 960], [234, 975], 9.5 * u, o.boots);
  limb(p, [[308, 648], [352, 806], [392, 958]], 15.5 * u, lc); footS(p, [392, 958], [414, 975], 9.5 * u, o.boots);
  // far arm swings low for balance
  limb(p, [[312, 448], [286, 560], [262, 668]], 13.5 * u, mix(o.jacket, INK, 0.55));
  p.dot(262, 672, 6.8 * u, INK); p.dot(262, 672, 5.4 * u, mul(skin, SH_SKIN));
  // torso (profile blob, offset like bodySide)
  const tp = blobPts(306, 520, torsoBlob(306, 520, 70, 108, SEED_RENDI * 3 + 9));
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.inkRing(tp, 5 * u, 0.7);
  // head profile, pitched toward the target
  p.rot = [rad(-6), 310, 402];
  const hb = headBlob(SEED_RENDI, 118, 1), H: Blob = { ...hb, asym: 0.12 };
  const hp = blobPts(310, 300, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), LIGHT, H.a);
  p.inkRing(hp, 5 * u, 0.7);
  hatOn(p, o, hp, H, 310, 300, LIGHT, SEED_RENDI, 1, true);
  faceSide(p, 310, 300, 2 * H.a, expr, lid, false, skin, undefined, false, undefined, -0.2);
  p.rot = null;
  // throwing arm through the keyframed hand point
  const hd = throwHand(ph);
  const el: Pt = [316 + (hd[0] - 316) * 0.45, 446 + (hd[1] - 446) * 0.45 + 26];
  limb(p, [[316, 446], el, hd], 13.5 * u, o.jacket);
  p.dot(hd[0], hd[1], 7 * u, INK); p.dot(hd[0], hd[1], 5.6 * u, mul(skin, SH_SKIN));
  if (withStone) { p.ell(hd[0] + 8, hd[1] - 8, 13, 11, "#4c4a48", 2.5); p.ell(hd[0] + 4, hd[1] - 12, 5, 4, "#6e6a66", 0); }
};
