// Banaspati scene world (Ep.9 stills): a forest road, a bamboo bridge over a
// kali (stream), and a house corner with a gentong — at night, lit by a dim
// moon and the Banaspati's own fire (the stylised shaders take no point
// lights, so the fire's light is faked with glow decals, halo cards, HDR fire
// cards for the bloom pass, and fire gradients baked into the character
// cards). Frame 2 is the dawn ending: warmer key, dawn sky, gentong shimmer.
// Layout: kali channel along X at z 3.0..7.4 (water y -0.5); bridge crosses
// it along Z at x 0 (deck arched 0.55..0.8); road along Z on the near bank.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../layang/build";
import { beam } from "../layang/paint";
import { Pen, bodyFront, bodySide, fxRing, fxSplash } from "../layang/toon";
import { TONE, CHAR, untone } from "../layang/shade";
import { NOINK } from "../layang/ink";
import { Pool, Actor, Fx, SU } from "../layang/cards";
import { drawFireball, drawFireFigure, drawGlow, drawFireGlow, drawShimmer } from "./fire";
import { RENDI, SEED_RENDI, nightWash, dawnWash } from "./cast9";

const hh = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const bodyGeo = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const deckY = (z: number) => 0.55 + 0.25 * Math.sin(((z - 1.2) / 8) * Math.PI); // bridge arch, z 1.2..9.2

type SkyStops = { c: string[]; e: number[] };
const SKY_NIGHT: SkyStops = { c: ["#0a1122", "#0c1528", "#122036", "#1a2c4c", "#263c66"], e: [0, 4, 10, 20, 40] };
const SKY_DAWN: SkyStops = { c: ["#e8905a", "#c47a68", "#7a5a74", "#41496e", "#252e4e"], e: [0, 4, 10, 20, 40] };

export class NightWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private rendi: Actor; private figure: Actor;
  private fxBall: Fx; private fxHalo: Fx; private fxPool: Fx; private fxRingFx: Fx; private fxSplashFx: Fx; private fxShim: Fx;
  private hemi: THREE.HemisphereLight; private moon: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#0a0f1c", 16, 110);
  private embers: THREE.Points;
  private emberPos: THREE.BufferAttribute;
  private refl: THREE.Mesh;
  focus: [number, number, number] = [0, 1.4, 4];
  cInf = 5;

  constructor() {
    const R = this.root;
    // ---- sky dome (kworld pattern) + stars ----
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
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#cdd8ff", size: 1.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
    stars.layers.set(NOINK); R.add(stars);
    // ---- lights ----
    this.hemi = new THREE.HemisphereLight("#2c3c5e", "#0b0906", 0.5);
    this.moon = new THREE.DirectionalLight("#8fa8d8", 0.55);
    this.moon.castShadow = true;
    this.moon.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.moon, this.moon.target);
    // ---- terrain + set (one batch) ----
    const b = new Batch();
    const ground = lam("bnGround", () => ({ color: "#18231b" }));
    const dirt = lam("bnDirt", () => ({ color: "#2c2318" }));
    const earth = lam("bnEarth", () => ({ color: "#241a12" }));
    const waterM = lam("bnWater", () => ({ color: "#10233c" }));
    const bamboo = lam("bnBamboo", () => ({ color: "#77643a" }));
    const bambooD = lam("bnBambooD", () => ({ color: "#5d4e2d" }));
    const trunkM = lam("bnTrunk", () => ({ color: "#2c2118" }));
    const leafM = lam("bnLeaf", () => ({ color: "#1d3320" }));
    const leafM2 = lam("bnLeaf2", () => ({ color: "#16281b" }));
    const wood = lam("bnWood", () => ({ map: beam() }));
    const clay = lam("bnClay", () => ({ color: "#6e4a34" }));
    // ground slabs: near bank, far bank, road strip, channel walls + water
    b.add(boxGeo(V(-60, -0.4, -40), V(60, 0, 3.0), 1), ground);
    b.add(boxGeo(V(-60, -0.4, 7.4), V(60, 0, 40), 1), ground);
    b.add(boxGeo(V(-1.7, -0.38, -26), V(1.7, 0.015, 3.0), 1), dirt);
    b.add(boxGeo(V(-60, -0.55, 3.0), V(60, 0, 3.35), 1), earth);   // near channel wall (slight batter)
    b.add(boxGeo(V(-60, -0.55, 7.05), V(60, 0, 7.4), 1), earth);  // far channel wall
    b.add(boxGeo(V(-60, -0.62, 3.0), V(60, -0.5, 7.4), 1), waterM); // water surface
    b.add(boxGeo(V(-60, -1.4, 3.0), V(60, -0.6, 7.4), 1), earth);  // channel bed under water
    // bridge: slatted deck following the arch + stringers + rails
    for (let z = 1.35; z <= 9.05; z += 0.31) {
      const y = deckY(z);
      b.add(boxGeo(V(-1.15, y - 0.07, z - 0.14), V(1.15, y, z + 0.14), 1), (Math.round(z * 10) % 2) ? bamboo : bambooD);
    }
    for (const sx of [-0.95, 0.95]) {
      for (let z = 1.5; z <= 8.9; z += 1.45) {
        const y = deckY(z);
        b.add(boxGeo(V(sx - 0.045, y, z - 0.045), V(sx + 0.045, y + 0.95, z + 0.045), 1), bambooD);
      }
      // top rail: segments between posts, following the arch
      for (let z = 1.5; z < 8.9; z += 1.45) {
        const y0 = deckY(z) + 0.95, y1 = deckY(z + 1.45) + 0.95, ym = (y0 + y1) / 2;
        b.add(boxGeo(V(sx - 0.04, ym - 0.045, z), V(sx + 0.04, ym + 0.045, z + 1.45), 1), bamboo);
      }
    }
    // trees: trunks + dark canopies; bamboo clumps (thin poles + leaf blobs)
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
    // bushes along the road
    for (const [x, z, r] of [[-2.8, -2.5, 0.7], [3.1, 0.8, 0.85], [-3.2, 5.9, 0.6], [2.9, 9.8, 0.75]] as const) {
      const sg = new THREE.SphereGeometry(r, 12, 9); sg.scale(1, 0.7, 1);
      b.add(sg, leafM2, new THREE.Matrix4().makeTranslation(x, r * 0.45, z));
    }
    // house corner (dawn frame): back wall + slanted roof + dark door — placed
    // on the LEFT of the near bank so it never blocks the bridge cameras
    b.add(boxGeo(V(-7.6, 0, -2.45), V(-0.9, 2.6, -2.2), 1), wood);
    const roofM = new THREE.Matrix4().makeRotationX(0.5).setPosition(-4.25, 3.15, -2.1);
    b.add(boxGeo(V(-3.6, -0.06, -1.5), V(3.6, 0.06, 1.5), 1, true), lam("bnRoof", () => ({ color: "#4c3a28" })), roofM);
    b.add(boxGeo(V(-3.1, 0, -2.19), V(-2.0, 1.9, -2.16), 1), lam("bnDoor", () => ({ color: "#191008" })));
    // gentong: lathed clay water jar at (0.55, 0, 0.2)
    const pts: THREE.Vector2[] = [[0.01, 0], [0.24, 0], [0.35, 0.1], [0.43, 0.38], [0.41, 0.62], [0.30, 0.78], [0.31, 0.86], [0.36, 0.9], [0.37, 0.95]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    const jar = new THREE.LatheGeometry(pts, 22);
    b.add(jar, clay, new THREE.Matrix4().makeTranslation(0.55, 0, 0.2));
    const wdisc = new THREE.CircleGeometry(0.28, 22); wdisc.rotateX(-Math.PI / 2);
    b.add(wdisc, lam("bnJarWater", () => ({ color: "#1a2c44" })), new THREE.Matrix4().makeTranslation(0.55, 0.87, 0.2));
    b.build(R);
    // fire reflection streak on the water (additive, shown in the climax frame)
    const glowTex = (() => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 512;
      const g = cv.getContext("2d")!;
      drawGlow(new Pen(g));
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    this.refl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 4.2),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0.5, 0.34, 0.18), fog: false }));
    this.refl.rotation.x = -Math.PI / 2; this.refl.position.set(0, -0.46, 5.2);
    this.refl.layers.set(NOINK); this.refl.visible = false; R.add(this.refl);
    // embers (additive points around the fire, repositioned per frame)
    const eg = new THREE.BufferGeometry();
    this.emberPos = new THREE.BufferAttribute(new Float32Array(90 * 3), 3);
    eg.setAttribute("position", this.emberPos);
    this.embers = new THREE.Points(eg, new THREE.PointsMaterial({ map: glowTex, color: "#ffa030", size: 0.055, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    this.embers.layers.set(NOINK); this.embers.frustumCulled = false; R.add(this.embers);
    // ---- cast + fire cards ----
    this.rendi = new Actor(R, bodyGeo);
    this.figure = new Actor(R, bodyGeo);
    this.fxBall = new Fx(R); this.fxHalo = new Fx(R); this.fxPool = new Fx(R);
    this.fxRingFx = new Fx(R); this.fxSplashFx = new Fx(R); this.fxShim = new Fx(R);
  }

  private stageActor(a: Actor, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, camX: number, camZ: number, mirror: boolean, s = 1) {
    a.r = this.pool.req(key, 1080, 1800, 1.8, draw);
    a.mesh.visible = true;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.set(0, Math.atan2(camX - x, camZ - z), 0);
    a.mesh.scale.set(mirror ? -s : s, s, s);
  }
  private stageFx(fx: Fx, key: string, cw: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, hdr: [number, number, number], flat = false) {
    fx.r = this.pool.req(key, cw, cw, 1, draw);
    fx.use(true);
    fx.mesh.visible = true;
    fx.mesh.position.set(x, y, z);
    fx.mesh.rotation.set(flat ? -Math.PI / 2 : 0, 0, 0);
    fx.mesh.scale.set(w, h, 1);
    fx.soft.color.setRGB(...hdr);
  }
  private embersAround(cx: number, cy: number, cz: number, r: number) {
    for (let i = 0; i < 90; i++) {
      const a = hh(i * 3 + 1) * Math.PI * 2, d = r * (0.4 + hh(i * 7 + 2) * 0.9);
      this.emberPos.setXYZ(i, cx + Math.cos(a) * d, cy + (hh(i * 11 + 3) - 0.35) * r * 1.3, cz + Math.sin(a) * d * 0.7);
    }
    this.emberPos.needsUpdate = true;
    this.embers.visible = true;
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const dawn = f === 2;
    // ---- camera per frame ----
    const CAMS: [number[], number[], number][] = [
      [[2.0, 1.65, -4.3], [-0.35, 1.35, 4.4], 44],   // 0: fireball over the bridge, Rendi facing it (from the road, EAST of the house — the old spot stared through the house wall)
      [[3.55, 1.25, 10.3], [0.1, 0.8, 3.5], 44],  // 1: climax — figure on the bridge, Rendi in the kali (foreground, clear of the deck)
      [[2.9, 1.5, 2.2], [-0.3, 0.8, -0.9], 42], // 2: dawn gentong (from beside the bridge mouth)
    ];
    const [pos, look, fov] = CAMS[f];
    cam.position.set(pos[0], pos[1], pos[2]); cam.up.set(0, 1, 0); cam.lookAt(look[0], look[1], look[2]);
    cam.fov = fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const skyMesh = this.root.getObjectByName("sky"); if (skyMesh) skyMesh.position.copy(cam.position);
    // ---- light rig per frame ----
    if (!dawn) {
      this.hemi.color.set("#2c3c5e"); this.hemi.groundColor.set("#0b0906"); this.hemi.intensity = 0.5;
      this.moon.color.set("#8fa8d8"); this.moon.intensity = 0.55;
      this.moon.position.set(pos[0] - 26, 34, pos[2] - 20); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(0.55, 0.62, 0.85); TONE.uShadeCol.value.set(0.10, 0.12, 0.22); TONE.uShadeLift.value.set(0.02, 0.03, 0.06);
      TONE.uLambert.value = 0.4; TONE.uSideK.value = 0.8; TONE.uTerm.value = 0.25; TONE.uBounce.value.set(0, 0, 0); TONE.uSat.value = 0.9;
      CHAR.uCharTint.value.set(0.8, 0.88, 1.06); CHAR.uCharShade.value = 0.42; CHAR.uGrad.value = 0.06;
      CHAR.uBodyGrad.value = 0.18; CHAR.uSideTint.value.set(0.72, 0.8, 1.12);
      this.fog.color.set("#0a0f1c"); this.fog.near = 16; this.fog.far = 110;
      const su = this.skyMat.uniforms;
      SKY_NIGHT.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_NIGHT.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    } else {
      this.hemi.color.set("#5a6c9c"); this.hemi.groundColor.set("#1a140e"); this.hemi.intensity = 0.8;
      this.moon.color.set("#ffb37a"); this.moon.intensity = 1.15;
      this.moon.position.set(pos[0] + 24, 11, pos[2] - 8); this.moon.target.position.set(look[0], 0, look[2]);
      TONE.uLitCol.value.set(1.15, 0.85, 0.55); TONE.uShadeCol.value.set(0.22, 0.26, 0.42); TONE.uShadeLift.value.set(0.05, 0.05, 0.09);
      TONE.uLambert.value = 0.4; TONE.uSideK.value = 0.82; TONE.uTerm.value = 0.3; TONE.uBounce.value.set(0.03, 0.015, 0); TONE.uSat.value = 0.95;
      CHAR.uCharTint.value.set(1.0, 0.9, 0.78); CHAR.uCharShade.value = 0.6; CHAR.uGrad.value = 0.07;
      CHAR.uBodyGrad.value = 0.2; CHAR.uSideTint.value.set(0.85, 0.82, 1.0);
      this.fog.color.set("#3a3c55"); this.fog.near = 20; this.fog.far = 160;
      const su = this.skyMat.uniforms;
      SKY_DAWN.c.forEach((h, i) => untone(h, su["c" + i].value));
      const e = SKY_DAWN.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    }
    const sc = this.moon.shadow.camera;
    sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 5; sc.far = 120; sc.updateProjectionMatrix();
    this.moon.shadow.bias = -0.0004; this.moon.shadow.normalBias = 0.03;
    scene.fog = this.fog; scene.background = null;
    // ---- staging ----
    for (const a of [this.rendi, this.figure]) a.mesh.visible = false;
    for (const x of [this.fxBall, this.fxHalo, this.fxPool, this.fxRingFx, this.fxSplashFx, this.fxShim]) x.mesh.visible = false;
    this.refl.visible = false; this.embers.visible = false;
    if (f === 0) {
      this.focus = [0, 1.7, 4.6]; this.cInf = 5;
      this.stageActor(this.rendi, "sc-rendi-front", (p) => { bodyFront(p, RENDI, { mode: "stand", expr: "nervous", seed: SEED_RENDI }); nightWash(p, 1); },
        1.15, 0, 1.05, pos[0], pos[2], false);
      this.stageFx(this.fxHalo, "halo", 512, (p) => drawFireGlow(p), 0, 1.78, 5.3, 1.8, 1.8, [1.05, 0.98, 0.88]);
      this.stageFx(this.fxBall, "ball-big", 700, (p) => drawFireball(p, { seed: 5 }), 0, 1.78, 4.6, 0.92, 0.92, [1.9, 1.7, 1.5]);
      this.stageFx(this.fxPool, "glowpool", 512, (p) => drawGlow(p), 0, deckY(4.6) + 0.03, 4.6, 1.7, 1.2, [0.8, 0.7, 0.6], true);
      this.embersAround(0, 1.8, 4.6, 0.75);
    } else if (f === 1) {
      this.focus = [0, 1.3, 3.4]; this.cInf = 5;
      this.stageActor(this.figure, "fig-front", (p) => drawFireFigure(p, false), 0, deckY(3.4) + 0.01, 3.4, pos[0], pos[2], false);
      this.stageFx(this.fxHalo, "halo", 512, (p) => drawFireGlow(p), 0, deckY(3.4) + 1.15, 3.9, 2.35, 2.35, [1.0, 0.92, 0.82]);
      this.stageFx(this.fxPool, "glowpool", 512, (p) => drawGlow(p), 0, deckY(3.4) + 0.03, 3.4, 2.0, 1.4, [0.85, 0.75, 0.65], true);
      this.refl.visible = true;
      this.stageActor(this.rendi, "sc-rendi-shock", (p) => { bodyFront(p, RENDI, { mode: "stand", expr: "shock", seed: SEED_RENDI }); nightWash(p, -1); },
        1.55, -1.12, 5.15, pos[0], pos[2], false);
      this.stageFx(this.fxRingFx, "ring", 600, (p) => fxRing(p, 0.45), 1.55, -0.44, 5.15, 1.5, 1.5, [0.7, 0.8, 1.0], true);
      this.stageFx(this.fxSplashFx, "splash", 800, (p) => fxSplash(p, 0.4), 1.55, -0.28, 4.9, 0.85, 0.85, [0.75, 0.85, 1.05]);
      this.embersAround(0, deckY(3.4) + 1.1, 3.4, 1.15);
    } else {
      this.focus = [0.55, 0.8, 0.2]; this.cInf = 4;
      this.stageActor(this.rendi, "sc-rendi-dawn", (p) => { bodySide(p, RENDI, { mode: "stand", expr: "relief", seed: SEED_RENDI }); dawnWash(p); },
        -0.95, 0, 0.35, pos[0], pos[2], false);
      this.stageFx(this.fxShim, "shimmer", 512, (p) => drawShimmer(p), 0.55, 0.885, 0.2, 0.6, 0.6, [1, 1, 1], true);
    }
    this.pool.flush();
    for (const a of [this.rendi, this.figure]) a.bind();
    for (const x of [this.fxBall, this.fxHalo, this.fxPool, this.fxRingFx, this.fxSplashFx, this.fxShim]) x.bind();
    return new THREE.Vector3(...this.focus);
  }
}
