// Ep.9 episode world — the nworld night set (forest road, bamboo bridge,
// kali, house corner, gentong) extended to a full timeline: per-frame staging
// from story9.ts, the U2 night preset LIFTED per the user's lighting note
// (faces/hands/actions must read at phone brightness; the fire stays the
// brightest element by contrast, not by everything else being black), U4
// idle-life (breath, blinks, swaying hero trees, water, embers), U6 ambient
// movers, the senter cone + lamp as warm practicals, and the fire as
// flickering FX cards (seed steps) + the inverted figure Actor.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../layang/build";
import { beam } from "../layang/paint";
import { Pen, bodyFront, bodySide, fxRing, fxSplash, fxContact } from "../layang/toon";
import { TONE, CHAR, untone } from "../layang/shade";
import { NOINK } from "../layang/ink";
import { Pool, Actor, Fx, SU } from "../layang/cards";
import { drawFireball, drawFireFigure, drawGlow, drawFireGlow, drawShimmer } from "./fire";
import { RENDI, KARSO, TONO, SEED_RENDI, SEED_KARSO, SEED_TONO, nightWash, dawnWash, tonoFront, karsoFront, rendiBust, karsoBust, tonoBust, rendiBack } from "./cast9";
import { rendiSenterFront, rendiFrozen, rendiThrowSide, lidAt9 } from "./cast9ep";
import { stageAt, camAt, ambT9, deckY, ActorState, TOTAL } from "./story9";

const hh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const bodyGeo = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const bustGeo = (() => {
  const g = new THREE.PlaneGeometry(600 * SU, 800 * SU); g.translate(0, 425 * SU, 0);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 0.05 + uv.getY(i) * 0.8);
  return g;
})();

type SkyStops = { c: string[]; e: number[] };
const SKY_NIGHT: SkyStops = { c: ["#101a30", "#14223c", "#1a2c4c", "#243a63", "#31497a"], e: [0, 4, 10, 20, 40] };
const SKY_DUSK: SkyStops = { c: ["#2c2a4e", "#4e3450", "#8a4c46", "#c97a4c", "#e09a58"], e: [0, 4, 10, 20, 40] };
const SKY_DAWN: SkyStops = { c: ["#e8905a", "#c47a68", "#7a5a74", "#41496e", "#252e4e"], e: [0, 4, 10, 20, 40] };

export class EpisodeWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private rendi: Actor; private karso: Actor; private tono: Actor; private figure: Actor;
  private bustA: Actor;
  private fxBall: Fx; private fxHalo: Fx; private fxPool: Fx; private fxRingFx: Fx; private fxSplashFx: Fx; private fxShim: Fx;
  private fxLamp: Fx; private fxLampPool: Fx; private fxSenterPool: Fx; private fxLash: Fx; private fxBlob: Fx;
  private hemi: THREE.HemisphereLight; private moon: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#0d1526", 20, 130);
  private embers: THREE.Points; private emberPos: THREE.BufferAttribute;
  private refl: THREE.Mesh; private cone: THREE.Mesh; private stone: THREE.Mesh;
  private sways: { g: THREE.Group; ph: number }[] = [];
  focus: [number, number, number] = [0, 1.4, 4];
  cInf = 5;

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
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#cdd8ff", size: 1.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.75 }));
    stars.layers.set(NOINK); stars.name = "stars"; R.add(stars);
    this.hemi = new THREE.HemisphereLight("#35497a", "#14100c", 1.0);
    this.moon = new THREE.DirectionalLight("#9db4e2", 0.95);
    this.moon.castShadow = true;
    this.moon.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.moon, this.moon.target);
    // ---- terrain + set (nworld batch, plus lamp post + grass strip) ----
    const b = new Batch();
    const ground = lam("e9Ground", () => ({ color: "#1d2a20" }));
    const dirt = lam("e9Dirt", () => ({ color: "#35291b" }));
    const earth = lam("e9Earth", () => ({ color: "#2b2015" }));
    const waterM = lam("e9Water", () => ({ color: "#16304e" }));
    const bamboo = lam("e9Bamboo", () => ({ color: "#86744a" }));
    const bambooD = lam("e9BambooD", () => ({ color: "#6b5a36" }));
    const trunkM = lam("e9Trunk", () => ({ color: "#37291b" }));
    const leafM = lam("e9Leaf", () => ({ color: "#274435" }));
    const leafM2 = lam("e9Leaf2", () => ({ color: "#1e3628" }));
    const wood = lam("e9Wood", () => ({ map: beam() }));
    const clay = lam("e9Clay", () => ({ color: "#7d5540" }));
    b.add(boxGeo(V(-60, -0.4, -40), V(60, 0, 3.0), 1), ground);
    b.add(boxGeo(V(-60, -0.4, 7.4), V(60, 0, 40), 1), ground);
    b.add(boxGeo(V(-1.7, -0.38, -26), V(1.7, 0.015, 3.0), 1), dirt);
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
    const clump = (x: number, z: number) => {
      for (let i = 0; i < 6; i++) {
        const px = x + (hh(i * 7) - 0.5) * 0.9, pz = z + (hh(i * 13) - 0.5) * 0.9, h = 5.4 + hh(i * 19) * 1.6;
        const cg = new THREE.CylinderGeometry(0.05, 0.07, h, 6); cg.translate(0, h / 2, 0);
        b.add(cg, bambooD, new THREE.Matrix4().makeTranslation(px, 0, pz));
        const sg = new THREE.SphereGeometry(0.85, 12, 9); sg.scale(1.3, 0.6, 1.3);
        b.add(sg, leafM, new THREE.Matrix4().makeTranslation(px, h - 0.2, pz));
      }
    };
    clump(-5.2, 8.6); clump(6.2, -2.2); clump(-4.4, -7.5);
    for (const [x, z, r] of [[-2.8, -2.5, 0.7], [3.1, 0.8, 0.85], [-3.2, 5.9, 0.6], [2.9, 9.8, 0.75]] as const) {
      const sg = new THREE.SphereGeometry(r, 12, 9); sg.scale(1, 0.7, 1);
      b.add(sg, leafM2, new THREE.Matrix4().makeTranslation(x, r * 0.45, z));
    }
    b.add(boxGeo(V(-7.6, 0, -2.45), V(-0.9, 2.6, -2.2), 1), wood);
    const roofM = new THREE.Matrix4().makeRotationX(0.5).setPosition(-4.25, 3.15, -2.1);
    b.add(boxGeo(V(-3.6, -0.06, -1.5), V(3.6, 0.06, 1.5), 1, true), lam("e9Roof", () => ({ color: "#59452e" })), roofM);
    b.add(boxGeo(V(-3.1, 0, -2.19), V(-2.0, 1.9, -2.16), 1), lam("e9Door", () => ({ color: "#211509" })));
    // lamp post at the porch (-2.7, -1.15): pole + head (glow cards staged per frame)
    const lampM = lam("e9LampPost", () => ({ color: "#3a3128" }));
    const lp = new THREE.CylinderGeometry(0.045, 0.055, 2.3, 7); lp.translate(0, 1.15, 0);
    b.add(lp, lampM, new THREE.Matrix4().makeTranslation(-2.7, 0, -1.15));
    b.add(boxGeo(V(-2.82, 2.28, -1.27), V(-2.58, 2.52, -1.03), 1), lampM);
    // grass strip along the road's east edge (L21's unburned grass)
    const grassM = lam("e9Grass", () => ({ color: "#2e5231" }));
    const tuftG = new THREE.ConeGeometry(0.09, 0.42, 5); tuftG.translate(0, 0.21, 0);
    let gi = 0;
    for (let z = -9.5; z <= -3; z += 0.55) for (const gx of [1.25, 1.55]) {
      gi++;
      b.add(tuftG, grassM, new THREE.Matrix4().makeTranslation(gx + (hh(gi * 7) - 0.5) * 0.2, 0, z + (hh(gi * 13) - 0.5) * 0.3));
    }
    const pts: THREE.Vector2[] = [[0.01, 0], [0.24, 0], [0.35, 0.1], [0.43, 0.38], [0.41, 0.62], [0.30, 0.78], [0.31, 0.86], [0.36, 0.9], [0.37, 0.95]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    const jar = new THREE.LatheGeometry(pts, 22);
    b.add(jar, clay, new THREE.Matrix4().makeTranslation(0.55, 0, 0.2));
    const wdisc = new THREE.CircleGeometry(0.28, 22); wdisc.rotateX(-Math.PI / 2);
    b.add(wdisc, lam("e9JarWater", () => ({ color: "#24405e" })), new THREE.Matrix4().makeTranslation(0.55, 0.87, 0.2));
    b.build(R);
    // hero swaying trees (U6 ambient movers)
    const hero: [number, number, number, number][] = [[-9.5, 6.5, 1.3, 0.5], [9.2, -3.5, 1.2, 2.4], [-4.5, 17, 1.5, 4.4], [7.5, 15.5, 1.1, 1.2]];
    hero.forEach(([x, z, s, ph]) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 2.6, 7), new THREE.MeshLambertMaterial({ color: "#37291b" }));
      trunk.position.y = 1.3; g.add(trunk);
      const leafMat = new THREE.MeshLambertMaterial({ color: "#24402c" });
      for (const [lx, ly, lz, r] of [[0, 3.4, 0, 1.7], [1.0, 2.8, 0.3, 1.2], [-0.95, 2.9, -0.3, 1.15], [0.2, 4.2, -0.4, 1.1]] as const) {
        const sm = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), leafMat);
        sm.position.set(lx, ly, lz); g.add(sm);
      }
      R.add(g); this.sways.push({ g, ph });
    });
    // fire reflection on the water
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
    // senter beam cone (apex at the hand, opening toward the aim point)
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.6, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.85, 0.5), transparent: true, opacity: 0.10, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    this.cone.layers.set(NOINK); this.cone.visible = false; R.add(this.cone);
    // the thrown stone
    this.stone = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), new THREE.MeshLambertMaterial({ color: "#55524e" }));
    this.stone.visible = false; R.add(this.stone);
    // cast + fx
    this.rendi = new Actor(R, bodyGeo); this.karso = new Actor(R, bodyGeo); this.tono = new Actor(R, bodyGeo);
    this.figure = new Actor(R, bodyGeo); this.bustA = new Actor(R, bustGeo);
    this.fxBall = new Fx(R); this.fxHalo = new Fx(R); this.fxPool = new Fx(R);
    this.fxRingFx = new Fx(R); this.fxSplashFx = new Fx(R); this.fxShim = new Fx(R);
    this.fxLamp = new Fx(R); this.fxLampPool = new Fx(R); this.fxSenterPool = new Fx(R);
    this.fxLash = new Fx(R); this.fxBlob = new Fx(R);
  }

  private stageActor(a: Actor, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, camX: number, camZ: number, mirror: boolean, s = 1, breath = 0) {
    a.r = this.pool.req(key, 1080, 1800, 1.8, draw);
    a.mesh.visible = true;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.set(0, Math.atan2(camX - x, camZ - z), 0);
    a.mesh.scale.set(mirror ? -s : s, s * (1 + breath), s);
  }
  private stageBust(a: Actor, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, camX: number, camZ: number, s = 1.15) {
    a.r = this.pool.req(key, 1080, 1440, 1.8, draw);
    a.mesh.visible = true;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.set(0, Math.atan2(camX - x, camZ - z), 0);
    a.mesh.scale.set(s, s, s);
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
  private embersAround(cx: number, cy: number, cz: number, r: number, t: number) {
    for (let i = 0; i < 90; i++) {
      const a = hh(i * 3 + 1) * Math.PI * 2, d = r * (0.4 + hh(i * 7 + 2) * 0.9);
      const rise = ((t * 0.35 + hh(i * 11 + 3)) % 1) * r * 1.5;
      this.emberPos.setXYZ(i, cx + Math.cos(a) * d, cy - r * 0.4 + rise, cz + Math.sin(a) * d * 0.7);
    }
    this.emberPos.needsUpdate = true;
    this.embers.visible = true;
  }

  private lightRig(phase: "night" | "dusk" | "dawn", pos: number[], look: number[]) {
    const stars = this.root.getObjectByName("stars");
    if (phase === "night") {
      // U2 LIFTED night (user's lighting note): ambient/moon up ~a stop,
      // shade floor raised, characters' shade tint up — fire wins by contrast.
      this.hemi.color.set("#35497a"); this.hemi.groundColor.set("#14100c"); this.hemi.intensity = 1.0;
      this.moon.color.set("#9db4e2"); this.moon.intensity = 0.95;
      this.moon.position.set(pos[0] - 26, 34, pos[2] - 20); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(0.78, 0.86, 1.12); TONE.uShadeCol.value.set(0.20, 0.24, 0.40); TONE.uShadeLift.value.set(0.05, 0.06, 0.10);
      TONE.uLambert.value = 0.42; TONE.uSideK.value = 0.82; TONE.uTerm.value = 0.28; TONE.uBounce.value.set(0.01, 0.01, 0.02); TONE.uSat.value = 0.95;
      CHAR.uCharTint.value.set(0.95, 1.0, 1.12); CHAR.uCharShade.value = 0.58; CHAR.uGrad.value = 0.06;
      CHAR.uBodyGrad.value = 0.18; CHAR.uSideTint.value.set(0.85, 0.9, 1.15);
      this.fog.color.set("#0d1526"); this.fog.near = 20; this.fog.far = 135;
      const su = this.skyMat.uniforms;
      SKY_NIGHT.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_NIGHT.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
      if (stars) stars.visible = true;
    } else if (phase === "dusk") {
      this.hemi.color.set("#6a5a7c"); this.hemi.groundColor.set("#1a130e"); this.hemi.intensity = 0.85;
      this.moon.color.set("#ffb37a"); this.moon.intensity = 1.05;
      this.moon.position.set(pos[0] + 24, 9, pos[2] - 10); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(1.05, 0.8, 0.52); TONE.uShadeCol.value.set(0.24, 0.26, 0.44); TONE.uShadeLift.value.set(0.05, 0.05, 0.09);
      TONE.uLambert.value = 0.42; TONE.uSideK.value = 0.82; TONE.uTerm.value = 0.3; TONE.uBounce.value.set(0.03, 0.015, 0); TONE.uSat.value = 0.97;
      CHAR.uCharTint.value.set(1.0, 0.9, 0.8); CHAR.uCharShade.value = 0.6; CHAR.uGrad.value = 0.07;
      CHAR.uBodyGrad.value = 0.2; CHAR.uSideTint.value.set(0.85, 0.82, 1.0);
      this.fog.color.set("#4a3c4c"); this.fog.near = 20; this.fog.far = 150;
      const su = this.skyMat.uniforms;
      SKY_DUSK.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_DUSK.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
      if (stars) stars.visible = false;
    } else {
      this.hemi.color.set("#5a6c9c"); this.hemi.groundColor.set("#1a140e"); this.hemi.intensity = 0.9;
      this.moon.color.set("#ffb37a"); this.moon.intensity = 1.2;
      this.moon.position.set(pos[0] + 24, 11, pos[2] - 8); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(1.15, 0.85, 0.55); TONE.uShadeCol.value.set(0.22, 0.26, 0.42); TONE.uShadeLift.value.set(0.05, 0.05, 0.09);
      TONE.uLambert.value = 0.42; TONE.uSideK.value = 0.82; TONE.uTerm.value = 0.3; TONE.uBounce.value.set(0.03, 0.015, 0); TONE.uSat.value = 0.97;
      CHAR.uCharTint.value.set(1.0, 0.9, 0.78); CHAR.uCharShade.value = 0.62; CHAR.uGrad.value = 0.07;
      CHAR.uBodyGrad.value = 0.2; CHAR.uSideTint.value.set(0.85, 0.82, 1.0);
      this.fog.color.set("#3a3c55"); this.fog.near = 20; this.fog.far = 160;
      const su = this.skyMat.uniforms;
      SKY_DAWN.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_DAWN.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
      if (stars) stars.visible = false;
    }
    const sc = this.moon.shadow.camera;
    sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 5; sc.far = 120; sc.updateProjectionMatrix();
    this.moon.shadow.bias = -0.0004; this.moon.shadow.normalBias = 0.03;
  }

  /** paint + stage one human actor from its planner state */
  private stageHuman(a: Actor, who: "rendi" | "karso" | "tono", s: ActorState, f: number, camX: number, camZ: number) {
    const t = f / 30, lid = lidAt9(t, who === "rendi" ? 0 : who === "karso" ? 3 : 5);
    const lidQ = Math.round(lid * 4), breath = Math.sin(t * 1.6 + (who === "rendi" ? 0 : who === "karso" ? 2 : 4)) * 0.008;
    const outfit = who === "rendi" ? RENDI : who === "karso" ? KARSO : TONO;
    const seed = who === "rendi" ? SEED_RENDI : who === "karso" ? SEED_KARSO : SEED_TONO;
    const wash = (p: Pen, fireDir: -1 | 0 | 1) => nightWash(p, fireDir, 0.72);
    let key = "", draw: (p: Pen) => void;
    const expr = s.expr as never;
    switch (s.pose) {
      case "marchS": {
        const stride = s.phase > 3 ? 1.2 : 1.0; // phase doubles as speed flag via t-scaling in planner keys below
        const q = Math.round(s.phase * 40);
        key = `${who}-march-${q}-${lidQ}`;
        draw = (p) => { bodySide(p, outfit, { mode: "march", phase: s.phase, stride: 1.05, expr, blink: lid, seed }); wash(p, 0); };
        break;
      }
      case "strollF": {
        const q = Math.round(s.phase * 40);
        key = `${who}-stroll-${q}-${lidQ}`;
        draw = (p) => { bodyFront(p, outfit, { mode: "stroll", phase: s.phase, expr, blink: lid, seed }); wash(p, 0); };
        break;
      }
      case "sit":
        key = `${who}-sit-${s.expr}-${lidQ}`;
        draw = (p) => { bodyFront(p, outfit, { mode: "sit", expr, blink: lid, seed, wave: Math.sin(t * 0.9) * 0.5 }); wash(p, 0); };
        break;
      case "back":
        key = `${who}-back`;
        draw = (p) => { if (who === "rendi") rendiBack(p); else bodyFront(p, outfit, { mode: "stand", expr: "neutral", blink: 0, seed }); wash(p, 0); };
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
      default: // stand
        key = `${who}-stand-${s.expr}-${lidQ}`;
        draw = (p) => {
          if (who === "tono") tonoFront(p, expr, lid);
          else if (who === "karso") karsoFront(p, expr, lid);
          else bodyFront(p, outfit, { mode: "stand", expr, blink: lid, seed });
          wash(p, 0);
        };
    }
    let { x, y, z } = s;
    if (s.pose === "frozen") { x += Math.sin(t * 31) * 0.008; z += Math.cos(t * 27) * 0.006; } // tremble
    this.stageActor(a, key, draw, x, y, z, camX, camZ, s.mirror, s.scale, breath);
    if (s.pose !== "water") this.blob(x, z, 0.72 * s.scale, y + 0.03);
  }

  private stageBustFor(who: "rendi" | "karso" | "tono", s: ActorState, camX: number, camZ: number) {
    const key = `bust-${who}-${s.expr}`;
    const draw = (p: Pen) => {
      if (who === "rendi") rendiBust(p, s.expr as never);
      else if (who === "karso") karsoBust(p, s.expr as never);
      else tonoBust(p, s.expr as never);
      nightWash(p, who === "rendi" ? 1 : 0, 0.6);
    };
    this.stageBust(this.bustA, key, draw, s.x, 0, s.z, camX, camZ, 1.15);
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / 30, at = ambT9(f);
    const c = camAt(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const skyMesh = this.root.getObjectByName("sky"); if (skyMesh) skyMesh.position.copy(cam.position);
    const st = stageAt(f);
    this.lightRig(st.phase, c.pos, c.look);
    scene.fog = this.fog; scene.background = null;
    // ambient movers (gated)
    for (const s of this.sways) {
      s.g.rotation.z = Math.sin(at * 0.9 + s.ph) * 0.022;
      s.g.rotation.x = Math.cos(at * 0.7 + s.ph) * 0.014;
    }
    // hide everything, then stage what the planner wants
    for (const a of [this.rendi, this.karso, this.tono, this.figure, this.bustA]) a.mesh.visible = false;
    for (const x of [this.fxBall, this.fxHalo, this.fxPool, this.fxRingFx, this.fxSplashFx, this.fxShim, this.fxLamp, this.fxLampPool, this.fxSenterPool, this.fxLash, this.fxBlob]) x.mesh.visible = false;
    this.refl.visible = false; this.embers.visible = false; this.cone.visible = false; this.stone.visible = false;
    const camX = c.pos[0], camZ = c.pos[2];
    // humans (bust states borrow the shared bust actor)
    const humans: ["rendi" | "karso" | "tono", ActorState | undefined, Actor][] = [
      ["rendi", st.rendi, this.rendi], ["karso", st.karso, this.karso], ["tono", st.tono, this.tono]];
    for (const [who, s, actor] of humans) {
      if (!s) continue;
      if (s.pose === "bust") this.stageBustFor(who, s, camX, camZ);
      else this.stageHuman(actor, who, s, f, camX, camZ);
    }
    // lamp practical
    if (st.lamp) {
      const fl = 0.92 + Math.sin(t * 13) * 0.03 + Math.sin(t * 31) * 0.02;
      this.stageFx(this.fxLamp, "lampglow", 512, (p) => drawGlow(p, "rgba(255,176,84,0.9)"), -2.7, 2.4, -1.12, 1.15 * fl, 1.15 * fl, [1.15, 1.05, 0.9]);
      this.stageFx(this.fxLampPool, "lampool", 512, (p) => drawGlow(p), -2.7, 0.04, -0.9, 2.6, 2.2, [0.42, 0.35, 0.25], true);
    }
    // senter beam + pool
    if (st.senter && st.rendi) {
      const hx = st.rendi.x + 0.3, hy = 1.06, hz = st.rendi.z + 0.1;
      const aim = new THREE.Vector3(-0.5, 0.05, -3.6), apex = new THREE.Vector3(hx, hy, hz);
      const dir = aim.clone().sub(apex), len = dir.length();
      this.cone.visible = true;
      this.cone.position.copy(apex).addScaledVector(dir, 0.5);
      this.cone.scale.set(1, len / 2.6, 1);
      this.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
      this.stageFx(this.fxSenterPool, "senterpool", 512, (p) => drawGlow(p, "rgba(255,220,150,0.85)"), -0.5, 0.04, -3.6, 1.7, 1.4, [0.85, 0.78, 0.6], true);
    }
    // fire
    const flick = Math.floor(t * 7) % 4, flick2 = Math.floor(t * 9) % 3;
    if (st.fire.ball) {
      const B = st.fire.ball, w = B.size * 1.71;
      const pulse = 1 + Math.sin(t * 11) * 0.03 + Math.sin(t * 23) * 0.02;
      this.stageFx(this.fxHalo, "halo", 512, (p) => drawFireGlow(p), B.pos[0], B.pos[1], B.pos[2] + 0.35, w * 2.5 * pulse, w * 2.5 * pulse, [1.02, 0.95, 0.85]);
      this.stageFx(this.fxBall, `ball-${Math.round(B.size * 20)}-${B.face > 0 ? 1 : 0}-${flick}`, 700, (p) => drawFireball(p, { seed: 5 + flick * 3, face: B.face }), B.pos[0], B.pos[1], B.pos[2], w * pulse, w * pulse, [1.9, 1.7, 1.5], false, B.spin * 0.15);
      const surfY = B.pos[2] > 3 && B.pos[2] < 7.4 ? deckY(B.pos[2]) : 0;
      this.stageFx(this.fxPool, "glowpool", 512, (p) => drawGlow(p), B.pos[0], surfY + 0.04, B.pos[2], w * 1.7, w * 1.25, [0.8, 0.7, 0.6], true);
      this.embersAround(B.pos[0], B.pos[1], B.pos[2], Math.max(0.3, B.size * 0.8), t);
      if (B.pos[2] > 2.5 && B.pos[2] < 8) { this.refl.visible = true; this.refl.position.set(B.pos[0], -0.46, 5.2); (this.refl.material as THREE.MeshBasicMaterial).opacity = 0.5; }
    }
    if (st.fire.figure) {
      const F = st.fire.figure;
      const bob = Math.abs(Math.sin(t * (F.pos[2] < 2 ? 6.4 : 2.0))) * (F.pos[2] < 2 ? 0.045 : 0.015);
      const pulse = 1 + Math.sin(t * 12) * 0.02;
      this.stageActor(this.figure, `fig-${F.side ? "side" : "front"}`, (p) => drawFireFigure(p, F.side),
        F.pos[0], F.pos[1] + bob, F.pos[2], camX, camZ, false, F.scale * pulse, 0);
      this.stageFx(this.fxHalo, "halo", 512, (p) => drawFireGlow(p), F.pos[0], F.pos[1] + 1.2, F.pos[2] + 0.3, 2.3 * F.scale * pulse, 2.3 * F.scale * pulse, [0.97, 0.9, 0.8]);
      const surfY = F.pos[2] > 1 && F.pos[2] < 9.4 ? deckY(Math.max(1.3, Math.min(9.1, F.pos[2]))) : 0;
      this.stageFx(this.fxPool, "glowpool", 512, (p) => drawGlow(p), F.pos[0], (F.pos[2] > 1 && F.pos[2] < 9.4 ? surfY : 0) + 0.04, F.pos[2], 2.1 * F.scale, 1.5 * F.scale, [0.85, 0.75, 0.65], true);
      this.embersAround(F.pos[0], F.pos[1] + 1.1, F.pos[2], 1.1 * F.scale, t);
      if (F.pos[2] > 2.5 && F.pos[2] < 8) { this.refl.visible = true; this.refl.position.set(F.pos[0], -0.46, 5.2); (this.refl.material as THREE.MeshBasicMaterial).opacity = 0.55; }
      // NOTE: the L19 flame-tongue beat is carried by the figure's painted
      // mouth jet (side view) + Rendi's recoil + the SFX whoosh. A separate
      // stretched lash card was tried and read as a hard graphic bar — removed.
    }
    // Rendi in the water: ring + splash dressing
    if (st.rendi && st.rendi.pose === "water") {
      const rp = 0.45 + Math.sin(t * 2.2) * 0.05;
      this.stageFx(this.fxRingFx, "ring", 600, (p) => fxRing(p, rp), st.rendi.x, -0.44, st.rendi.z, 1.5, 1.5, [0.7, 0.8, 1.0], true);
      this.stageFx(this.fxSplashFx, "splash", 800, (p) => fxSplash(p, 0.4 + Math.sin(t * 3.1) * 0.06), st.rendi.x, -0.28, st.rendi.z - 0.25, 0.85, 0.85, [0.75, 0.85, 1.05]);
    }
    // the stone
    if (st.stone) { this.stone.visible = true; this.stone.position.set(st.stone[0], st.stone[1], st.stone[2]); }
    // dawn gentong shimmer
    if (st.phase === "dawn") this.stageFx(this.fxShim, "shimmer", 512, (p) => drawShimmer(p), 0.55, 0.885, 0.2, 0.6, 0.6, [1, 1, 1], true);
    if (st.phase === "dusk") this.stageFx(this.fxShim, "shimmer", 512, (p) => drawShimmer(p), 0.55, 0.885, 0.2, 0.55, 0.55, [0.9, 0.9, 0.9], true);
    this.pool.flush();
    for (const a of [this.rendi, this.karso, this.tono, this.figure, this.bustA]) a.bind();
    for (const x of [this.fxBall, this.fxHalo, this.fxPool, this.fxRingFx, this.fxSplashFx, this.fxShim, this.fxLamp, this.fxLampPool, this.fxSenterPool, this.fxLash, this.fxBlob]) x.bind();
    return new THREE.Vector3(...this.focus);
  }
}
