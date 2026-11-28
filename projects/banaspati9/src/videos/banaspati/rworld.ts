// Ep.9 REWORK world (v2 visual, per SHOTPLAN.md) — the episode set rebuilt
// for the user's verdict on v1: night must be PHONE-READABLE bright,
// surroundings must occupy a real share of every frame, groups staged in
// space. Changes vs eworld.ts: set palette lifted ~a stop, extra dressing
// (porch dirt apron, road fence, kali stepping stones, extended grass,
// far-bank trees, a visible moon), a much brighter night rig, gentler
// night wash on the cards, and a stills staging table (10 key stills)
// instead of the episode timeline. Character/fire designs unchanged.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../layang/build";
import { beam } from "../layang/paint";
import { Pen, bodyFront, bodySide, fxRing, fxSplash, fxContact } from "../layang/toon";
import { TONE, CHAR, untone } from "../layang/shade";
import { NOINK } from "../layang/ink";
import { Pool, Actor, Fx, SU } from "../layang/cards";
import { drawFireball, drawFireFigure, drawGlow, drawFireGlow, drawShimmer } from "./fire";
import { RENDI, KARSO, TONO, SEED_RENDI, SEED_KARSO, SEED_TONO, nightWash, dawnWash, tonoFront, karsoFront } from "./cast9";
import { rendiSenterFront, rendiFrozen, rendiThrowSide, lidAt9 } from "./cast9ep";
import { deckY, ActorState } from "./story9";

const hh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const bodyGeo = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();

type SkyStops = { c: string[]; e: number[] };
// night sky lifted: moonlit blue, not near-black
const SKY_NIGHT: SkyStops = { c: ["#1a2a4a", "#20365e", "#2a467a", "#38548c", "#4a6ca6"], e: [0, 4, 10, 20, 40] };
const SKY_DUSK: SkyStops = { c: ["#2c2a4e", "#4e3450", "#8a4c46", "#c97a4c", "#e09a58"], e: [0, 4, 10, 20, 40] };

export type StillCam = { pos: [number, number, number]; look: [number, number, number]; fov: number; focus: [number, number, number]; cInf: number; phase: "night" | "dusk" };

const A = (x: number, z: number, pose: ActorState["pose"], expr: string, extra: Partial<ActorState> = {}): ActorState =>
  ({ x, y: 0, z, pose, expr, mirror: false, scale: 1, phase: 0, ...extra });
const PORCH = { karso: { x: -3.6, z: -0.7 }, rendi: { x: -2.1, z: -0.15 }, tono: { x: -5.05, z: -0.3 } };
const WAIT = { x: 0.3, z: -1.5 };
// Reveal-still staging experiment (28 Nov): the front fire figure reads as
// a "pilar api" frozen; the profile draw separates legs-up/head-low far
// better. REVEAL_SIDE picks which variant still 6 stages; the halo behind
// the figure is also shrunk either way so the limb gaps stay dark.
// VERDICT 28 Nov: profile chosen for the gate still (diagonal legs-up line
// + low head-jet break the column); front kept as still-6-alt-front.jpg.
// Even the profile still reads pillar-leaning frozen — the gait in motion
// has to finish the read. Do not treat either as a solved silhouette.
const REVEAL_SIDE = true;
const WATER_POS = { x: 1.55, y: -1.12, z: 5.15 };

export class ReworkWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private rendi: Actor; private karso: Actor; private tono: Actor; private figure: Actor;
  private fxBall: Fx; private fxHalo: Fx; private fxPool: Fx; private fxRingFx: Fx; private fxSplashFx: Fx; private fxShim: Fx;
  private fxLamp: Fx; private fxLampPool: Fx; private fxBlob: Fx;
  private hemi: THREE.HemisphereLight; private moon: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#18263f", 30, 190);
  private embers: THREE.Points; private emberPos: THREE.BufferAttribute;
  private refl: THREE.Mesh;
  focus: [number, number, number] = [0, 1.4, 4];
  cInf = 4;

  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    sky.renderOrder = -1; sky.frustumCulled = false; sky.layers.set(NOINK); sky.name = "sky";
    R.add(sky);
    const starGeo = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 420; i++) {
      const a = hh(i * 3) * Math.PI * 2, e = 0.12 + hh(i * 7) * 1.35, r = 520;
      sp.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#cdd8ff", size: 1.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.7 }));
    stars.layers.set(NOINK); stars.name = "stars"; R.add(stars);
    // a visible moon — the brightness has a source the eye believes
    const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(26, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.82, 0.88, 1.0), fog: false }));
    moonDisc.position.set(-330, 350, -560); moonDisc.lookAt(0, 0, 0);
    moonDisc.layers.set(NOINK); moonDisc.name = "moon"; R.add(moonDisc);
    this.hemi = new THREE.HemisphereLight("#46609c", "#1c1712", 1.55);
    this.moon = new THREE.DirectionalLight("#aebfff", 1.35);
    this.moon.castShadow = true;
    this.moon.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.moon, this.moon.target);
    // ---- terrain + set: eworld layout, palette lifted, extra dressing ----
    const b = new Batch();
    const ground = lam("r9Ground", () => ({ color: "#243828" }));
    const dirt = lam("r9Dirt", () => ({ color: "#44331f" }));
    const earth = lam("r9Earth", () => ({ color: "#352818" }));
    const waterM = lam("r9Water", () => ({ color: "#1b4470" }));
    const bamboo = lam("r9Bamboo", () => ({ color: "#9a7f4c" }));
    const bambooD = lam("r9BambooD", () => ({ color: "#776138" }));
    const trunkM = lam("r9Trunk", () => ({ color: "#42301f" }));
    const leafM = lam("r9Leaf", () => ({ color: "#2c5139" }));
    const leafM2 = lam("r9Leaf2", () => ({ color: "#24452f" }));
    const wood = lam("r9Wood", () => ({ map: beam() }));
    const clay = lam("r9Clay", () => ({ color: "#8f6244" }));
    b.add(boxGeo(V(-60, -0.4, -40), V(60, 0, 3.0), 1), ground);
    b.add(boxGeo(V(-60, -0.4, 7.4), V(60, 0, 40), 1), ground);
    b.add(boxGeo(V(-1.7, -0.38, -26), V(1.7, 0.015, 3.0), 1), dirt);
    b.add(boxGeo(V(-6.6, -0.39, -1.9), V(-0.9, 0.012, 0.9), 1), dirt); // porch apron
    b.add(boxGeo(V(-60, -0.55, 3.0), V(60, 0, 3.35), 1), earth);
    b.add(boxGeo(V(-60, -0.55, 7.05), V(60, 0, 7.4), 1), earth);
    b.add(boxGeo(V(-60, -0.62, 3.0), V(60, -0.5, 7.4), 1), waterM);
    b.add(boxGeo(V(-60, -1.4, 3.0), V(60, -0.6, 7.4), 1), earth);
    for (let z = 1.35; z <= 9.05; z += 0.31) {
      const y = deckY(z);
      b.add(boxGeo(V(-1.15, y - 0.07, z - 0.14), V(1.15, y, z + 0.14), 1), (Math.round(z * 10) % 2) ? bamboo : bambooD);
    }
    for (const sx of [-0.95, 0.95]) {
      for (let z = 1.5; z <= 8.9; z += 1.45) {
        const y = deckY(z);
        b.add(boxGeo(V(sx - 0.045, y, z - 0.045), V(sx + 0.045, y + 0.95, z + 0.045), 1), bambooD);
      }
      for (let z = 1.5; z < 8.9; z += 1.45) {
        const y0 = deckY(z) + 0.95, y1 = deckY(z + 1.45) + 0.95, ym = (y0 + y1) / 2;
        b.add(boxGeo(V(sx - 0.04, ym - 0.045, z), V(sx + 0.04, ym + 0.045, z + 1.45), 1), bamboo);
      }
    }
    const tree = (x: number, z: number, s: number, lm: THREE.Material) => {
      const tg = new THREE.CylinderGeometry(0.14 * s, 0.26 * s, 2.6 * s, 7); tg.translate(0, 1.3 * s, 0);
      b.add(tg, trunkM, new THREE.Matrix4().makeTranslation(x, 0, z));
      const lobes: [number, number, number, number][] = [[0, 3.4, 0, 1.7], [1.0, 2.8, 0.3, 1.2], [-0.95, 2.9, -0.3, 1.15], [0.2, 4.2, -0.4, 1.1]];
      for (const [lx, ly, lz, r] of lobes) { const sg = new THREE.SphereGeometry(r * s, 16, 12); b.add(sg, lm, new THREE.Matrix4().makeTranslation(x + lx * s, ly * s, z + lz * s)); }
    };
    tree(-6.2, -4.5, 1.25, leafM); tree(5.8, -6.5, 1.4, leafM2); tree(-7.5, 13.5, 1.3, leafM);
    tree(6.4, 12.0, 1.15, leafM); tree(-8.5, 2.0, 1.05, leafM2); tree(8.6, -0.5, 1.2, leafM);
    tree(0.5, 14.5, 1.7, leafM2); tree(-11, -9, 1.5, leafM); tree(11.5, -10, 1.45, leafM2);
    tree(-4.2, 17.5, 1.35, leafM); tree(4.8, 19, 1.5, leafM2); tree(-9.5, 9.5, 1.1, leafM2);
    const clump = (x: number, z: number) => {
      for (let i = 0; i < 6; i++) {
        const px = x + (hh(i * 7) - 0.5) * 0.9, pz = z + (hh(i * 13) - 0.5) * 0.9, h = 5.4 + hh(i * 19) * 1.6;
        const cg = new THREE.CylinderGeometry(0.05, 0.07, h, 6); cg.translate(0, h / 2, 0);
        b.add(cg, bambooD, new THREE.Matrix4().makeTranslation(px, 0, pz));
        const sg = new THREE.SphereGeometry(0.85, 12, 9); sg.scale(1.3, 0.6, 1.3);
        b.add(sg, leafM, new THREE.Matrix4().makeTranslation(px, h - 0.2, pz));
      }
    };
    clump(-5.2, 8.6); clump(6.2, -2.2); clump(-4.4, -7.5); clump(3.6, 13.2); clump(-6.8, -1.5);
    for (const [x, z, r] of [[-2.8, -2.5, 0.7], [3.1, 0.8, 0.85], [-3.2, 5.9, 0.6], [2.9, 9.8, 0.75], [-3.4, -6.8, 0.65], [3.6, -8.8, 0.7]] as const) {
      const sg = new THREE.SphereGeometry(r, 12, 9); sg.scale(1, 0.7, 1);
      b.add(sg, leafM2, new THREE.Matrix4().makeTranslation(x, r * 0.45, z));
    }
    b.add(boxGeo(V(-7.6, 0, -2.45), V(-0.9, 2.6, -2.2), 1), wood);
    const roofM = new THREE.Matrix4().makeRotationX(0.5).setPosition(-4.25, 3.15, -2.1);
    b.add(boxGeo(V(-3.6, -0.06, -1.5), V(3.6, 0.06, 1.5), 1, true), lam("r9Roof", () => ({ color: "#5f4b31" })), roofM);
    b.add(boxGeo(V(-3.1, 0, -2.19), V(-2.0, 1.9, -2.16), 1), lam("r9Door", () => ({ color: "#2e2011" })));
    const lampM = lam("r9LampPost", () => ({ color: "#4a4034" }));
    const lp = new THREE.CylinderGeometry(0.045, 0.055, 2.3, 7); lp.translate(0, 1.15, 0);
    b.add(lp, lampM, new THREE.Matrix4().makeTranslation(-2.7, 0, -1.15));
    b.add(boxGeo(V(-2.82, 2.28, -1.27), V(-2.58, 2.52, -1.03), 1), lampM);
    // fence along the road's west edge — foreground layer + geography line
    const fenceM = lam("r9Fence", () => ({ color: "#5d4a30" }));
    for (let z = -12; z <= -3.2; z += 1.45) {
      const fp = new THREE.CylinderGeometry(0.04, 0.05, 0.95, 6); fp.translate(0, 0.47, 0);
      b.add(fp, fenceM, new THREE.Matrix4().makeTranslation(-2.15, 0, z));
    }
    for (const ry of [0.42, 0.78]) b.add(boxGeo(V(-2.19, ry - 0.03, -12.2), V(-2.11, ry + 0.03, -3.0), 1), fenceM);
    // stepping stones across the kali, west of the bridge
    const stoneM = lam("r9Stone", () => ({ color: "#5c6066" }));
    for (const [sx, sz] of [[-3.4, 4.1], [-3.9, 5.2], [-3.3, 6.3]] as const) {
      const sg = new THREE.CylinderGeometry(0.42, 0.5, 0.16, 9); sg.translate(0, 0.08, 0);
      b.add(sg, stoneM, new THREE.Matrix4().makeTranslation(sx, -0.52, sz));
    }
    // grass tufts: both road edges + far bank (L21's unburned grass, readable)
    const grassM = lam("r9Grass", () => ({ color: "#356b38" }));
    const tuftG = new THREE.ConeGeometry(0.09, 0.42, 5); tuftG.translate(0, 0.21, 0);
    let gi = 0;
    for (let z = -12; z <= 1.5; z += 0.55) for (const gx of [1.3, 1.6, -1.95]) {
      gi++;
      b.add(tuftG, grassM, new THREE.Matrix4().makeTranslation(gx + (hh(gi * 7) - 0.5) * 0.2, 0, z + (hh(gi * 13) - 0.5) * 0.3));
    }
    for (let x = -6; x <= 6; x += 0.8) { gi++; b.add(tuftG, grassM, new THREE.Matrix4().makeTranslation(x + (hh(gi * 7) - 0.5) * 0.3, 0, 8.1 + (hh(gi * 13) - 0.5) * 0.4)); }
    const pts: THREE.Vector2[] = [[0.01, 0], [0.24, 0], [0.35, 0.1], [0.43, 0.38], [0.41, 0.62], [0.30, 0.78], [0.31, 0.86], [0.36, 0.9], [0.37, 0.95]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    const jar = new THREE.LatheGeometry(pts, 22);
    b.add(jar, clay, new THREE.Matrix4().makeTranslation(0.55, 0, 0.2));
    const wdisc = new THREE.CircleGeometry(0.28, 22); wdisc.rotateX(-Math.PI / 2);
    b.add(wdisc, lam("r9JarWater", () => ({ color: "#2c4c6e" })), new THREE.Matrix4().makeTranslation(0.55, 0.87, 0.2));
    b.build(R);
    const glowTex = (() => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 512;
      const g = cv.getContext("2d")!;
      drawGlow(new Pen(g));
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    this.refl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 4.2),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0.30, 0.20, 0.11), fog: false }));
    this.refl.rotation.x = -Math.PI / 2; this.refl.position.set(0, -0.46, 5.2);
    this.refl.layers.set(NOINK); this.refl.visible = false; R.add(this.refl);
    const eg = new THREE.BufferGeometry();
    this.emberPos = new THREE.BufferAttribute(new Float32Array(90 * 3), 3);
    eg.setAttribute("position", this.emberPos);
    this.embers = new THREE.Points(eg, new THREE.PointsMaterial({ map: glowTex, color: "#ffa030", size: 0.055, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    this.embers.layers.set(NOINK); this.embers.frustumCulled = false; R.add(this.embers);
    this.rendi = new Actor(R, bodyGeo); this.karso = new Actor(R, bodyGeo); this.tono = new Actor(R, bodyGeo);
    this.figure = new Actor(R, bodyGeo);
    this.fxBall = new Fx(R); this.fxHalo = new Fx(R); this.fxPool = new Fx(R);
    this.fxRingFx = new Fx(R); this.fxSplashFx = new Fx(R); this.fxShim = new Fx(R);
    this.fxLamp = new Fx(R); this.fxLampPool = new Fx(R); this.fxBlob = new Fx(R);
  }

  private stageActor(a: Actor, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, camX: number, camZ: number, mirror: boolean, s = 1) {
    a.r = this.pool.req(key, 1080, 1800, 1.8, draw);
    a.mesh.visible = true;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.set(0, Math.atan2(camX - x, camZ - z), 0);
    a.mesh.scale.set(mirror ? -s : s, s, s);
  }
  private stageFx(fx: Fx, key: string, cw: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, hdr: [number, number, number], flat = false, rotZ = 0) {
    fx.r = this.pool.req(key, cw, cw, 1, draw);
    fx.use(true);
    fx.mesh.visible = true;
    fx.mesh.position.set(x, y, z);
    fx.mesh.rotation.set(flat ? -Math.PI / 2 : 0, 0, rotZ);
    fx.mesh.scale.set(w, h, 1);
    fx.soft.color.setRGB(...hdr);
  }
  private blob(x: number, z: number, w: number, y = 0.03) {
    this.fxBlob.r = this.pool.req("blob|contact|#141a16", 128, 128, 1, (p) => fxContact(p, "#141a16"));
    this.fxBlob.use(false);
    this.fxBlob.mesh.visible = true;
    this.fxBlob.mesh.position.set(x, y, z);
    this.fxBlob.mesh.rotation.set(-Math.PI / 2, 0, 0);
    this.fxBlob.mesh.scale.set(w, w * 0.85, 1);
  }
  private embersAround(cx: number, cy: number, cz: number, r: number) {
    for (let i = 0; i < 90; i++) {
      const a = hh(i * 3 + 1) * Math.PI * 2, d = r * (0.4 + hh(i * 7 + 2) * 0.9);
      this.emberPos.setXYZ(i, cx + Math.cos(a) * d, cy + (hh(i * 11 + 3) - 0.35) * r * 1.3, cz + Math.sin(a) * d * 0.7);
    }
    this.emberPos.needsUpdate = true;
    this.embers.visible = true;
  }

  private lightRig(phase: "night" | "dusk", pos: number[], look: number[]) {
    const stars = this.root.getObjectByName("stars");
    const moonDisc = this.root.getObjectByName("moon");
    if (phase === "night") {
      // REWORK night: moonlit-clear. Ambient/moon up well over a stop vs
      // v1, shade floor high — faces/sets/ground readable on a phone.
      this.hemi.color.set("#46609c"); this.hemi.groundColor.set("#1c1712"); this.hemi.intensity = 1.15;
      this.moon.color.set("#aebfff"); this.moon.intensity = 1.1;
      this.moon.position.set(pos[0] - 26, 34, pos[2] - 20); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(0.88, 0.95, 1.18); TONE.uShadeCol.value.set(0.27, 0.32, 0.5); TONE.uShadeLift.value.set(0.08, 0.09, 0.13);
      TONE.uLambert.value = 0.45; TONE.uSideK.value = 0.85; TONE.uTerm.value = 0.3; TONE.uBounce.value.set(0.03, 0.03, 0.04); TONE.uSat.value = 1.0;
      CHAR.uCharTint.value.set(1.06, 1.09, 1.18); CHAR.uCharShade.value = 0.72; CHAR.uGrad.value = 0.06;
      CHAR.uBodyGrad.value = 0.16; CHAR.uSideTint.value.set(0.9, 0.95, 1.18);
      this.fog.color.set("#18263f"); this.fog.near = 30; this.fog.far = 190;
      const su = this.skyMat.uniforms;
      SKY_NIGHT.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_NIGHT.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
      if (stars) stars.visible = true;
      if (moonDisc) moonDisc.visible = true;
    } else {
      this.hemi.color.set("#6a5a7c"); this.hemi.groundColor.set("#1a130e"); this.hemi.intensity = 1.0;
      this.moon.color.set("#ffb37a"); this.moon.intensity = 1.2;
      this.moon.position.set(pos[0] + 24, 9, pos[2] - 10); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(1.1, 0.85, 0.55); TONE.uShadeCol.value.set(0.26, 0.28, 0.46); TONE.uShadeLift.value.set(0.06, 0.06, 0.10);
      TONE.uLambert.value = 0.45; TONE.uSideK.value = 0.85; TONE.uTerm.value = 0.3; TONE.uBounce.value.set(0.03, 0.015, 0); TONE.uSat.value = 1.0;
      CHAR.uCharTint.value.set(1.02, 0.92, 0.82); CHAR.uCharShade.value = 0.66; CHAR.uGrad.value = 0.07;
      CHAR.uBodyGrad.value = 0.18; CHAR.uSideTint.value.set(0.88, 0.85, 1.02);
      this.fog.color.set("#4a3c4c"); this.fog.near = 24; this.fog.far = 170;
      const su = this.skyMat.uniforms;
      SKY_DUSK.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_DUSK.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
      if (stars) stars.visible = false;
      if (moonDisc) moonDisc.visible = false;
    }
    const sc = this.moon.shadow.camera;
    sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 5; sc.far = 120; sc.updateProjectionMatrix();
    this.moon.shadow.bias = -0.0004; this.moon.shadow.normalBias = 0.03;
  }

  /** paint + stage one human actor from a planner-style state (eworld's
   *  stageHuman, with the night wash gentled 0.72 -> 0.5 for readability) */
  private stageHuman(a: Actor, who: "rendi" | "karso" | "tono", s: ActorState, camX: number, camZ: number) {
    const lid = lidAt9(0, who === "rendi" ? 0 : who === "karso" ? 3 : 5);
    const lidQ = Math.round(lid * 4);
    const outfit = who === "rendi" ? RENDI : who === "karso" ? KARSO : TONO;
    const seed = who === "rendi" ? SEED_RENDI : who === "karso" ? SEED_KARSO : SEED_TONO;
    const wash = (p: Pen, fireDir: -1 | 0 | 1) => nightWash(p, fireDir, 0.5);
    let key = "", draw: (p: Pen) => void;
    const expr = s.expr as never;
    switch (s.pose) {
      case "marchS": {
        const q = Math.round(s.phase * 40);
        key = `${who}-march-${q}-${lidQ}`;
        draw = (p) => { bodySide(p, outfit, { mode: "march", phase: s.phase, stride: 1.05, expr, blink: lid, seed }); wash(p, 0); };
        break;
      }
      case "sit":
        key = `${who}-sit-${s.expr}-${lidQ}`;
        draw = (p) => { bodyFront(p, outfit, { mode: "sit", expr, blink: lid, seed, wave: 0.4 }); wash(p, 0); };
        break;
      case "senterF":
        key = `rendi-senter-${s.expr}-${lidQ}`;
        draw = (p) => { rendiSenterFront(p, expr, lid); wash(p, 0); };
        break;
      case "throwS": {
        const phQ = Math.round((s.ph ?? 0) * 20);
        key = `rendi-throw-${phQ}-${lidQ}`;
        draw = (p) => { rendiThrowSide(p, expr, lid, s.ph ?? 0, (s.ph ?? 0) < 0.55); wash(p, 0); };
        break;
      }
      case "frozen":
        key = `rendi-frozen-${lidQ}`;
        draw = (p) => { rendiFrozen(p, lid); wash(p, 1); };
        break;
      case "water":
        key = `${who}-water-${s.expr}-${lidQ}`;
        draw = (p) => { bodyFront(p, outfit, { mode: "stand", expr, blink: lid, seed }); wash(p, -1); };
        break;
      case "fill":
        key = `rendi-fill-${lidQ}`;
        draw = (p) => { bodySide(p, outfit, { mode: "stand", expr, blink: lid, seed }); dawnWash(p); };
        break;
      default:
        key = `${who}-stand-${s.expr}-${lidQ}`;
        draw = (p) => {
          if (who === "tono") tonoFront(p, expr, lid);
          else if (who === "karso") karsoFront(p, expr, lid);
          else bodyFront(p, outfit, { mode: "stand", expr, blink: lid, seed });
          wash(p, 0);
        };
    }
    this.stageActor(a, key, draw, s.x, s.y, s.z, camX, camZ, s.mirror, s.scale);
    if (s.pose !== "water") this.blob(s.x, s.z, 0.72 * s.scale, s.y + 0.03);
  }

  private stageBall(pos: [number, number, number], size: number, face: number) {
    const w = size * 1.71;
    this.stageFx(this.fxHalo, "halo", 512, (p) => drawFireGlow(p), pos[0], pos[1], pos[2] + 0.35, w * 2.5, w * 2.5, [1.02, 0.95, 0.85]);
    this.stageFx(this.fxBall, `ball-${Math.round(size * 20)}-${face > 0 ? 1 : 0}-0`, 700, (p) => drawFireball(p, { seed: 5, face }), pos[0], pos[1], pos[2], w, w, [1.9, 1.7, 1.5]);
    const surfY = pos[2] > 3 && pos[2] < 7.4 ? deckY(pos[2]) : 0;
    this.stageFx(this.fxPool, "glowpool", 512, (p) => drawGlow(p), pos[0], surfY + 0.04, pos[2], w * 1.7, w * 1.25, [0.8, 0.7, 0.6], true);
    this.embersAround(pos[0], pos[1], pos[2], Math.max(0.3, size * 0.8));
    if (pos[2] > 2.5 && pos[2] < 8) { this.refl.visible = true; this.refl.position.set(pos[0], -0.46, 5.2); }
  }

  private stageFigure(x: number, y: number, z: number, side: boolean, scale: number, camX: number, camZ: number,
    haloK = 2.3, haloHdr: [number, number, number] = [0.97, 0.9, 0.8], poolK = 2.1) {
    this.stageActor(this.figure, `fig-${side ? "side" : "front"}`, (p) => drawFireFigure(p, side), x, y, z, camX, camZ, false, scale);
    this.stageFx(this.fxHalo, "halo", 512, (p) => drawFireGlow(p), x, y + 1.2, z + 0.3, haloK * scale, haloK * scale, haloHdr);
    const onDeck = z > 1 && z < 9.4;
    this.stageFx(this.fxPool, "glowpool", 512, (p) => drawGlow(p), x, (onDeck ? deckY(Math.max(1.3, Math.min(9.1, z))) : 0) + 0.04, z, poolK * scale, poolK * 0.71 * scale, [0.85, 0.75, 0.65], true);
    this.embersAround(x, y + 1.1, z, 1.1 * scale);
    if (z > 2.5 && z < 8) { this.refl.visible = true; this.refl.position.set(x, -0.46, 5.2); }
  }

  private lamp() {
    this.stageFx(this.fxLamp, "lampglow", 512, (p) => drawGlow(p, "rgba(255,176,84,0.9)"), -2.7, 2.4, -1.12, 1.15, 1.15, [1.15, 1.05, 0.9]);
    this.stageFx(this.fxLampPool, "lampool", 512, (p) => drawGlow(p), -2.7, 0.04, -0.9, 2.6, 2.2, [0.42, 0.35, 0.25], true);
  }

  /** stage still `id` (0..9, the SHOTPLAN gate set); returns its camera */
  frame(id: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): StillCam {
    // v3 WIDENED (28 Nov, user: rework stills "masih kurang lebar") — every
    // camera pulled back one class along its axis: establishing/W figures
    // <= ~1/3 frame height, former mediums -> medium-wide <= ~1/2. Figure
    // fractions below are card-plane projections, verified per still.
    const DEFS: StillCam[] = [
      { pos: [2.23, 5.0, -17.3], look: [-0.5, 0.4, 7.8], fov: 46, focus: [-0.6, 1.85, 12.2], cInf: 4, phase: "night" },   // S1 hook wide
      { pos: [-3.6, 2.22, 10.3], look: [-3.6, 1.0, -0.5], fov: 44, focus: [-5.05, 1.1, -0.3], cInf: 4.5, phase: "night" }, // S2 Tono scar group
      { pos: [-6.81, 2.15, 10.03], look: [-3.3, 1.0, -0.5], fov: 44, focus: [-3.6, 1.1, -0.7], cInf: 4, phase: "night" },  // S3 theory + kali
      { pos: [-3.48, 1.59, 9.61], look: [-3.55, 1.05, -0.45], fov: 44, focus: [-2.1, 1.25, -0.15], cInf: 4.5, phase: "night" }, // S4 mocks group
      { pos: [3.6, 1.7, -10.6], look: [-0.2, 0.95, 1.8], fov: 44, focus: [0.3, 1.2, -1.5], cInf: 4, phase: "night" },     // S5 signs wide (axis shifted west 28 Nov: the straight pull-back parked the camera under the (5.8,-6.5) crown and its underside filled the top of frame)
      { pos: [2.34, 1.6, -9.24], look: [0, 1.6, 4.8], fov: 42, focus: [0, 1.95, 5.2], cInf: 4, phase: "night" },        // S6 fire grows
      { pos: [1.6, 1.35, -8.6], look: [0, 1.5, 4.4], fov: 44, focus: [0, 1.6, 4.6], cInf: 4, phase: "night" },         // S7 REVEAL WIDE
      { pos: [2.83, 1.91, -10.48], look: [0.1, 1.0, -3.2], fov: 42, focus: [0.15, 1.0, -3.8], cInf: 4.5, phase: "night" },  // S8 chase
      { pos: [3.42, 1.8, 10.31], look: [0.3, 0.5, 4.2], fov: 44, focus: [0.8, 0.4, 4.4], cInf: 4.5, phase: "night" },     // S9 plunge
      { pos: [4.63, 2.35, -4.07], look: [-0.2, 0.85, 0.3], fov: 42, focus: [0.55, 0.85, 0.2], cInf: 4.5, phase: "dusk" },    // S10 gentong ending
    ];
    const d = DEFS[id];
    cam.position.set(...d.pos); cam.up.set(0, 1, 0); cam.lookAt(...d.look);
    cam.fov = d.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const skyMesh = this.root.getObjectByName("sky"); if (skyMesh) skyMesh.position.copy(cam.position);
    this.lightRig(d.phase, d.pos, d.look);
    scene.fog = this.fog; scene.background = null;
    this.focus = d.focus; this.cInf = d.cInf;
    const [camX, camZ] = [d.pos[0], d.pos[2]];
    for (const a of [this.rendi, this.karso, this.tono, this.figure]) a.mesh.visible = false;
    for (const x of [this.fxBall, this.fxHalo, this.fxPool, this.fxRingFx, this.fxSplashFx, this.fxShim, this.fxLamp, this.fxLampPool, this.fxBlob]) x.mesh.visible = false;
    this.refl.visible = false; this.embers.visible = false;

    switch (id) {
      case 0: // S1 hook wide — whole geography, fireball over the far path
        this.stageBall([-0.6, 1.85, 12.2], 0.34, 0);
        break;
      case 1: // S2 Tono's scar — porch group, all three readable
        this.stageHuman(this.tono, "tono", A(PORCH.tono.x, PORCH.tono.z, "stand", "stern"), camX, camZ);
        this.stageHuman(this.karso, "karso", A(PORCH.karso.x, PORCH.karso.z, "sit", "neutral"), camX, camZ);
        this.stageHuman(this.rendi, "rendi", A(PORCH.rendi.x, PORCH.rendi.z, "stand", "neutral"), camX, camZ);
        this.lamp();
        break;
      case 2: // S3 warga theory — group on the road axis, bridge + kali beyond
        this.stageHuman(this.tono, "tono", A(PORCH.tono.x, PORCH.tono.z, "stand", "neutral"), camX, camZ);
        this.stageHuman(this.karso, "karso", A(PORCH.karso.x, PORCH.karso.z, "sit", "stern"), camX, camZ);
        this.stageHuman(this.rendi, "rendi", A(PORCH.rendi.x, PORCH.rendi.z, "stand", "neutral"), camX, camZ);
        this.lamp();
        break;
      case 3: // S4 Rendi mocks — group reactions in one frame
        this.stageHuman(this.tono, "tono", A(PORCH.tono.x, PORCH.tono.z, "stand", "nervous"), camX, camZ);
        this.stageHuman(this.karso, "karso", A(PORCH.karso.x, PORCH.karso.z, "sit", "stern"), camX, camZ);
        this.stageHuman(this.rendi, "rendi", A(PORCH.rendi.x, PORCH.rendi.z, "stand", "laugh"), camX, camZ);
        this.lamp();
        break;
      case 4: // S5 signs — Rendi alone in a big, still, readable world
        this.stageHuman(this.rendi, "rendi", A(WAIT.x, WAIT.z, "stand", "nervous"), camX, camZ);
        break;
      case 5: // S6 fire grows — two-shot in space (tampah-size ball)
        this.stageHuman(this.rendi, "rendi", A(WAIT.x, WAIT.z, "frozen", "shock"), camX, camZ);
        this.stageBall([0, 1.95, 5.2], 1.05, 0.3);
        break;
      case 6: // S7 REVEAL WIDE — whole inverted figure on the bridge
        this.stageHuman(this.rendi, "rendi", A(WAIT.x, WAIT.z, "frozen", "shock"), camX, camZ);
        this.stageFigure(0, deckY(4.6) + 0.01, 4.6, REVEAL_SIDE, 1.12, camX, camZ, 1.45, [0.8, 0.72, 0.6], 1.7);
        break;
      case 7: // S8 chase — both full bodies, grass strip foreground
        this.stageHuman(this.rendi, "rendi", A(0.25, -5.2, "marchS", "shock", { phase: 1.35, mirror: true }), camX, camZ);
        this.stageFigure(0.05, 0, -2.3, true, 0.98, camX, camZ);
        break;
      case 8: { // S9 plunge — Rendi in the kali, figure stopped at the edge
        const rs = A(WATER_POS.x, WATER_POS.z, "water", "shock", { y: WATER_POS.y });
        this.stageHuman(this.rendi, "rendi", rs, camX, camZ);
        this.stageFigure(0, deckY(5.0) + 0.01, 5.0, false, 1, camX, camZ);
        this.stageFx(this.fxRingFx, "ring", 600, (p) => fxRing(p, 0.45), WATER_POS.x, -0.44, WATER_POS.z, 1.5, 1.5, [0.7, 0.8, 1.0], true);
        this.stageFx(this.fxSplashFx, "splash", 800, (p) => fxSplash(p, 0.4), WATER_POS.x, -0.28, WATER_POS.z - 0.25, 0.85, 0.85, [0.75, 0.85, 1.05]);
        break;
      }
      case 9: // S10 gentong ending — dusk conversion
        this.stageHuman(this.rendi, "rendi", A(-0.55, 0.55, "fill", "neutral", { ph: 0.5 }), camX, camZ);
        this.stageFx(this.fxShim, "shimmer", 512, (p) => drawShimmer(p), 0.55, 0.885, 0.2, 0.55, 0.55, [0.9, 0.9, 0.9], true);
        break;
    }
    this.pool.flush();
    for (const a of [this.rendi, this.karso, this.tono, this.figure]) a.bind();
    for (const x of [this.fxBall, this.fxHalo, this.fxPool, this.fxRingFx, this.fxSplashFx, this.fxShim, this.fxLamp, this.fxLampPool, this.fxBlob]) x.bind();
    return d;
  }
}
