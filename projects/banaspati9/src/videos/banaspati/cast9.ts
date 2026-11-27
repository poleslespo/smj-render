// Ep.9 human cast — Rendi (young skeptic), Kakek Karso (elder), Tono (burned
// survivor) — on the template character system (layang toon.ts bodyFront /
// bodySide / face painters, crescent-taper limbs), each a distinct silhouette:
// Rendi = bare black hair + denim jacket, lean; Karso = peci + grey moustache +
// brown jacket, seed-wider head; Tono = rust jacket + the burn scars (chest V
// under an open collar, creeping up the neck — script line 3: "di dada Tono,
// bekas luka bakar tak pernah hilang").
// Night look is BAKED into the card painting (the stylised shaders ignore
// point lights): a cool wash over everything, a warm gradient from the fire
// side, extra darkness on the far side. fireDir: +1 fire at screen right,
// -1 at screen left, 0 = no directional fire (frontal wash only).
import { Pen, INK, headBlob, blobPts, bodyFront, bodySide, faceFront, hatOn, mul, mix, shade, limbV, SH_SKIN, SH_CLOTH, SKINS, Blob, Outfit, Expr } from "../layang/toon";

const LIGHT = (-120 * Math.PI) / 180;

export const RENDI: Outfit = { jacket: "#2e4a66", pants: "#33383f", boots: "#1f1b18", hat: "hair", hair: "#17110c", skin: SKINS[1], build: "adult" };
export const KARSO: Outfit = { jacket: "#6a5136", pants: "#3f3428", boots: "#2e2119", hat: "peci", hair: "#cfd4d9", moustache: "#cfd4d9", skin: SKINS[2], build: "adult" };
export const TONO: Outfit = { jacket: "#7a3b2e", pants: "#2f3338", boots: "#241d18", hat: "hair", hair: "#241207", skin: SKINS[0], build: "adult" };
export const SEED_RENDI = 17, SEED_KARSO = 29, SEED_TONO = 43;

/** night + fire wash over a finished 600x1000 card painting (design coords) */
export const nightWash = (p: Pen, fireDir: -1 | 0 | 1, strength = 1) => {
  const g = p.g;
  g.save();
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = `rgba(22,32,64,${0.3 * strength})`;           // cold night dim
  g.fillRect(0, 0, 600, 1000);
  if (fireDir !== 0) {
    const x0 = fireDir > 0 ? 600 : 0, x1 = fireDir > 0 ? 600 - 380 : 380;
    const gr = g.createLinearGradient(x0, 0, x1, 0);
    gr.addColorStop(0, `rgba(255,138,44,${0.52 * strength})`);
    gr.addColorStop(0.55, `rgba(255,110,30,${0.16 * strength})`);
    gr.addColorStop(1, "rgba(255,100,20,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 600, 1000);
    const fx0 = fireDir > 0 ? 0 : 600, fx1 = fireDir > 0 ? 300 : 300;
    const dk = g.createLinearGradient(fx0, 0, fx1, 0);
    dk.addColorStop(0, `rgba(4,8,22,${0.34 * strength})`);    // far side falls off
    dk.addColorStop(1, "rgba(4,8,22,0)");
    g.fillStyle = dk; g.fillRect(0, 0, 600, 1000);
  }
  g.restore();
};

/** dawn wash: gentler cold + a low warm breath from the horizon side */
export const dawnWash = (p: Pen) => {
  const g = p.g;
  g.save();
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = "rgba(38,48,84,0.18)";
  g.fillRect(0, 0, 600, 1000);
  const gr = g.createLinearGradient(0, 1000, 0, 300);
  gr.addColorStop(0, "rgba(255,150,70,0.14)"); gr.addColorStop(1, "rgba(255,150,70,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 600, 1000);
  g.restore();
};

// ---------------- burn scars (Tono) ----------------
const SCAR_D = "#7a3226", SCAR_M = "#93503a", SCAR_P = "#d9a184";
/** mottled burn texture inside a clip: dark patches, mid patches, pale keloid streaks.
 *  big=true makes the patches larger/softer (full-body scale, where small
 *  high-contrast mottling reads as a patterned tie instead of a burn). */
const scarTexture = (p: Pen, cx: number, cy: number, rx: number, ry: number, seed: number, big = false, streaks = true) => {
  const hh = (n: number) => { const s = Math.sin((seed + n) * 127.1) * 43758.5453; return s - Math.floor(s); };
  const n = big ? 5 : 7, s0 = big ? 0.5 : 0.3, s1 = big ? 0.34 : 0.3;
  for (let i = 0; i < n; i++) {
    const x = cx + (hh(i * 3) - 0.5) * rx * 1.5, y = cy + (hh(i * 5) - 0.5) * ry * 1.5;
    p.ell(x, y, rx * (s0 + s1 * hh(i * 7)), ry * (s0 + s1 * 0.9 * hh(i * 11)), i % 2 ? SCAR_M : SCAR_D, 0);
  }
  if (streaks) for (let i = 0; i < (big ? 3 : 5); i++) { // keloid streaks: short pale strokes
    const x = cx + (hh(i * 13) - 0.5) * rx * 1.3, y = cy + (hh(i * 17) - 0.5) * ry * 1.3;
    p.stroke([[x - rx * 0.22, y], [x + rx * 0.1, y + ry * 0.16], [x + rx * 0.26, y + ry * 0.05]], 3.2, SCAR_P);
  }
};

/**
 * Tono full body: template bodyFront, then the shirt opened at the chest —
 * a skin V from the collar down, carrying the burn; a scar also creeps up the
 * left side of the neck to the jaw. Coordinates follow bodyFront's adult
 * stand geometry (chin ~420, chest 430..580 for HH ~222).
 */
export const tonoFront = (p: Pen, expr: Expr, lid = 0) => {
  bodyFront(p, TONO, { mode: "stand", expr, blink: lid, seed: SEED_TONO });
  const skin = TONO.skin!;
  // jaw scar: clipped to the head blob so it can only ever sit ON skin (an
  // earlier free ellipse floated off the jaw and read as a held object)
  const H = headBlob(SEED_TONO, 118), HH = 2 * H.b, torsoBot = 975 - 1.4 * HH, chin = torsoBot - 1.1 * HH, hc = chin - H.b;
  p.clip(blobPts(300, hc, H), () => {
    p.ell(300 - H.a * 0.58, hc + H.b * 0.55, 13, 20, SCAR_M, 0);
    scarTexture(p, 300 - H.a * 0.58, hc + H.b * 0.55, 12, 18, 5, false, false);
  });
  // open collar V: skin + scar, clipped to the V
  const V: [number, number][] = [[258, 436], [342, 436], [300, 566]];
  p.poly(V, skin, 0);
  p.clip(V, () => scarTexture(p, 300, 486, 34, 52, 9, true, false));
  p.clip(V, () => { // unburnt skin survives at the V's lower point
    p.ell(300, 540, 20, 22, skin, 0);
    scarTexture(p, 296, 470, 30, 40, 21, true, false);
  });
  // lapels: jacket folds along both V edges + ink seams
  p.poly([[258, 436], [284, 436], [300, 520], [288, 566], [252, 452]], mul(TONO.jacket, SH_CLOTH), 3);
  p.poly([[342, 436], [316, 436], [300, 520], [312, 566], [348, 452]], mul(TONO.jacket, SH_CLOTH), 3);
  p.stroke([[258, 436], [300, 566]], 3, INK);
  p.stroke([[342, 436], [300, 566]], 3, INK);
};

// ---------------- busts (head + shoulders, the cast2 bust pattern) ----------------
const torsoBlob = (cx: number, cy: number, a: number, b: number, seed: number): Blob =>
  ({ a, b, nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06, rot: 0, noise: 0.006, seed });

const bustBase = (p: Pen, o: Outfit, seed: number, expr: Expr, mouthO = false) => {
  const skin = o.skin ?? SKINS[0];
  const pts = blobPts(300, 770, torsoBlob(300, 770, 258, 215, seed * 3 + 9));
  p.gradFill(pts, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.inkRing(pts, 11, 0.7);
  const hb = headBlob(seed, 185), hpts = blobPts(300, 380, hb);
  p.shadedFill(hpts, skin, mul(skin, SH_SKIN), LIGHT, hb.a);
  p.inkRing(hpts, 18.5, 0.7);
  hatOn(p, o, hpts, hb, 300, 380, LIGHT, seed, 0, false);
  const brim = !!o.hat && o.hat !== "hair";
  faceFront(p, 300, 380, 370, expr, 0, 0, 0, brim, skin, o.moustache, false, mouthO ? "o" : undefined);
  return { skin, hb };
};

export const rendiBust = (p: Pen, expr: Expr) => { bustBase(p, RENDI, SEED_RENDI, expr); };
export const karsoBust = (p: Pen, expr: Expr) => {
  bustBase(p, KARSO, SEED_KARSO, expr);
  for (let i = 0; i < 2; i++) { const y = 650 + i * 95; p.dot(302, y, 10, INK); p.dot(302, y, 7.4, shade(KARSO.jacket, 0.7)); }
  // thicker moustache pass (same reason as karsoFront)
  p.stroke([[250, 423], [300, 435], [350, 423]], 14, "#ccd1d6");
  p.stroke([[256, 431], [300, 441], [344, 431]], 7.5, "#aeb5bc");
};
/** Tono bust: the burn at full readability — chest V with scar + the scar climbing the jaw */
export const tonoBust = (p: Pen, expr: Expr) => {
  const { skin } = bustBase(p, TONO, SEED_TONO, expr);
  // chest V (bust scale: shoulders ~600, V from the collar 585 to 800)
  const V: [number, number][] = [[238, 588], [362, 588], [300, 792]];
  p.poly(V, skin, 0);
  p.clip(V, () => scarTexture(p, 300, 668, 52, 84, 9, true, false));
  p.poly([[238, 588], [272, 588], [300, 726], [284, 792], [228, 610]], mul(TONO.jacket, SH_CLOTH), 4);
  p.poly([[362, 588], [328, 588], [300, 726], [316, 792], [372, 610]], mul(TONO.jacket, SH_CLOTH), 4);
  p.stroke([[238, 588], [300, 792]], 4, INK);
  p.stroke([[362, 588], [300, 792]], 4, INK);
  // jaw scar, clipped to the head so it stays on skin
  const hb = headBlob(SEED_TONO, 185);
  p.clip(blobPts(300, 380, hb), () => {
    p.ell(300 - hb.a * 0.66, 380 + hb.b * 0.68, 20, 34, SCAR_M, 0);
    scarTexture(p, 300 - hb.a * 0.66, 380 + hb.b * 0.68, 19, 32, 5, true);
  });
};

/** Kakek Karso full body: template bodyFront + a thicker grey moustache pass
 *  (the template's thin tapers vanish against his pale skin at sheet scale) */
export const karsoFront = (p: Pen, expr: Expr, lid = 0) => {
  bodyFront(p, KARSO, { mode: "stand", expr, blink: lid, seed: SEED_KARSO });
  p.stroke([[268, 335], [300, 345], [332, 335]], 9.5, "#ccd1d6");
  p.stroke([[272, 341], [300, 349], [328, 341]], 5, "#aeb5bc");
};

// ---------------- facing variants: side + back (teardown U5) ----------------
// The template ships front + side painters only; the BACK is painted here on
// bodyFront's exact stand geometry (same head blob, torso blob, limb chains),
// so all four facings share one rig. From behind: hair/peci mass instead of a
// face, jacket back with a centre seam instead of buttons, heels instead of
// toes. A person's left/right swap on screen when they turn — Tono's jaw scar
// (screen-left from the front) peeks at screen-RIGHT from behind.
export const bodyBack = (p: Pen, o: Outfit, seed: number) => {
  const H = headBlob(seed, 118), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const sole = 975, torsoBot = sole - 1.4 * HH, chin = torsoBot - 1.1 * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), skin = o.skin ?? SKINS[0];
  const LEGW = [15.5 * u, 13 * u, 10.5 * u], ARMW = [13.5 * u, 12 * u, 10.5 * u], RIM = 2.2 * u;
  // legs + heels
  for (const side of [-1, 1]) {
    const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u;
    limbV(p, [[hx, hipY], [(hx + fx) / 2 + side * 1.5 * u, (hipY + fy) / 2], [fx, fy]], LEGW, legCol, LIGHT, RIM);
    p.ell(fx - side * 2 * u, fy + 1 * u, 11 * u, 6 * u, o.boots, 2 * u);
  }
  // torso blob (same T as bodyFront)
  const T: Blob = { a: (0.8 / 2 * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcy = torsoBot - T.b, tp = blobPts(300, tcy, T);
  // arms hanging (drawn before the torso, as in bodyFront)
  for (const side of [-1, 1]) {
    const S: [number, number] = [300 + side * 0.85 * T.a, chin + 0.12 * HH];
    const E: [number, number] = [300 + side * (1.12 * T.a + 4 * u), S[1] + 0.48 * HH];
    const Hd: [number, number] = [E[0] + side * 3 * u, chin + 1.04 * HH];
    limbV(p, [S, E, Hd], ARMW, armCol, LIGHT, RIM);
    p.dot(Hd[0], Hd[1], 8.6 * u, INK);
    p.dot(Hd[0], Hd[1], 7 * u, mul(skin, SH_SKIN));
  }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), LIGHT);
  p.clip(tp, () => { // centre back seam + collar band
    p.stroke([[300, chin - 0.02 * HH], [300, torsoBot - 0.06 * HH]], 2.5 * u, mul(o.jacket, SH_CLOTH));
    p.poly([[300 - 0.5 * T.a, chin - 0.16 * HH], [300 + 0.5 * T.a, chin - 0.16 * HH], [300 + 0.46 * T.a, chin + 0.02 * HH], [300 - 0.46 * T.a, chin + 0.02 * HH]], mul(o.jacket, SH_CLOTH), 0);
  });
  p.inkRing(tp, 11, 0.7);
  // head from behind: hair mass (or peci over grey hair), no face. Hair is
  // shaded well down — at full value Karso's grey read as a blank white face.
  const hp = blobPts(300, hc, H);
  p.gradFill(hp, mul(o.hair, [0.7, 0.7, 0.78]), mul(o.hair, [0.45, 0.45, 0.55]), LIGHT);
  p.inkRing(hp, 12, 0.7);
  if (o.hat === "peci") { // peci cap over the top of the head, grey hair below it
    p.clip(hp, () => {
      p.poly([[300 - H.a - 6, hc - H.b - 6], [300 + H.a + 6, hc - H.b - 6], [300 + H.a + 6, hc - 0.22 * H.b], [300 - H.a - 6, hc - 0.22 * H.b]], "#2a2019", 0);
      p.stroke([[300 - H.a, hc - 0.22 * H.b], [300 + H.a, hc - 0.22 * H.b]], 3.5, "#171008");
    });
  }
};

export const rendiBack = (p: Pen) => bodyBack(p, RENDI, SEED_RENDI);
export const karsoBack = (p: Pen) => bodyBack(p, KARSO, SEED_KARSO);
export const tonoBack = (p: Pen) => {
  bodyBack(p, TONO, SEED_TONO);
  // the jaw scar peeking at the head's screen-right edge (his front-left scar, turned around)
  const H = headBlob(SEED_TONO, 118), HH = 2 * H.b, torsoBot = 975 - 1.4 * HH, chin = torsoBot - 1.1 * HH, hc = chin - H.b;
  p.clip(blobPts(300, hc, H), () => {
    p.ell(300 + H.a * 0.6, hc + H.b * 0.55, 10, 15, SCAR_M, 0);
  });
};

export const rendiSide = (p: Pen, expr: Expr) => bodySide(p, RENDI, { mode: "stand", expr, seed: SEED_RENDI });
export const karsoSide = (p: Pen, expr: Expr) => bodySide(p, KARSO, { mode: "stand", expr, seed: SEED_KARSO });
/** Tono in profile: template bodySide + the jaw scar on the profile jaw
 *  (geometry replicated from bodySide's stand rig so the patch sits on skin) */
export const tonoSide = (p: Pen, expr: Expr) => {
  bodySide(p, TONO, { mode: "stand", expr, seed: SEED_TONO });
  const H0 = headBlob(SEED_TONO, 118, 1), H: Blob = { ...H0, asym: 0.12 };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const ankY = 975 - 4 * u, legLen = (1.4 + 0.12) * HH - 4 * u, hipY = ankY - legLen * 0.995;
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - 1.1 * HH, hc = chin - H.b, hx = 300 + 4 * u;
  p.clip(blobPts(hx, hc, H), () => {
    p.ell(hx + H.a * 0.6, hc + H.b * 0.55, 11, 16, SCAR_M, 0.3);
    scarTexture(p, hx + H.a * 0.6, hc + H.b * 0.55, 10, 14, 5, false, false);
  });
};
