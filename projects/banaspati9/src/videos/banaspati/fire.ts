// Banaspati fire painters (Ep.9 design gate). The Banaspati IS the fire itself:
// (a) a floating fireball — fist-sized at rest, enlarging with the victim's fear;
// (b) the climax form — a whole burning human walking INVERTED (hands down, head
// below, legs up, a tongue of flame jetting from the mouth). Canon locks from
// bentuk-banaspati.md: NO flaming skull, NO flying head with organs (that is the
// Ep.6 kuyang); a FAINT face inside the flame is attested and allowed; the fire
// burns its victim without scorching the surroundings.
// Painted on transparent canvases for the Fx/Actor card system (layang/cards.ts).
//
// ROUND-2 MATERIAL RULE (QC rejected round 1 as glossy plastic / balloon toy):
// NOTHING on the body may be a smooth shape. Every silhouette is a ragged
// multi-harmonic blob; limbs are chains of overlapping flame blobs, never
// strokes (a stroked path + pale core stripe reads as a specular plastic
// tube); the hot core is BROKEN into jittered patches, never a centred stripe
// or disc; dark charred blotches and mottling break every surface; flame
// tongues have wavy S-curved spines and hooked tips, never smooth teardrops
// or even triangles. Colours run deep red shell -> orange -> yellow -> small
// near-white hot patches, asymmetric everywhere.
import { Pen, INK, mul, mix } from "../layang/toon";

type Pt = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const hh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const curve = (a: Pt, k: Pt, b: Pt, n = 12): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * k[0] + t * t * b[0], u * u * a[1] + 2 * u * t * k[1] + t * t * b[1]]); }
  return out;
};

/** ragged blob outline: an ellipse whose radius is beaten by five harmonics
 *  (total swing up to ~±0.32 x rough) — the anti-balloon silhouette. */
const blobPts = (cx: number, cy: number, rx: number, ry: number, seed: number, rough = 1): Pt[] => {
  const p1 = hh(seed + 1) * 6.283, p2 = hh(seed + 2) * 6.283, p3 = hh(seed + 3) * 6.283, p4 = hh(seed + 4) * 6.283, p5 = hh(seed + 5) * 6.283;
  const pts: Pt[] = [];
  const N = 44;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const r = 1 + rough * (0.09 * Math.sin(2 * t + p1) + 0.085 * Math.sin(3 * t + p2) + 0.07 * Math.sin(5 * t + p3) + 0.05 * Math.sin(8 * t + p4) + 0.035 * Math.sin(13 * t + p5));
    pts.push([cx + rx * r * Math.cos(t), cy + ry * r * Math.sin(t)]);
  }
  return pts;
};

const fillBlob = (p: Pen, cx: number, cy: number, rx: number, ry: number, seed: number, col: string, alpha = 1, rough = 1) => {
  const g = p.g;
  g.save(); g.globalAlpha = alpha;
  p.path(blobPts(cx, cy, rx, ry, seed, rough), true); g.fillStyle = col; g.fill();
  g.restore();
};

/**
 * Outline of ONE flame tongue: base at (bx,by), tip toward angDeg (canvas
 * degrees: -90 = straight up, +90 = straight down), length len, base width w.
 * The spine S-curves and the tip hooks sideways; the edges bulge then taper
 * with a wobble, so the shape flickers instead of reading as a teardrop,
 * triangle or leaf.
 */
const tongueShape = (bx: number, by: number, angDeg: number, len: number, w: number, seed: number): Pt[] => {
  const a = rad(angDeg), dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
  const sway = (hh(seed + 1) - 0.5) * 0.6, hook = (hh(seed + 2) - 0.5) * 1.0;
  const ph1 = hh(seed + 3) * 6.283, ph2 = hh(seed + 4) * 6.283;
  const N = 9, pts: Pt[] = [];
  const spine = (t: number): Pt => {
    const off = len * (sway * 0.15 * Math.sin(t * Math.PI) + hook * 0.2 * t * t);
    return [bx + dx * len * t + px * off, by + dy * len * t + py * off];
  };
  const half = (t: number) => (w / 2) * Math.pow(1 - t, 0.62) * (0.8 + 0.2 * Math.sin(t * Math.PI));
  for (let i = 0; i <= N; i++) { const t = i / N, [sx, sy] = spine(t), h = half(t) * (1 + 0.17 * Math.sin(t * 15 + ph1) + 0.08 * Math.sin(t * 29 + ph2)); pts.push([sx - px * h, sy - py * h]); }
  for (let i = N; i >= 0; i--) { const t = i / N, [sx, sy] = spine(t), h = half(t) * (1 + 0.17 * Math.sin(t * 15 + ph2) + 0.08 * Math.sin(t * 29 + ph1)); pts.push([sx + px * h, sy + py * h]); }
  return pts;
};

const fillTongue = (p: Pen, bx: number, by: number, angDeg: number, len: number, w: number, seed: number, col: string, alpha = 1) => {
  const g = p.g;
  g.save(); g.globalAlpha = alpha;
  p.path(tongueShape(bx, by, angDeg, len, w, seed), true); g.fillStyle = col; g.fill();
  g.restore();
};

/** upward flame tongue from base (x,y) rising h, leaning lean (old call shape) */
const tongue = (p: Pen, x: number, y: number, h: number, w: number, lean: number, col: string, alpha = 1, seed = 1) => {
  fillTongue(p, x, y, -90 + deg(Math.atan2(lean, Math.max(h, 1))), h, w, seed, col, alpha);
};

/** a charred patch: irregular near-black-brown blotch with a darker core —
 *  the surface-breaker that kills the candy/plastic read. */
const charBlotch = (p: Pen, x: number, y: number, rx: number, ry: number, seed: number, alpha = 0.5) => {
  const g = p.g;
  g.save(); g.filter = "blur(4px)";
  g.globalAlpha = alpha;
  p.path(blobPts(x, y, rx, ry, seed, 0.9), true); g.fillStyle = "#400c00"; g.fill();
  g.globalAlpha = alpha * 0.85;
  p.path(blobPts(x + rx * 0.18, y + ry * 0.12, rx * 0.55, ry * 0.55, seed + 9, 0.9), true); g.fillStyle = "#1c0300"; g.fill();
  g.restore();
};

/** mottling: many small soft blotches in mixed fire tones across a mass —
 *  no surface stays a uniform colour field. */
const mottle = (p: Pen, cx: number, cy: number, rx: number, ry: number, seed: number, n = 14) => {
  const g = p.g;
  const cols: [string, number][] = [["#c93a00", 0.26], ["#a82c00", 0.22], ["#ff7b00", 0.2], ["#ffb02e", 0.15], ["#8f1c00", 0.2]];
  g.save(); g.filter = "blur(3px)";
  for (let i = 0; i < n; i++) {
    const a = hh(seed + i * 7) * Math.PI * 2, d = Math.sqrt(hh(seed + i * 13)) * 0.74;
    const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
    const [col, al] = cols[i % cols.length];
    g.globalAlpha = al; g.fillStyle = col;
    g.beginPath(); g.ellipse(x, y, rx * (0.1 + 0.17 * hh(seed + i * 19)), ry * (0.08 + 0.14 * hh(seed + i * 23)), hh(seed + i * 29) * 3, 0, Math.PI * 2); g.fill();
  }
  g.restore();
};

/** flame tongues licking off the upper rim of a mass: jittered positions on
 *  the arc [a0,a1] (canvas degrees, -y up), bases buried ~0.4 R deep, heights
 *  and leans varying hard — some tall, some stubby, never a regular crown. */
const rimTongues = (p: Pen, cx: number, cy: number, rx: number, ry: number, seed: number, count: number, scale: number, a0 = 192, a1 = 348) => {
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const phi = rad(a0 + (a1 - a0) * t + (hh(seed + i * 7) - 0.5) * 16);
    const ex = cx + rx * Math.cos(phi), ey = cy + ry * Math.sin(phi);
    const bx = cx + (ex - cx) * 0.58, by = cy + (ey - cy) * 0.58;
    const out = deg(Math.atan2(ey - cy, ex - cx));            // radial direction
    const ang = out + (-90 - out) * 0.55 + (hh(seed + i * 11) - 0.5) * 26; // tilted toward up
    const len = ry * (0.3 + 0.75 * hh(seed + i * 17)) * scale;
    const wdt = rx * (0.3 + 0.22 * hh(seed + i * 19));
    fillTongue(p, bx, by, ang, len, wdt, seed + i * 23, "#e84900", 0.9);
    fillTongue(p, bx, by, ang, len * 0.78, wdt * 0.66, seed + i * 29, "#ff8a12", 0.92);
    fillTongue(p, bx, by, ang, len * 0.44, wdt * 0.34, seed + i * 31, "#ffc93f", 0.9);
  }
};

/** inner flame tongues rising through a mass from its lower centre */
const innerTongues = (p: Pen, cx: number, cy: number, rx: number, ry: number, seed: number, alpha: number) => {
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * rx * 0.34 + (hh(seed + i * 43) - 0.5) * rx * 0.16;
    const len = ry * (0.6 + 0.25 * hh(seed + i * 47));
    fillTongue(p, x, cy + ry * 0.6, -90 + (hh(seed + i * 51) - 0.5) * 22, len, rx * 0.24, seed + i * 53, i % 2 ? "#ffd23f" : "#fff3b0", alpha);
  }
};

/**
 * A limb of LIVING FLAME along a 2- or 3-point chain — built ONLY from
 * overlapping ragged blobs (never a stroke, never a centre stripe):
 * blurred deep-red fringe -> body blobs -> jittered hot blobs -> sparse
 * broken bright patches -> tongues licking UP off the limb -> char blotches.
 */
const flameLimb = (p: Pen, pts: Pt[], w: number, seed = 5) => {
  const g = p.g;
  const path = pts.length === 3 ? curve(pts[0], pts[1], pts[2], 18) : pts;
  // arc-length samples along the chain
  const samples: { x: number; y: number; nx: number; ny: number }[] = [];
  let total = 0;
  const segLen: number[] = [];
  for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segLen.push(l); total += l; }
  const step = Math.max(10, w * 0.3);
  for (let d = 0; d <= total; d += step) {
    let acc = 0, i = 0;
    while (i < segLen.length - 1 && acc + segLen[i] < d) { acc += segLen[i]; i++; }
    const t = segLen[i] ? (d - acc) / segLen[i] : 0;
    const x = path[i][0] + (path[i + 1][0] - path[i][0]) * t, y = path[i][1] + (path[i + 1][1] - path[i][1]) * t;
    const dl = Math.max(1, segLen[i]), nx = -(path[i + 1][1] - path[i][1]) / dl, ny = (path[i + 1][0] - path[i][0]) / dl;
    samples.push({ x, y, nx, ny });
  }
  if (!samples.length) samples.push({ x: path[0][0], y: path[0][1], nx: 0, ny: 1 });
  // 1) blurred deep-red fringe — the ragged outer aura of the limb
  g.save(); g.filter = "blur(5px)"; g.globalAlpha = 0.45; g.fillStyle = "#8f1c00";
  for (let i = 0; i < samples.length; i++) { const s = samples[i]; p.path(blobPts(s.x, s.y, w * 0.7, w * 0.64, seed + i * 3, 0.6), true); g.fill(); }
  g.restore();
  // 2) body blobs in ONE colour (alternating hues banded into stripes last
  // round) with gentle outline noise — they must merge into a continuous
  // limb; the raggedness lives in the fringe, tongues and char, not here
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    fillBlob(p, s.x, s.y, w * (0.6 + 0.05 * hh(seed + i * 7)), w * (0.57 + 0.05 * hh(seed + i * 11)), seed + i * 13, "#e55800", 1, 0.5);
  }
  // 3) hot blobs: a MEANDERING river of heat, not a centred core — the centre
  // offset wanders smoothly side to side along the limb (per-sample jitter
  // averaged back onto the axis and chained into a dashed yellow column),
  // with hashed gaps so the river breaks and rejoins like real flame
  for (let i = 0; i < samples.length; i += 1) {
    if (hh(seed + i * 23) < 0.22) continue;
    const s = samples[i];
    const off = Math.sin(i * 0.9 + seed * 1.7) * w * 0.17 + (hh(seed + i * 17) - 0.5) * w * 0.08;
    const bright = hh(seed + i * 29) > 0.82;
    fillBlob(p, s.x + s.nx * off, s.y + s.ny * off, w * (0.3 + 0.1 * hh(seed + i * 31)), w * (0.28 + 0.09 * hh(seed + i * 37)), seed + i * 19, bright ? "#ffc93f" : "#ff9a1f", bright ? 0.75 : 0.88, 0.55);
  }
  // 4) tongues licking UP (world up) off the limb — sparse, varied, short
  for (let i = 0; i < samples.length; i++) {
    if (hh(seed + i * 37) < 0.55) continue;
    const s = samples[i], len = w * (0.4 + 0.45 * hh(seed + i * 41)), wdt = w * (0.4 + 0.18 * hh(seed + i * 43));
    const ang = -90 + (hh(seed + i * 47) - 0.5) * 44;
    fillTongue(p, s.x, s.y, ang, len, wdt, seed + i * 53, "#e84900", 0.88);
    fillTongue(p, s.x, s.y, ang, len * 0.7, wdt * 0.6, seed + i * 59, "#ff9a1f", 0.9);
  }
  // 5) char: just two large soft blotches at hashed positions per limb —
  // one small dark knot per sample read as a burnt-corn pattern
  for (let k = 0; k < 2; k++) {
    const s = samples[Math.floor(hh(seed + 61 + k * 7) * samples.length) % samples.length];
    charBlotch(p, s.x + (hh(seed + 67 + k) - 0.5) * w * 0.24, s.y + (hh(seed + 71 + k) - 0.5) * w * 0.24, w * 0.4, w * 0.3, seed + 73 + k * 3, 0.38);
  }
};

/**
 * A flame mass with a RAGGED silhouette and a broken, mottled surface.
 * Two finishes:
 *  - gradient (the fireball): radial core glow clipped into the ragged
 *    outline, core sitting low, then char + mottle + rim/inner tongues.
 *  - flat (the fire FIGURE): layered offset blobs instead of concentric
 *    smooth shells — layer: -1 all, 0 silhouette+rim tongues, 1 inner blobs,
 *    2 hot patches + char + mottle. Drawing a chain of masses layer-by-layer
 *    merges them without ring seams at the overlaps.
 */
const flameMass = (p: Pen, cx: number, cy: number, rx: number, ry: number, seed: number, tongues = 5, tongueScale = 1, flat = false, layer = -1) => {
  const g = p.g;
  if (flat) {
    if (layer < 0 || layer === 0) {
      g.save(); g.filter = "blur(6px)"; g.globalAlpha = 0.5;
      p.path(blobPts(cx, cy, rx * 1.14, ry * 1.14, seed, 0.95), true); g.fillStyle = "#8f1c00"; g.fill();
      g.restore();
      fillBlob(p, cx, cy, rx, ry, seed, "#d94800", 1, 1);
      rimTongues(p, cx, cy, rx, ry, seed, tongues, tongueScale);
      innerTongues(p, cx, cy, rx, ry, seed, 0.16);
    }
    if (layer < 0 || layer === 1) {
      const cols = ["#f06400", "#ff7d0d", "#ff8f1a"];
      for (let j = 0; j < 3; j++) {
        const jx = (hh(seed + j * 7 + 21) - 0.5) * rx * 0.34, jy = (hh(seed + j * 11 + 23) - 0.5) * ry * 0.3 + ry * 0.05;
        fillBlob(p, cx + jx, cy + jy, rx * (0.66 - 0.11 * j), ry * (0.62 - 0.1 * j), seed + 20 + j * 7, cols[j], 0.95, 0.95);
      }
    }
    if (layer < 0 || layer === 2) {
      fillBlob(p, cx + (hh(seed + 41) - 0.5) * rx * 0.3, cy + ry * 0.24, rx * 0.34, ry * 0.3, seed + 43, "#ffc93f", 0.7, 0.9);
      fillBlob(p, cx + (hh(seed + 47) - 0.5) * rx * 0.36, cy + ry * 0.3, rx * 0.17, ry * 0.15, seed + 49, "#fff3b0", 0.5, 0.85);
      charBlotch(p, cx + (hh(seed + 53) - 0.5) * rx * 1.1, cy + (hh(seed + 59) - 0.5) * ry * 0.9, rx * 0.3, ry * 0.22, seed + 61, 0.45);
      charBlotch(p, cx + (hh(seed + 67) - 0.5) * rx * 1.2, cy + ry * (0.15 + 0.4 * hh(seed + 71)), rx * 0.22, ry * 0.17, seed + 73, 0.4);
      mottle(p, cx, cy, rx, ry, seed + 79, 12);
    }
    return;
  }
  // ---- fireball finish: gradient heart inside the ragged outline ----
  const gr = g.createRadialGradient(cx + rx * 0.05, cy + ry * 0.3, rx * 0.07, cx, cy, Math.max(rx, ry) * 1.12);
  gr.addColorStop(0, "#ffedb8"); gr.addColorStop(0.26, "#ffd23f"); gr.addColorStop(0.55, "#ff8a12");
  gr.addColorStop(0.8, "#e84900"); gr.addColorStop(1, "rgba(140,15,0,0.98)");
  p.path(blobPts(cx, cy, rx, ry, seed, 1.05), true); g.fillStyle = gr; g.fill();
  // soft dark-red churn patches low on the mass (blurred, no hard lines)
  g.save(); g.filter = "blur(9px)"; g.globalAlpha = 0.26; g.fillStyle = "#8f1c00";
  for (let i = 0; i < 3; i++) {
    const x = cx + (hh(seed + i * 31) - 0.5) * rx * 1.1, y = cy + ry * (0.3 + 0.22 * i);
    g.beginPath(); g.ellipse(x, y, rx * 0.3, ry * 0.15, 0.4 * (i - 1), 0, Math.PI * 2); g.fill();
  }
  g.restore();
  rimTongues(p, cx, cy, rx, ry, seed, Math.max(6, tongues + 2), tongueScale, 178, 362);
  innerTongues(p, cx, cy, rx, ry, seed, 0.26);
  charBlotch(p, cx + (hh(seed + 83) - 0.5) * rx * 1.15, cy + (hh(seed + 89) - 0.5) * ry * 0.8, rx * 0.3, ry * 0.2, seed + 97, 0.42);
  charBlotch(p, cx + (hh(seed + 101) - 0.5) * rx * 1.25, cy + ry * (0.1 + 0.35 * hh(seed + 103)), rx * 0.2, ry * 0.15, seed + 107, 0.38);
  mottle(p, cx, cy, rx, ry, seed + 109, 13);
  // bright heart, low in the mass, kept small and off-centre (fire cores sit low)
  const core = g.createRadialGradient(cx + rx * 0.05, cy + ry * 0.28, 2, cx + rx * 0.05, cy + ry * 0.28, rx * 0.44);
  core.addColorStop(0, "rgba(255,250,215,0.8)"); core.addColorStop(0.6, "rgba(255,214,64,0.4)"); core.addColorStop(1, "rgba(255,180,40,0)");
  g.beginPath(); g.ellipse(cx + rx * 0.05, cy + ry * 0.28, rx * 0.44, ry * 0.4, 0, 0, Math.PI * 2); g.fillStyle = core; g.fill();
};

/** embers: rising sparks around a centre, deterministic per seed */
const embers = (p: Pen, cx: number, cy: number, r: number, n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const a = hh(seed + i * 13) * Math.PI * 2, d = r * (0.55 + 0.75 * hh(seed + i * 29));
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.82 - hh(seed + i * 41) * r * 0.5;
    const rr = 2 + 4.5 * hh(seed + i * 53);
    p.dot(x, y, rr, i % 3 ? "#ffb02e" : "#ff7b00");
    if (hh(seed + i * 67) > 0.55) p.dot(x, y - rr * 2.2, rr * 0.45, "#ff8a12");
  }
};

/**
 * The fireball on a 700x700 canvas (centre 350,350, flame body r ~205).
 * face: 0 = pure flame, 1 = the attested faint face inside the flame (soft,
 * low-contrast amber shadow shapes — never a skull, never hard features).
 */
export const drawFireball = (p: Pen, opts: { face?: number; seed?: number } = {}) => {
  const { face = 0, seed = 3 } = opts, g = p.g, cx = 350, cy = 358;
  // painted halo (the sheet has no bloom pass; in scenes the soft material + bloom add more)
  const halo = g.createRadialGradient(cx, cy, 60, cx, cy, 345);
  halo.addColorStop(0, "rgba(255,120,26,0.5)"); halo.addColorStop(0.45, "rgba(255,80,10,0.22)"); halo.addColorStop(1, "rgba(255,60,0,0)");
  g.fillStyle = halo; g.fillRect(0, 0, 700, 700);
  flameMass(p, cx, cy, 198, 188, seed, 6);
  // side licks curling up the flanks + a low skirt of flame curling under the
  // ball (all wavy tongue shapes now — no smooth teardrops anywhere)
  fillTongue(p, cx - 128, cy + 62, -118, 118, 76, seed + 201, "#e84900", 0.88);
  fillTongue(p, cx - 128, cy + 62, -112, 84, 48, seed + 203, "#ff8a12", 0.9);
  fillTongue(p, cx + 138, cy + 50, -64, 128, 80, seed + 207, "#e84900", 0.88);
  fillTongue(p, cx + 138, cy + 50, -70, 90, 50, seed + 211, "#ff8a12", 0.9);
  fillTongue(p, cx - 58, cy + 138, 128, 74, 88, seed + 213, "#ff8a12", 0.8);
  fillTongue(p, cx + 62, cy + 132, 58, 64, 76, seed + 217, "#ffb02e", 0.8);
  if (face > 0) {
    // the faint face: big soft dark-amber hollows blurred deep into the core —
    // felt, not seen. No sharp eye dots, no pale mask shapes.
    g.save();
    g.filter = "blur(10px)";
    g.globalAlpha = 0.21 * face;
    g.fillStyle = "#7a1a00";
    const ey = cy - 18;
    g.beginPath(); g.ellipse(cx - 58, ey, 34, 21, -0.1, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 58, ey, 34, 21, 0.1, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 2, cy + 22, 12, 30, 0, 0, Math.PI * 2); g.fill(); // nose shadow
    g.beginPath(); g.ellipse(cx, cy + 78, 27, 11, 0, 0, Math.PI * 2); g.fill();     // mouth hollow
    g.restore();
  }
  embers(p, cx, cy, 215, 26, seed + 100);
};

/** soft radial glow (ground light pools + water reflection), 512x512, warm orange */
export const drawGlow = (p: Pen, inner = "rgba(255,140,40,0.85)") => {
  const g = p.g;
  const gr = g.createRadialGradient(256, 256, 8, 256, 256, 252);
  gr.addColorStop(0, inner); gr.addColorStop(0.4, "rgba(255,100,16,0.38)"); gr.addColorStop(1, "rgba(255,70,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
};

/** IRREGULAR fire-glow for the halo card behind the figure (512x512): a
 *  cluster of jittered soft blobs, stretched upward like rising heat — never
 *  the flat red disc a single radial gradient makes at scene scale. */
export const drawFireGlow = (p: Pen) => {
  const g = p.g;
  const blob = (x: number, y: number, r: number, col: string, a: number) => {
    const gr = g.createRadialGradient(x, y, 2, x, y, r);
    gr.addColorStop(0, col.replace("A", String(a))); gr.addColorStop(1, col.replace("A", "0"));
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // wide faint wash, broken into offset lobes
  for (let i = 0; i < 9; i++) {
    const a = hh(i * 13 + 3) * Math.PI * 2, d = 30 + hh(i * 17 + 5) * 95;
    blob(256 + Math.cos(a) * d, 262 + Math.sin(a) * d * 1.15, 120 + hh(i * 19 + 7) * 110, "rgba(255,96,14,A)", 0.16 + 0.1 * hh(i * 23 + 9));
  }
  // hotter core cluster, sitting low-centre
  for (let i = 0; i < 6; i++) {
    const a = hh(i * 29 + 11) * Math.PI * 2, d = hh(i * 31 + 13) * 55;
    blob(256 + Math.cos(a) * d, 278 + Math.sin(a) * d * 0.8, 62 + hh(i * 37 + 15) * 60, "rgba(255,140,36,A)", 0.22 + 0.12 * hh(i * 41 + 17));
  }
  blob(256, 286, 74, "rgba(255,178,64,A)", 0.3);
  // radial window: force alpha to zero at the canvas borders so the halo
  // CARD's edge can never show as a rectangle against the night
  g.save(); g.globalCompositeOperation = "destination-out";
  const win = g.createRadialGradient(256, 256, 140, 256, 256, 254);
  win.addColorStop(0, "rgba(0,0,0,0)"); win.addColorStop(1, "rgba(0,0,0,1)");
  g.fillStyle = win; g.fillRect(0, 0, 512, 512);
  g.restore();
};

/** dawn shimmer for the gentong water: a faint warm sheen with a few bright glints, 512x512 */
export const drawShimmer = (p: Pen) => {
  const g = p.g;
  const gr = g.createRadialGradient(256, 256, 10, 256, 256, 250);
  gr.addColorStop(0, "rgba(255,170,80,0.34)"); gr.addColorStop(0.6, "rgba(255,140,60,0.13)"); gr.addColorStop(1, "rgba(255,120,50,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9; i++) {
    const x = 90 + hh(i * 17 + 5) * 330, y = 120 + hh(i * 29 + 9) * 260, w = 14 + hh(i * 43) * 30;
    p.stroke([[x - w, y], [x + w, y]], 3.2, "rgba(255,214,150,0.75)");
  }
};

/**
 * The mouth flame-tongue: a CLUSTER of wavy flame tongues jetting down (and
 * leaning lean) — side tongues shorter, core tongues layered deep red ->
 * orange -> yellow, char flecks at the lip. Reads as flickering fire pouring
 * from the mouth, never as one smooth banana/leaf shape.
 */
const flameJet = (p: Pen, x: number, y: number, len: number, w: number, lean: number, seed: number) => {
  const ang = deg(Math.atan2(len, lean));
  const tong = (angOff: number, lenK: number, wK: number, col: string, al: number, sd: number) =>
    fillTongue(p, x, y, ang + angOff, len * lenK, w * wK, sd, col, al);
  // tongues stay near-parallel and overlapping (spread spikes read as claws);
  // the flicker comes from staggered lengths, not fanned directions
  tong(-9, 0.85, 0.9, "#c93a00", 0.9, seed + 1);
  tong(8, 0.92, 0.95, "#c93a00", 0.9, seed + 2);
  tong(0, 1.0, 1.15, "#f06400", 0.95, seed + 3);
  tong(-4, 0.8, 0.68, "#ff9a1f", 0.95, seed + 4);
  tong(3, 0.58, 0.42, "#ffc93f", 0.9, seed + 5);
  tong(0, 0.36, 0.22, "#ffe9a8", 0.7, seed + 6);
  charBlotch(p, x - w * 0.22, y + 3, w * 0.24, w * 0.13, seed + 7, 0.35);
  charBlotch(p, x + w * 0.24, y + 5, w * 0.18, w * 0.1, seed + 8, 0.3);
};

/** final weathering pass over the whole figure: char at the joints and
 *  mottling across the big masses, so separately-painted segments read as
 *  ONE burning body instead of stacked balloons. */
const weatherFigure = (p: Pen, side: boolean) => {
  const seed = 300;
  const chars: [number, number, number, number, number][] = side
    ? [[318, 452, 44, 30, 0.4], [286, 566, 30, 42, 0.38], [352, 648, 32, 24, 0.36], [382, 726, 24, 32, 0.4], [330, 262, 24, 34, 0.34], [376, 806, 26, 20, 0.36]]
    : [[300, 446, 48, 30, 0.4], [256, 566, 30, 44, 0.38], [352, 646, 34, 25, 0.36], [266, 736, 26, 34, 0.4], [252, 252, 25, 32, 0.34], [330, 806, 28, 20, 0.36]];
  for (let i = 0; i < chars.length; i++) { const [x, y, rx, ry, a] = chars[i]; charBlotch(p, x, y, rx, ry, seed + i * 13, a); }
  mottle(p, side ? 312 : 300, 528, 78, 148, seed + 101, 16);
  mottle(p, side ? 408 : 296, 766, 52, 58, seed + 131, 8);
  mottle(p, side ? 330 : 300, 238, 66, 138, seed + 163, 10);
};

/**
 * The inverted burning figure on the standard 600x1000 body canvas — but the
 * "soles" at the canvas bottom are its HANDS (it walks on them); head hangs
 * below the shoulders near the ground, legs point at the sky. side=false draws
 * the front view, side=true a profile (head forward, mouth-tongue jetting
 * down-forward). The whole body is flame: ragged blob masses + blob-chain
 * limbs, tongues licking up off every part, char and mottle over all. No ink
 * outline — fire has no contour; the deep-red fringe keeps the silhouette
 * readable against the dark.
 */
export const drawFireFigure = (p: Pen, side = false) => {
  const seed = 8, g = p.g;
  // The hanging head is a 180-degree face: from the neck (top, at the shoulders)
  // down — mouth, nose, eyes, forehead, crown at the ground. The face painter
  // below follows that order; the mouth jet spills from the mouth down past it.
  const faceInverted = (hx: number, hy: number, s: number) => {
    g.save(); g.filter = "blur(5px)"; g.globalAlpha = 0.3; g.fillStyle = "#8a1e00";
    g.beginPath(); g.ellipse(hx, hy - 30 * s, 15 * s, 8 * s, 0, 0, Math.PI * 2); g.fill();        // mouth hollow (neck side)
    g.beginPath(); g.ellipse(hx - 24 * s, hy + 22 * s, 14 * s, 9 * s, 0, 0, Math.PI * 2); g.fill(); // eyes (ground side)
    g.beginPath(); g.ellipse(hx + 24 * s, hy + 22 * s, 14 * s, 9 * s, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  };
  if (!side) {
    // far limbs (bent chains), then the connected torso chain in FLAT masses
    // (layered passes merge them into one silhouette), near limbs, feet/hands,
    // and the head LAST so the face reads in front of the arms.
    flameLimb(p, [[276, 388], [248, 238], [266, 92]], 62, seed + 51);   // far leg: hip -> bent knee -> ankle
    flameLimb(p, [[248, 632], [222, 792], [240, 950]], 60, seed + 53);  // far arm: shoulder -> elbow -> hand
    // torso chain in 3 layer passes so the masses merge without ring seams
    const chainF: [number, number, number, number, number, number, number][] = [
      [300, 418, 94, 108, seed, 3, 0.5], [300, 528, 90, 122, seed + 1, 2, 0.45], [300, 634, 99, 56, seed + 2, 0, 1]];
    for (const L of [0, 1, 2]) for (const m of chainF) flameMass(p, m[0], m[1], m[2], m[3], m[4], m[5], m[6], true, L);
    flameLimb(p, [[324, 384], [356, 218], [334, 78]], 66, seed + 57);   // near leg
    flameLimb(p, [[362, 628], [404, 790], [392, 950]], 64, seed + 59);  // near arm (swung wide of the head)
    flameMass(p, 334, 70, 21, 31, seed + 3, 2, 0.8, true);              // foot flames at the ankles (top)
    flameMass(p, 266, 88, 19, 28, seed + 4, 2, 0.8, true);
    flameMass(p, 392, 950, 25, 18, seed + 5, 0, 1, true);               // hand flames on the ground
    flameMass(p, 240, 950, 24, 17, seed + 6, 0, 1, true);
    flameMass(p, 296, 770, 73, 81, seed + 7, 2, 0.5, true);             // the hanging head
    faceInverted(296, 770, 1);
    // THE mouth tongue: a flickering cluster of flame jetting down past the face
    flameJet(p, 306, 736, 165, 54, 48, seed + 21);
    weatherFigure(p, false);
    embers(p, 300, 480, 260, 22, seed + 40);
    return;
  }
  // ---- profile: walks toward screen-right, head low at the front ----
  flameLimb(p, [[292, 392], [352, 252], [446, 100]], 60, seed + 51);   // far leg (up-back, bent)
  flameLimb(p, [[262, 636], [248, 796], [262, 950]], 58, seed + 53);   // far arm
  const chainS: [number, number, number, number, number, number, number][] = [
    [306, 424, 90, 104, seed, 3, 0.5], [310, 530, 87, 120, seed + 1, 2, 0.45], [322, 636, 95, 55, seed + 2, 0, 1]];
  for (const L of [0, 1, 2]) for (const m of chainS) flameMass(p, m[0], m[1], m[2], m[3], m[4], m[5], m[6], true, L);
  flameLimb(p, [[322, 388], [366, 228], [398, 74]], 64, seed + 57);    // near leg (up-forward, bent)
  flameLimb(p, [[348, 630], [368, 794], [360, 950]], 62, seed + 59);   // near arm (behind the head)
  flameMass(p, 400, 70, 20, 29, seed + 3, 2, 0.8, true);               // foot flames
  flameMass(p, 448, 96, 19, 27, seed + 4, 2, 0.8, true);
  flameMass(p, 360, 950, 24, 17, seed + 5, 0, 1, true);                // hand flames
  flameMass(p, 262, 950, 23, 16, seed + 6, 0, 1, true);
  flameMass(p, 408, 770, 69, 77, seed + 7, 2, 0.5, true);              // head, low at front
  faceInverted(414, 764, 0.92);
  // mouth tongue jetting down-forward from the inverted mouth
  flameJet(p, 428, 734, 145, 50, 54, seed + 31);
  weatherFigure(p, true);
  embers(p, 320, 480, 250, 20, seed + 40);
};

/** scorch-free ground truth check helper: a few blades of grass, unburnt (used in scene dressing only) */
export const FIRE_INK = INK;
export const fireMul = mul;
export const fireMix = mix;
