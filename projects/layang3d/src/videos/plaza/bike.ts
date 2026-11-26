// The test scene's one moving character: a kid pedalling a bicycle, drawn side-on with the template's
// Pen API on the standard 600 x 1000 design canvas (wheel bottoms on the y = 975 ground line).
// Original drawing for this test (not from the bridge short): red bike, orange-jacket kid with a red
// cap (the template's KID outfit colours). Pedal/wheel phase is quantized so the Pool caches a
// small set of canvases that cycle.
import { Pen, INK, SKIN, blobPts, headBlob, thickAngle, mul, mix, KID } from "./toon";

type P2 = [number, number];
const LIGHT = (-120 * Math.PI) / 180; // the template's default key-light canvas angle
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** two-bone IK, knee bending forward (+x), same construction as toon.ts bodySide */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

const FRAME = "#c23b32"; // bike red
const RW: P2 = [200, 880], FW: P2 = [420, 880], WR = 95; // wheel centres + radius
const CRANK: P2 = [318, 878], CR = 40;                    // crank centre + radius
const SEAT: P2 = [292, 736], HEAD_T: P2 = [406, 760], GRIP: P2 = [416, 738];
const HIP: P2 = [296, 712], SHO: P2 = [370, 584], HC: P2 = [400, 500]; // kid: hip, shoulder, head centre (chin tucks into the torso top)

const wheel = (p: Pen, c: P2, spokeA: number) => {
  p.ell(c[0], c[1], WR, WR, null, 17);                    // tyre (ink ring)
  p.ell(c[0], c[1], WR - 16, WR - 16, null, 4);           // rim
  for (let i = 0; i < 6; i++) {
    const a = spokeA + (i * Math.PI) / 3;
    p.stroke([c, [c[0] + (WR - 18) * Math.cos(a), c[1] + (WR - 18) * Math.sin(a)]], 3.5, "#8d949c");
  }
  p.dot(c[0], c[1], 10, "#5a5f6a");
};
const tube = (p: Pen, a: P2, b: P2, w = 11) => p.band([a, b], FRAME, w, 2.5, "round");

const leg = (p: Pen, pedal: P2, col: string, w: number) => {
  const ank: P2 = [pedal[0], pedal[1] - 13];
  const knee = ik(HIP, ank, 104, 104);
  p.stroke([HIP, knee, ank], w, col);
  p.stroke([[ank[0] - 7, ank[1]], [ank[0] + 17, ank[1] + 2]], 10, INK);        // shoe sole
  p.stroke([[ank[0] - 5, ank[1] - 4], [ank[0] + 15, ank[1] - 2]], 8, "#f4f1ea"); // white trainer
};
const arm = (p: Pen, elbow: P2, col: string, w: number) => {
  p.stroke([SHO, elbow, GRIP], w, col);
  p.dot(GRIP[0], GRIP[1], 8.5, SKIN);
};

/** phase = pedal angle (rad, clockwise on screen); wheelA = wheel spoke angle (rad); blink swaps the eye for a lid line */
export const drawBikeKid = (p: Pen, phase: number, wheelA: number, blink: boolean) => {
  const o = KID, skin = o.skin ?? SKIN;
  const nearPedal: P2 = [CRANK[0] + CR * Math.cos(phase), CRANK[1] + CR * Math.sin(phase)];
  const farPedal: P2 = [CRANK[0] - CR * Math.cos(phase), CRANK[1] - CR * Math.sin(phase)];
  // far side first: far crank arm + far leg (behind the frame)
  p.stroke([CRANK, farPedal], 7, "#7a7f88");
  leg(p, farPedal, mix(o.pants, INK, 0.72), 13);
  // wheels + frame
  wheel(p, RW, wheelA); wheel(p, FW, wheelA);
  tube(p, RW, [296, 744]); tube(p, RW, CRANK, 9); tube(p, CRANK, [296, 744]);   // rear triangle + seat tube
  tube(p, CRANK, HEAD_T); tube(p, [296, 748], [402, 756]);                     // down + top tube
  tube(p, HEAD_T, FW);                                                          // fork
  p.band([[300, 748], [290, 728]], "#5a5f6a", 8, 2, "round");                   // seat post
  p.ell(284, 724, 26, 9, INK, 0);                                               // saddle
  p.band([HEAD_T, [412, 736]], "#5a5f6a", 8, 2, "round");                       // stem
  p.band([[398, 730], [428, 734]], "#3a3f47", 9, 2, "round");                   // handlebar
  p.dot(CRANK[0], CRANK[1], 11, "#5a5f6a");                                     // chainring
  p.stroke([CRANK, nearPedal], 7, "#3a3f47");                                   // near crank arm
  // far arm (behind the torso)
  arm(p, [398, 662], mix(o.jacket, INK, 0.68), 12);
  // torso: bean leaning forward over the hip
  const T = { a: 80, b: 88, nTop: 2.2, nBot: 2.5, egg: 0.08, asym: 0.05, rot: -0.38, noise: 0.006, seed: 11 };
  const tp = blobPts(332, 650, T);
  p.gradFill(tp, o.jacket, mul(o.jacket, [0.64, 0.66, 0.74]), LIGHT);
  p.inkRing(tp, 9, thickAngle(LIGHT));
  // near leg over the frame, then near arm over the torso
  leg(p, nearPedal, o.pants, 15);
  arm(p, [410, 668], mix(o.jacket, INK, 0.5), 13);
  // head: bean, shaded crescent, thick-thin ink ring
  const H = { ...headBlob(3, 90, 1), asym: 0.12 };
  const hp = blobPts(HC[0], HC[1], H);
  p.shadedFill(hp, skin, mul(skin, [0.96, 0.86, 0.84]), LIGHT, H.a);
  p.inkRing(hp, 9, thickAngle(LIGHT));
  // face, side view looking +x: eye (or blink lid), nose bump is in the blob asym, smile arc
  if (blink) p.stroke([[HC[0] + 30, HC[1] - 4], [HC[0] + 48, HC[1] - 4]], 5, INK);
  else p.dot(HC[0] + 39, HC[1] - 6, 7.5, INK);
  p.arc(HC[0] + 26, HC[1] + 16, 22, 17, 25, 105, 5, "#5a1e28");
  // red cap: crown half-disc + brim toward +x
  p.ell(HC[0] - 2, HC[1] - 14, 86, 70, o.cap!, 0, 180, 360);
  p.band([[HC[0] + 48, HC[1] - 40], [HC[0] + 116, HC[1] - 30]], o.cap!, 13, 3, "round");
  p.dot(HC[0] - 2, HC[1] - 84, 9, mix(o.cap!, INK, 0.25));
};
