// Cast + custom acting poses for the Layang short. Built on the template's
// character system (cards Pool/Actor, toon Pen + bodyFront/bodySide) with our
// own face painters (template FACE geometry, wider mouth/eye set) and bespoke
// poses the narration needs: lookUp, frontPull/frontShock, CU bust, holdSide,
// kakekTeach. The spool is drawn INTO the acting hand; the Cast reports the
// spool's exact design point each frame so the 3D string can anchor to it.
import * as THREE from "three";
import { Pool, Actor, Fx, SU } from "./cards";
import { Pen, INK, headBlob, blobPts, bodyFront, bodySide, faceFront, faceSide, hatOn, mul, SH_SKIN, SH_CLOTH, SKINS, KID, townsfolk, mix, shade, fxContact, Blob, Outfit, Expr, limbV } from "./toon";
import { dikaAt, kakekAt, dikaExpr, kakekExpr, cuLook, shotAt, ambT, FPS } from "./story";

const LIGHT = (-120 * Math.PI) / 180;
const rad = (d: number) => (d * Math.PI) / 180;
type Pt = [number, number];
const curve = (a: Pt, k: Pt, b: Pt, n = 10): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * k[0] + t * t * b[0], u * u * a[1] + 2 * u * t * k[1] + t * t * b[1]]); }
  return out;
};
const hh2 = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
/** blink lid 0..1 (template lidAt pattern) */
export const lidAt = (t: number, i: number) => {
  const cycle = 2.6 + hh2(i * 7 + 3) * 2.6;
  const ph = (t + hh2(i * 13 + 1) * 7) % cycle;
  return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
};

export const DIKA: Outfit = { ...KID };
export const KAKEK: Outfit = { jacket: "#5d7a3a", pants: "#4a3b2c", boots: "#3a2c20", hat: "peci", hair: "#d8dde2", moustache: "#d8dde2", skin: SKINS[1], build: "adult" };
const WOMAN: Outfit = townsfolk(1);
const MAN: Outfit = townsfolk(0);
const KID2: Outfit = { ...KID, jacket: "#2f8f83", hat: "hair", hair: "#2a1c14", skin: SKINS[3], pants: "#7a4a2b", boots: "#3a2c20" };

// ---------------- faces: the template's own painters (toon.ts faceFront / faceSide) ----------------
// v2's local face painters (tiny dot eyes, thin brows, front nose tick, blush) are gone:
// every custom pose now draws its face with the template system, same as bodyFront/bodySide,
// so the acting poses and the template poses share one face language.

// ---------------- shared limbs ----------------
// crescent-taper limbs (toon.limbV): w = width at the body end; the helper tapers
// w -> 0.87w at the joint -> 0.74w at the wrist/ankle and paints the shade crescent.
// The joint used is the drawn curve's own midpoint, so endpoints (hands, feet, spool
// grips) land exactly where the old single-stroke version put them.
const limb = (p: Pen, a: Pt, k: Pt, b: Pt, w: number, col: string) => {
  const mid = curve(a, k, b, 10)[5];
  limbV(p, [a, mid, b], [w, w * 0.87, w * 0.74], col, LIGHT, w * 0.16);
};
const footS = (p: Pen, a: Pt, b: Pt, w: number, col: string) => { if (col !== INK) p.stroke([a, b], w + 3, INK); p.stroke([a, b], w, col); };
const torsoBlob = (cx: number, cy: number, a: number, b: number, seed: number): Blob =>
  ({ a, b, nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06, rot: 0, noise: 0.006, seed });
function torso(p: Pen, jacket: string, seed: number, cx: number, cy: number, a: number, b: number, hu: number) {
  const pts = blobPts(cx, cy, torsoBlob(cx, cy, a, b, seed * 3 + 9));
  p.gradFill(pts, jacket, mul(jacket, SH_CLOTH), LIGHT);
  p.inkRing(pts, 5 * (a / 50), 0.7);
  // shirt buttons, same construction as bodyFront's (ink under-dot + shaded button)
  for (let i = 0; i < 3; i++) {
    const y = cy - 0.35 * b + i * 0.37 * b;
    p.dot(cx + 2, y, 3 * hu, INK); p.dot(cx + 2, y, 2.2 * hu, shade(jacket, 0.7));
  }
}

/** the kite-string spool (gelendong), drawn into the acting hand */
export function drawSpool(p: Pen, cx: number, cy: number, r: number) {
  p.ell(cx, cy, r, r * 0.94, "#a05a34", r * 0.13);
  p.ell(cx, cy, r * 0.7, r * 0.64, "#e9e2cf", 0);
  for (const rr of [0.52, 0.4, 0.28]) p.ell(cx, cy, r * rr, r * rr * 0.92, null, r * 0.07);
  p.ell(cx, cy, r * 0.97, r * 0.91, null, r * 0.15);
  p.ell(cx, cy, r * 0.17, r * 0.17, "#7c4526", 0);
}

// ---------------- Dika custom poses ----------------
const DK_W = () => 2 * headBlob(5, 112).a;
function dikaHead(p: Pen, o: Outfit, cx: number, cy: number, pitchDeg: number, pivotY: number, exprName: string, lid: number, lx: number, ly: number) {
  p.rot = [rad(pitchDeg), cx, pivotY];
  const hb = headBlob(5, 112), pts = blobPts(cx, cy, hb), skin = o.skin ?? "#f7cfa5";
  p.shadedFill(pts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(pts, 5 * (2 * hb.a / 100), 0.7);
  hatOn(p, o, pts, hb, cx, cy, LIGHT, 5, 1, true);
  faceSide(p, cx, cy, 2 * hb.a, exprName as Expr, lid, false, skin, undefined, false, undefined, ly);
  p.rot = null;
}
function dikaLegs(p: Pen, o: Outfit, stance: "brace" | "planted") {
  const u = DK_W() / 100, lc = mix(o.pants, INK, 0.38);
  const far: Pt[] = stance === "brace" ? [[306, 645], [282, 808], [258, 960]] : [[304, 648], [282, 810], [268, 960]];
  const near: Pt[] = stance === "brace" ? [[294, 645], [332, 802], [348, 960]] : [[296, 648], [318, 806], [330, 960]];
  limb(p, far[0], far[1], far[2], 15.5 * u, lc); footS(p, far[2], [far[2][0] + 19, 975], 9.5 * u, o.boots);
  limb(p, near[0], near[1], near[2], 15.5 * u, lc); footS(p, near[2], [near[2][0] + 20, 975], 9.5 * u, o.boots);
}
/** S3: profile, head pitched up, both hands gripping the spool up high. Grip = [445,400]. */
export function dikaLookUp(p: Pen, o: Outfit, exprName: string, lid: number) {
  const u = DK_W() / 100;
  dikaLegs(p, o, "brace");
  limb(p, [316, 448], [378, 452], [429, 417], 13.5 * u, mix(o.jacket, INK, 0.68));
  torso(p, o.jacket, 5, 300, 520, 70, 108, u);
  dikaHead(p, o, 306, 300, -20, 400, exprName, lid, 0, -1);
  limb(p, [320, 446], [398, 428], [461, 417], 13.5 * u, o.jacket);
  drawSpool(p, 445, 400, 30);
  p.dot(427, 420, 6.8 * u); p.dot(463, 420, 6.8 * u); // ink-dot hands gripping the spool's lower rim
}
/** S5: profile, holding the spool forward at waist height, head up. Grip = [400,556]. */
export function dikaHoldSide(p: Pen, o: Outfit, exprName: string, lid: number) {
  const u = DK_W() / 100;
  dikaLegs(p, o, "planted");
  limb(p, [314, 446], [352, 520], [380, 554], 13.5 * u, mix(o.jacket, INK, 0.68));
  torso(p, o.jacket, 5, 300, 518, 71, 109, u);
  dikaHead(p, o, 306, 302, -13, 402, exprName, lid, 0.3, -0.7);
  limb(p, [318, 444], [362, 514], [422, 554], 13.5 * u, o.jacket);
  drawSpool(p, 400, 556, 27);
  p.dot(377, 557, 6.8 * u); p.dot(423, 557, 6.8 * u); // ink-dot hands gripping the spool's sides
}
/** S4a: full front body, arms per mode. pull spool = [331,434]; shock spool = [418,678]. */
export function dikaFront(p: Pen, o: Outfit, exprName: string, lid: number, mode: "pull" | "shock") {
  const u = DK_W() / 100, lc = mix(o.pants, INK, 0.38), skin = o.skin ?? "#f7cfa5";
  limb(p, [274, 642], [264, 802], [262, 958], 15.5 * u, lc); footS(p, [262, 958], [246, 975], 9.5 * u, o.boots);
  limb(p, [326, 642], [338, 802], [342, 958], 15.5 * u, lc); footS(p, [342, 958], [360, 975], 9.5 * u, o.boots);
  torso(p, o.jacket, 5, 300, 505, 74, 112, u);
  p.stroke([[284, 402], [300, 416], [316, 402]], 2.6 * u, mix(o.jacket, INK, 0.35)); // tee collar V at the neckline
  if (mode === "pull") {
    limb(p, [246, 428], [262, 470], [310, 436], 13.5 * u, mix(o.jacket, INK, 0.68));
    limb(p, [354, 428], [362, 464], [352, 436], 13.5 * u, o.jacket);
    drawSpool(p, 331, 434, 26);
    p.dot(309, 436, 6.8 * u); p.dot(353, 436, 6.8 * u); // hands gripping the spool's sides
  } else {
    limb(p, [246, 428], [212, 545], [186, 674], 13.5 * u, mix(o.jacket, INK, 0.68));
    limb(p, [354, 428], [392, 548], [414, 672], 13.5 * u, o.jacket);
    drawSpool(p, 418, 678, 24);
    p.dot(184, 676, 6.8 * u); p.dot(403, 664, 6.8 * u); // free hand + hand on the spool's rim
  }
  const hb = headBlob(5, 112), pts = blobPts(300, 285, hb);
  p.shadedFill(pts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(pts, 5 * u, 0.7);
  hatOn(p, o, pts, hb, 300, 285, LIGHT, 5, 0, false);
  faceFront(p, 300, 285, 2 * hb.a, exprName as Expr, 0, 0, lid, false, skin, undefined, false, undefined, mode === "pull" ? -0.7 : -0.4);
}
/** S4b: bust close-up (own geometry scale in Cast). Spool = [300,905]. */
export function dikaCU(p: Pen, o: Outfit, exprName: string, lid: number, look: [number, number]) {
  const u = 3.7, skin = o.skin ?? "#f7cfa5";
  // shoulder dome: wider than tall, bottom inside the canvas (the old near-circle
  // blob ran past y=1000 and the card edge sliced it with a straight cut)
  const pts = blobPts(300, 770, torsoBlob(300, 770, 258, 215, 5 * 3 + 9));
  p.gradFill(pts, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.inkRing(pts, 11, 0.7);
  p.stroke([[264, 566], [300, 594], [336, 566]], 9, mix(o.jacket, INK, 0.35)); // tee collar V (was: an unexplained dark triangle)
  limb(p, [120, 1010], [205, 945], [274, 926], 34, mix(o.jacket, INK, 0.68));
  limb(p, [480, 1010], [395, 945], [326, 926], 34, o.jacket);
  drawSpool(p, 300, 905, 40);
  p.dot(272, 930, 16); p.dot(328, 930, 16); // ink-dot hands on the spool's lower rim
  const hb = headBlob(5, 185), hpts = blobPts(300, 380, hb);
  p.shadedFill(hpts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(hpts, 5 * u, 0.7);
  hatOn(p, o, hpts, hb, 300, 380, LIGHT, 5, 0, false);
  faceFront(p, 300, 380, 370, exprName as Expr, 0, look[0], lid, false, skin, undefined, false, undefined, look[1]);
}
// ---------------- Kakek custom pose ----------------
/** S5: profile, one hand raised to the string (hand at [445,385]), other hand gesturing. */
export function kakekTeach(p: Pen, o: Outfit, exprName: string, lid: number) {
  const W = 2 * headBlob(11, 118).a, u = W / 100, lc = mix(o.pants, INK, 0.38);
  limb(p, [304, 652], [280, 814], [266, 962], 15.5 * u, lc); footS(p, [266, 962], [250, 975], 9.5 * u, o.boots);
  limb(p, [296, 652], [322, 812], [334, 962], 15.5 * u, lc); footS(p, [334, 962], [354, 975], 9.5 * u, o.boots);
  limb(p, [318, 446], [348, 545], [398, 568], 13.5 * u, mix(o.jacket, INK, 0.68));
  torso(p, o.jacket, 11, 299, 522, 79, 116, u);
  p.dot(396, 570, 6.8 * u); // gesturing hand at the belly (was: a floating skin speck)
  limb(p, [320, 444], [392, 392], [445, 385], 13.5 * u, o.jacket);
  p.dot(445, 385, 6.8 * u); // raised hand (was: an unexplained ellipse ring)
  p.rot = [rad(-12), 302, 404];
  const hb = headBlob(11, 118), pts = blobPts(308, 298, hb), skin = o.skin ?? "#f5c9a0";
  p.shadedFill(pts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(pts, 5 * u, 0.7);
  hatOn(p, o, pts, hb, 308, 298, LIGHT, 11, 1, true);
  faceSide(p, 308, 298, 2 * hb.a, exprName as Expr, lid, true, skin, o.moustache, false, "o", -0.6);
  p.rot = null;
}
// ---------------- character-sheet busts (head + shoulders, expression set) ----------------
export function dikaBust(p: Pen, o: Outfit, exprName: string) {
  const skin = o.skin ?? "#f7cfa5";
  const pts = blobPts(300, 770, torsoBlob(300, 770, 258, 215, 5 * 3 + 9));
  p.gradFill(pts, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.inkRing(pts, 11, 0.7);
  p.stroke([[264, 566], [300, 594], [336, 566]], 9, mix(o.jacket, INK, 0.35));
  const hb = headBlob(5, 185), hpts = blobPts(300, 380, hb);
  p.shadedFill(hpts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(hpts, 18.5, 0.7);
  hatOn(p, o, hpts, hb, 300, 380, LIGHT, 5, 0, false);
  faceFront(p, 300, 380, 370, exprName as Expr, 0, 0, 0, false, skin);
}
export function kakekBust(p: Pen, o: Outfit, exprName: string, mouthOverride?: "o") {
  const skin = o.skin ?? "#f5c9a0";
  const pts = blobPts(300, 770, torsoBlob(300, 770, 258, 215, 11 * 3 + 9));
  p.gradFill(pts, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.inkRing(pts, 11, 0.7);
  for (let i = 0; i < 2; i++) { const y = 650 + i * 95; p.dot(302, y, 10, INK); p.dot(302, y, 7.4, shade(o.jacket, 0.7)); }
  const hb = headBlob(11, 185), hpts = blobPts(300, 380, hb);
  p.shadedFill(hpts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(hpts, 18.5, 0.7);
  hatOn(p, o, hpts, hb, 300, 380, LIGHT, 11, 0, false);
  faceFront(p, 300, 380, 370, exprName as Expr, 0, 0, 0, true, skin, o.moustache, false, mouthOverride);
}

// ---------------- kite + bird cards ----------------
export function drawKiteCard(p: Pen, phase: number) {
  const cx = 350;
  const top: Pt = [cx, 60], rgt: Pt = [620, 330], bot: Pt = [cx, 600], lft: Pt = [80, 330];
  p.poly([top, rgt, [cx, 330]], "#f2ede2", 0); p.poly([top, [cx, 330], lft], "#e2453c", 0);
  p.poly([[cx, 330], rgt, bot], "#f6c445", 0); p.poly([lft, [cx, 330], bot], "#f2ede2", 0);
  p.stroke([top, bot], 6, INK); p.stroke([lft, rgt], 6, INK);
  p.stroke([top, rgt, bot, lft, top], 9, INK);
  p.ell(cx, 350, 13, 13, INK, 0);
  const cols = ["#e2453c", "#f6c445", "#2f6fb5"];
  for (let k = 0; k < 3; k++) {
    const pts: Pt[] = [], off = (k - 1) * 34;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, y = 606 + t * 268;
      pts.push([cx + off * t + Math.sin(phase * 2.2 + y * 0.02 + k * 2.1) * 30 * t, y]);
    }
    const poly: Pt[] = [...pts, ...pts.slice().reverse().map((q) => [q[0] + 15 * (1 - (q[1] - 606) / 268 * 0.5), q[1]] as Pt)];
    p.poly(poly, cols[k], 3.5);
  }
  for (let i = 0; i < 3; i++) {
    const y = 660 + i * 70, x = cx + Math.sin(phase * 2.2 + y * 0.02 + 1) * 18;
    p.poly([[x - 17, y - 8], [x + 17, y - 8], [x, y + 10]], i % 2 ? "#f6c445" : "#e2453c", 3);
  }
}
export function drawBird(p: Pen, flap: number) {
  const ry = 16 + 13 * Math.sin(flap);
  p.arc(105, 92, 52, Math.max(6, ry), 194, 346, 8, "#2b3440");
  p.arc(195, 92, 52, Math.max(6, ry), 194, 346, 8, "#2b3440");
  p.ell(150, 88, 7, 5, "#2b3440", 0);
}

// ---------------- staging ----------------
type Tier = [number, number, number];
const T_FAR: Tier = [480, 800, 0.8], T_MID: Tier = [1080, 1800, 1.8], T_CU: Tier = [1800, 3000, 3];
const SU_CU = 0.34 / 370;
const cuGeo = new THREE.PlaneGeometry(600 * SU_CU, 1000 * SU_CU); cuGeo.translate(0, 475 * SU_CU, 0);
const bodyFeet = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const birdGeo = new THREE.PlaneGeometry(1.25, 0.67);
const BLOB_COL = "#4a5238";

const tierFor = (shot: number, who: string): Tier => {
  if (who === "dika" && shot === 4) return T_CU;
  if (who === "dika" || who === "kakek") return (shot === 0 || shot === 7) ? T_FAR : T_MID;
  return T_FAR;
};
/** exact near-hand endpoint of bodySide march (kid build, stride 1.2) — replicates
 *  toon.ts bodySide: IK stance hip height, hip lean rotation, swingArm geometry.
 *  Stride 1.2, NOT 1.5: at 1.5 the half-stride (277u) exceeds the kid's leg length
 *  (~227u), so bodySide's hipY sqrt clamps to ~0 at stride extremes and the torso
 *  drops to the ground in a seated split for a few frames every cycle. */
const runHand = (phase: number): [number, number] => {
  const H = headBlob(5, 112), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const ankY = 975 - 4 * u, legLen = 1.12 * HH - 4 * u, S = 370 * 1.2;
  const st = (ph: number) => {
    const c = (((phase + ph) % 1) + 1) % 1;
    if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, s, stance: true }; }
    const s = (c - 0.5) / 0.5;
    return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), s, stance: false };
  };
  const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
  const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
  const hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
  const lean = rad(4 + 3 * Math.cos(4 * Math.PI * phase));
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - 0.85 * HH;
  const Ta = 0.31 * W, tcx = 300 + 2 * u;
  const Sh: Pt = [tcx + 0.05 * Ta, chin + 0.14 * HH], aLen = 0.95 * HH;
  const nearFwd = nL.x / (S / 2), ang = rad(-30) * nearFwd;
  const el: Pt = [Sh[0] + Math.sin(ang) * aLen * 0.5, Sh[1] + Math.cos(ang) * aLen * 0.5];
  const a2 = ang + rad(16) * Math.sign(ang || 1);
  const hd: Pt = [el[0] + Math.sin(a2) * aLen * 0.5, el[1] + Math.cos(a2) * aLen * 0.5];
  const dx = hd[0] - 300, dy = hd[1] - hipY, c = Math.cos(lean), s = Math.sin(lean);
  return [300 + dx * c - dy * s, hipY + dx * s + dy * c];
};

export class Cast {
  pool = new Pool();
  dika: Actor; kakek: Actor; woman: Actor; man: Actor; kid2: Actor;
  birds: Actor[];
  fxD: Fx; fxK: Fx; fxW: Fx; fxM: Fx; fxK2: Fx;
  dikaHandLocal = new THREE.Vector3(0.2, 0.9, 0.03);
  constructor(parent: THREE.Object3D) {
    this.dika = new Actor(parent, bodyFeet);
    this.kakek = new Actor(parent, bodyFeet);
    this.woman = new Actor(parent, bodyFeet);
    this.man = new Actor(parent, bodyFeet);
    this.kid2 = new Actor(parent, bodyFeet);
    this.birds = [new Actor(parent, birdGeo), new Actor(parent, birdGeo), new Actor(parent, birdGeo)];
    this.fxD = new Fx(parent); this.fxK = new Fx(parent); this.fxW = new Fx(parent); this.fxM = new Fx(parent); this.fxK2 = new Fx(parent);
  }
  private stage(a: Actor, st: { x: number; z: number }, cam: { x: number; z: number }, mirror: boolean, y = 0, scale = 1) {
    a.mesh.visible = true;
    a.mesh.position.set(st.x, y, st.z);
    a.mesh.rotation.set(0, Math.atan2(cam.x - st.x, cam.z - st.z), 0);
    a.mesh.scale.set(mirror ? -scale : scale, scale, scale);
  }
  private blob(fx: Fx, x: number, z: number, w: number) {
    fx.r = this.pool.req(`blob|contact|${BLOB_COL}`, 128, 128, 1, (p) => fxContact(p, BLOB_COL));
    fx.use(false);
    fx.mesh.visible = true;
    fx.mesh.position.set(x, 0.03, z);
    fx.mesh.rotation.set(-Math.PI / 2, 0, 0);
    fx.mesh.scale.set(w, w * 0.85, 1);
  }
  update(f: number, camPos: { x: number; z: number }) {
    const t = f / FPS, shot = shotAt(f), at = ambT(f);
    // ---- Dika ----
    const d = dikaAt(f), dexpr = dikaExpr(f), dlid = lidAt(t, 0), dtier = tierFor(shot, "dika");
    let dkey = "", ddraw: (p: Pen) => void, dhand: [number, number] = [382, 690], dGeo = bodyFeet, dy = 0;
    const o = DIKA;
    switch (d.pose) {
      case "walkCarry": { const q = Math.round(d.phase * 40); dkey = `dk-walk-${q}-${Math.round(dlid * 4)}`; ddraw = (p) => { bodyFront(p, o, { mode: "stroll", phase: d.phase, expr: dexpr as Expr, blink: dlid, seed: 5 }); drawSpool(p, 378, 692, 25); }; dhand = [378, 692]; break; }
      case "runSide": {
        const q = Math.round(d.phase * 60); dkey = `dk-run-${q}-${Math.round(dlid * 4)}`;
        const hand = runHand(d.phase);
        ddraw = (p) => { bodySide(p, o, { phase: d.phase, stride: 1.2, expr: dexpr as Expr, blink: dlid, seed: 5 }); drawSpool(p, hand[0], hand[1], 26); };
        dhand = hand; break;
      }
      case "lookUp": dkey = `dk-up-${dexpr}-${Math.round(dlid * 4)}`; ddraw = (p) => dikaLookUp(p, o, dexpr, dlid); dhand = [445, 400]; break;
      case "frontPull": dkey = `dk-pull-${dexpr}-${Math.round(dlid * 4)}`; ddraw = (p) => dikaFront(p, o, dexpr, dlid, "pull"); dhand = [331, 434]; break;
      case "frontShock": dkey = `dk-shock-${dexpr}-${Math.round(dlid * 4)}`; ddraw = (p) => dikaFront(p, o, dexpr, dlid, "shock"); dhand = [418, 678]; break;
      case "cu": { const lk = cuLook(f); dkey = `dk-cu-${dexpr}-${Math.round(dlid * 4)}-${Math.round(lk[0] * 4)}-${Math.round(lk[1] * 4)}`; ddraw = (p) => dikaCU(p, o, dexpr, dlid, lk); dGeo = cuGeo; dy = 0.573; dhand = [300, 905]; break; }
      case "holdSide": dkey = `dk-hold-${dexpr}-${Math.round(dlid * 4)}`; ddraw = (p) => dikaHoldSide(p, o, dexpr, dlid); dhand = [400, 556]; break;
      default: dkey = `dk-stand-${dexpr}-${Math.round(dlid * 4)}`; ddraw = (p) => { bodyFront(p, o, { mode: "stand", expr: dexpr as Expr, blink: dlid, seed: 5 }); drawSpool(p, 382, 690, 25); }; dhand = [382, 690];
    }
    if (this.dika.mesh.geometry !== dGeo) this.dika.mesh.geometry = dGeo;
    this.dika.r = this.pool.req(dkey, dtier[0], dtier[1], dtier[2], ddraw);
    this.stage(this.dika, d, camPos, d.face < 0, dy);
    const hs = dGeo === cuGeo ? SU_CU : SU;
    // front poses: anchor the string a step in front of the card, so the line visibly
    // leaves the spool and crosses the chest before slipping behind the head (at z=0.03
    // it hugged the card and the torso silhouette swallowed it — string read as head-ended)
    const dz = (d.pose === "frontPull" || d.pose === "frontShock" || d.pose === "cu" || d.pose === "runSide") ? 0.18 : 0.03;
    this.dikaHandLocal.set((dhand[0] - 300) * hs, (975 - dhand[1]) * hs, dz);
    this.blob(this.fxD, d.x, d.z, 0.66);
    // ---- Kakek ----
    const k = kakekAt(f), kexpr = kakekExpr(f), klid = lidAt(t, 3), ktier = tierFor(shot, "kakek");
    const ko = KAKEK;
    let kkey = "", kdraw: (p: Pen) => void;
    switch (k.pose) {
      case "sit": kkey = `kk-sit-${Math.round(klid * 4)}`; kdraw = (p) => bodyFront(p, ko, { mode: "sit", expr: "neutral", blink: klid, seed: 11 }); break;
      case "stroll": { const q = Math.round(k.phase * 40); kkey = `kk-stroll-${q}-${Math.round(klid * 4)}`; kdraw = (p) => bodyFront(p, ko, { mode: "stroll", phase: k.phase, expr: "relief_open", blink: klid, seed: 11 }); break; }
      case "teach": kkey = `kk-teach-${Math.round(klid * 4)}`; kdraw = (p) => kakekTeach(p, ko, "smile", klid); break;
      default: kkey = `kk-stand-${kexpr}-${Math.round(klid * 4)}`; kdraw = (p) => bodyFront(p, ko, { mode: "stand", expr: kexpr as Expr, blink: klid, seed: 11 });
    }
    this.kakek.r = this.pool.req(kkey, ktier[0], ktier[1], ktier[2], kdraw);
    this.stage(this.kakek, k, camPos, k.face < 0, 0, 1.02);
    this.blob(this.fxK, k.x, k.z, 0.8);
    // ---- ambient villagers (varied, no clones) ----
    const wx = 16 - at * 0.55, wphase = at * 0.43, wq = Math.round(wphase * 40);
    this.woman.r = this.pool.req(`wm-${wq}-${Math.round(lidAt(t, 5) * 4)}`, 480, 800, 0.8, (p) => bodySide(p, { ...WOMAN }, { phase: wphase, stride: 0.8, expr: "smile", blink: lidAt(t, 5), seed: 21 }));
    this.stage(this.woman, { x: wx, z: -18 }, camPos, true, 0, 0.94);
    this.blob(this.fxW, wx, -18, 0.7);
    const waving = shot === 0 || shot === 7;
    const manOpts: Record<string, unknown> = { mode: "stand", expr: "smile", blink: lidAt(t, 7), seed: 31 };
    if (waving) manOpts.wave = Math.sin(t * 2.4);
    this.man.r = this.pool.req(`mn-${waving ? "wave" : "stand"}-${Math.round(lidAt(t, 7) * 4)}`, 480, 800, 0.8, (p) => bodyFront(p, { ...MAN }, manOpts as never));
    this.stage(this.man, { x: -19, z: -24 }, camPos, false, 0, 1.0);
    this.blob(this.fxM, -19, -24, 0.8);
    const hop = (shot === 0 || shot === 7) ? Math.abs(Math.sin(at * 2.6)) * 0.1 : 0;
    this.kid2.r = this.pool.req(`k2-${Math.round(lidAt(t, 9) * 4)}`, 480, 800, 0.8, (p) => bodyFront(p, { ...KID2 }, { mode: "stand", expr: "grin", blink: lidAt(t, 9), seed: 41 }));
    this.stage(this.kid2, { x: 13.5, z: -18.5 }, camPos, false, hop, 1.0);
    this.blob(this.fxK2, 13.5, -18.5, 0.62);
    // ---- birds ----
    for (let i = 0; i < 3; i++) {
      const prog = ((at * (0.014 + i * 0.004) + i * 0.37) % 1.25) - 0.12;
      const bx = -48 + prog * 96, by = 12.5 + i * 1.8 + Math.sin(at * 0.9 + i * 2) * 0.5, bz = -17 - i * 4.5;
      const fq = Math.round(at * (6 + i) * 2);
      this.birds[i].r = this.pool.req(`bd${i}-${fq}`, 300, 160, 1, (p) => drawBird(p, at * (6 + i)));
      this.birds[i].mesh.visible = true;
      const m = this.birds[i].mesh;
      if (m.geometry !== birdGeo) m.geometry = birdGeo;
      m.position.set(bx, by, bz);
      m.rotation.set(0, Math.atan2(camPos.x - bx, camPos.z - bz), 0);
      m.scale.set(1, 1, 1);
    }
    // ---- flush + bind ----
    this.pool.flush();
    for (const a of [this.dika, this.kakek, this.woman, this.man, this.kid2, ...this.birds]) a.bind();
    for (const fx of [this.fxD, this.fxK, this.fxW, this.fxM, this.fxK2]) fx.bind();
  }
}
