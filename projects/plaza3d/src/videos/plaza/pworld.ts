// The plaza: one three.js scene (sky, clouds, grass, cobbled plaza + street, a ring of painted houses,
// trees, a fountain, lamp posts, benches) posed per frame from story.ts. Structure and light rig follow
// the template's world.ts, shrunk to a single day shot. The cast is two lit cards: the cycling kid
// (bike.ts) and one standing adult by the fountain (template bodyFront), each with a contact blob.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house } from "./build";
import { grassHD, cobbleHD, stoneHD, cloudHD, beam } from "./paint";
import { Pen, bodyFront, townsfolk, fxContact } from "./toon";
import { LIGHTS, LOOK } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cards";
import { drawBikeKid } from "./bike";
import { FPS, TOTAL, camAt, kidAt, pedalRev, V3 } from "./story";

const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y: number) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};

const KSU = 0.0018; // kid+bike card: 1000 design units = 1.8 m (wheels 0.34 m, seated head ~1.06 m)
const kidGeo = (() => { const g = new THREE.PlaneGeometry(600 * KSU, 1000 * KSU); g.translate(0, (975 - 500) * KSU, 0); return g; })();
const BLOB_COL = "#9e9494";
const ADULT_POS: V3 = [-7.5, 0, -11.5];

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private kid: Actor;
  private adult: Actor;
  private blobs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#b8d0ec", 25, 300);
  private clouds: THREE.Mesh[] = [];
  private sunDir: THREE.Vector3;

  constructor() {
    const R = this.root;
    // ---- sky + lights (template rig, day only) ----
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
    sky.renderOrder = -1; sky.frustumCulled = false; sky.layers.set(NOINK);
    sky.name = "sky";
    R.add(sky);
    this.hemi = new THREE.HemisphereLight("#dcecff", "#b49a78", 0.55);
    this.sun = new THREE.DirectionalLight("#fff3e0", 2.8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048); // template uses 4096 on a GPU machine; 2048 for the software-GL test VM
    this.fill = new THREE.DirectionalLight("#9fb8ff", 0.35);
    R.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);
    // sun frozen for the shot: mean view direction turned by the day preset's az/el (template method)
    let fx = 0, fz = 0;
    for (let f = 0; f < TOTAL; f += 3) {
      const c = camAt(f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const nn = Math.hypot(fx, fz) || 1; fx /= nn; fz /= nn;
    const L = LIGHTS.day, az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    this.sunDir = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    // clouds
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.5, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudHD(i % 4, LOOK.day.cloud), color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 32;
      m.position.set(Math.cos(a) * d, 130 + (i % 4) * 36, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground + plaza + street ----
    const b = new Batch();
    const grass = lam("grassHD", () => ({ map: grassHD() }));
    const cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    b.add(quadUp(-160, 160, -160, 160, 80, 80, 0), grass);
    const disc = new THREE.CircleGeometry(27, 40); disc.rotateX(-Math.PI / 2);
    b.add(disc, cobble, new THREE.Matrix4().makeTranslation(0, 0.012, 0));
    b.add(quadUp(-130, 130, -4.2, 4.2, 65, 2.1, 0.024), cobble); // the street the kid rides on
    b.add(quadUp(-4.2, 4.2, -130, 130, 2.1, 65, 0.018), cobble);  // cross street for depth
    // ---- houses ringing the plaza, fronts to the centre ----
    const H: [number, number, number, number, number, number, number][] = [
      // x, z, yaw, w, d, h, style
      [-25, -33, 0, 10, 8, 8.4, 0], [-12, -34, 0, 9, 8, 7.0, 1], [1, -33.5, 0, 11, 9, 9.8, 3], [14, -34, 0, 9, 8, 7.6, 4], [26, -33, 0, 10, 8, 8.8, 2],
      [-19, 35, Math.PI, 10, 8, 7.8, 5], [7, 35.5, Math.PI, 11, 9, 9.2, 6], [24, 34.5, Math.PI, 9, 8, 7.2, 7],
      [-35, -13, Math.PI / 2, 10, 8, 8.6, 2], [-35.5, 10, Math.PI / 2, 9, 8, 7.4, 0],
      [35, -12, -Math.PI / 2, 10, 8, 9.0, 1], [35.5, 11, -Math.PI / 2, 9, 8, 7.9, 4],
      [-58, -11, Math.PI / 2, 10, 8, 8.2, 6], [58, -10, -Math.PI / 2, 10, 8, 8.2, 3], // down-street depth
    ];
    for (const [x, z, yaw, w, d, h, si] of H) house(b, x, z, yaw, w, d, h, si, 0);
    // ---- trees: tapered trunk + clustered canopy lobes ----
    const bark = lam("bark", () => ({ color: "#8a5a3c" }));
    const leafCols = ["#5aa83c", "#4c9a37", "#69b545"];
    const trunkG = new THREE.CylinderGeometry(0.13, 0.24, 1.9, 7); trunkG.translate(0, 0.95, 0);
    const trees: [number, number, number][] = [
      [-20, -19, 1.1], [20, -20, 1.25], [-21, 18, 1.0], [21, 19, 1.15], [-13, -6.8, 0.9], [15, -6.8, 1.0],
      [-16, 6.8, 0.95], [19, 6.8, 0.9], [8.5, 4.6, 1.35], [-30, 0.5, 1.2], [31, -1, 1.1], // [8.5, 4.6] = foreground parallax tree (camera passes ~1.3 m from its trunk)
    ];
    trees.forEach(([x, z, s], ti) => {
      const m = new THREE.Matrix4().makeScale(s, s, s).setPosition(x, 0, z);
      b.add(trunkG, bark, m);
      const leaf = lam("leaf" + (ti % 3), () => ({ color: leafCols[ti % 3] }));
      const lobes: [number, number, number, number][] = [[0, 2.9, 0, 1.45], [0.85, 2.45, 0.3, 1.05], [-0.8, 2.5, -0.25, 1.0], [0.15, 3.5, -0.4, 0.95]];
      for (const [lx, ly, lz, r] of lobes) {
        const sg = new THREE.SphereGeometry(r, 18, 12);
        b.add(sg, leaf, new THREE.Matrix4().makeTranslation(lx, ly, lz).premultiply(m));
      }
    });
    // ---- fountain at (-9, -13) ----
    const stone = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
    const basin = new THREE.CylinderGeometry(2.6, 2.85, 0.55, 24); basin.translate(0, 0.275, 0);
    b.add(basin, stone, new THREE.Matrix4().makeTranslation(-9, 0, -13));
    const waterD = new THREE.CircleGeometry(2.35, 24); waterD.rotateX(-Math.PI / 2);
    b.add(waterD, lam("fwater", () => ({ color: "#2f7fa8" })), new THREE.Matrix4().makeTranslation(-9, 0.48, -13));
    const pillar = new THREE.CylinderGeometry(0.24, 0.34, 1.25, 10); pillar.translate(0, 0.62, 0);
    b.add(pillar, stone, new THREE.Matrix4().makeTranslation(-9, 0.4, -13));
    const bowl = new THREE.CylinderGeometry(0.72, 0.4, 0.22, 14); bowl.translate(0, 0.11, 0);
    b.add(bowl, stone, new THREE.Matrix4().makeTranslation(-9, 1.62, -13));
    // ---- lamp posts + benches ----
    const iron = lam("ironP", () => ({ color: "#3d414c" }));
    const lampG = new THREE.CylinderGeometry(0.05, 0.08, 3.4, 8); lampG.translate(0, 1.7, 0);
    const lampH = new THREE.SphereGeometry(0.17, 10, 8);
    for (const [x, z] of [[-11, 5.8], [16, -5.6], [-20, -5.6], [24, 5.8]] as const) {
      b.add(lampG, iron, new THREE.Matrix4().makeTranslation(x, 0, z));
      b.add(lampH, lam("lampGlass", () => ({ color: "#f7ead0" })), new THREE.Matrix4().makeTranslation(x, 3.5, z));
    }
    const wood = lam("wood", () => ({ map: beam() }));
    for (const [x, z, yaw] of [[-5.5, -9.5, 0.5], [13, -9.8, -0.4]] as const) {
      const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
      b.add(boxGeo(V(-0.9, 0.42, -0.22), V(0.9, 0.5, 0.22), 1), wood, m);
      b.add(boxGeo(V(-0.9, 0.78, -0.26), V(0.9, 0.86, -0.2), 1), wood, m);
      for (const s of [-0.7, 0.7]) b.add(boxGeo(V(s - 0.05, 0, -0.16), V(s + 0.05, 0.45, 0.16), 1), iron, m);
    }
    b.build(R);
    // ---- cast ----
    this.kid = new Actor(R, kidGeo);
    this.adult = new Actor(R);
    for (let i = 0; i < 2; i++) { const fx = new Fx(R); this.blobs.push(fx); }
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, L = LIGHTS.day, K = LOOK.day;
    const c = camAt(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // light rig
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(this.sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // sky + fog
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    const skyMesh = this.root.getObjectByName("sky");
    if (skyMesh) skyMesh.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) m.lookAt(cam.position.x, m.position.y, cam.position.z);
    // ---- cast ----
    const kp = kidAt(f), rev = pedalRev(f);
    const phaseStep = Math.floor(rev * 16) % 16, wheelStep = Math.floor(t * 3.58 * 24) % 24;
    const blink = f % 61 < 4;
    this.kid.r = this.pool.req(`bike|${phaseStep}|${wheelStep}|${blink ? 1 : 0}`, 900, 1500, 1.5,
      (p) => drawBikeKid(p, (phaseStep / 16) * Math.PI * 2, (wheelStep / 24) * Math.PI * 2, blink));
    this.kid.mesh.visible = true;
    this.kid.mesh.position.set(kp[0], 0.012 * Math.sin(rev * Math.PI * 2 * 2) ** 2, kp[2]);
    const ablink = f % 83 < 4;
    this.adult.r = this.pool.req(`adult|${ablink ? 1 : 0}`, 600, 1000, 1,
      (p: Pen) => bodyFront(p, townsfolk(2), { expr: "neutral", mode: "stand", blink: ablink, seed: 2 }));
    this.adult.mesh.visible = true;
    this.adult.mesh.position.set(...ADULT_POS);
    this.adult.mesh.rotation.y = Math.atan2(cam.position.x - ADULT_POS[0], cam.position.z - ADULT_POS[2]);
    // contact blobs
    const blobDefs = [
      { x: kp[0] + 0.05, z: kp[2], w: 1.9, h: 0.85 },
      { x: ADULT_POS[0], z: ADULT_POS[2], w: 0.8, h: 0.8 },
    ];
    blobDefs.forEach((bd, i) => {
      const fx = this.blobs[i];
      fx.r = this.pool.req(`blob|contact|${BLOB_COL}`, 128, 128, 1, (p) => fxContact(p, BLOB_COL));
      fx.use(false);
      fx.mesh.visible = true;
      fx.mesh.position.set(bd.x, 0.03, bd.z);
      fx.mesh.rotation.set(-Math.PI / 2, 0, 0);
      fx.mesh.scale.set(bd.w, bd.h, 1);
    });
    this.pool.flush();
    this.kid.bind(); this.adult.bind();
    for (const fx of this.blobs) fx.bind();
    return focus;
  }
}
