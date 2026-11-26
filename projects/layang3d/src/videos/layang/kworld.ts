// The Layang world: an Indonesian village field in the afternoon — grass field with a
// worn dirt play patch, houses along the north edge, Kakek's hut (gubuk) with a raised
// deck, a south fence, swaying hero trees, drifting clouds, birds (in cast2), the kite
// card and its sagging string. Rig (sky/lights/fog/clouds) follows the template world
// pattern from the plaza test; posing comes from story.ts + cast2.ts.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house } from "./build";
import { grassHD, cloudHD, beam, ctex } from "./paint";
import { Pen } from "./toon";
import { LIGHTS, LOOK } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor } from "./cards";
import { Cast, drawKiteCard } from "./cast2";
import { TOTAL, camAt, kiteAt, sagAt, ambT, windAt, V3 } from "./story";

const quadUp = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y: number) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};
const dirtTex = () => ctex("dirtPlay", 512, 512, (g, r) => {
  g.fillStyle = "#a9805a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = ["#b98f63", "#96703f", "#c49a6b", "#8a6538"][Math.floor(r() * 4)];
    g.globalAlpha = 0.13 + r() * 0.22;
    g.beginPath(); g.arc(r() * 512, r() * 512, 1 + r() * 3.5, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
});
const KSU = 0.0016; // kite card: 700 units = 1.12 m wide
const kiteGeo = (() => { const g = new THREE.PlaneGeometry(700 * KSU, 900 * KSU); g.translate(0, -100 * KSU, 0); return g; })();

type Sway = { g: THREE.Group; ph: number; amp: number };

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private cast: Cast;
  private kite: Actor;
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#b8d0ec", 25, 300);
  private clouds: THREE.Mesh[] = [];
  private sunDir: THREE.Vector3;
  private sways: Sway[] = [];
  private stringLine: THREE.Line;
  private stringGeo = new THREE.BufferGeometry();

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
    this.sun.shadow.mapSize.set(2048, 2048);
    this.fill = new THREE.DirectionalLight("#9fb8ff", 0.35);
    R.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);
    let fx = 0, fz = 0;
    for (let f = 0; f < TOTAL; f += 3) {
      const c = camAt(f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const nn = Math.hypot(fx, fz) || 1; fx /= nn; fz /= nn;
    const L = LIGHTS.day, az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    this.sunDir = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.5, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudHD(i % 4, LOOK.day.cloud), color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 32;
      m.position.set(Math.cos(a) * d, 130 + (i % 4) * 36, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.userData.baseX = m.position.x;
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground: grass, dirt play patch, dirt paths ----
    const b = new Batch();
    const grass = lam("grassHD", () => ({ map: grassHD() }));
    const dirt = lam("dirtPlay", () => ({ map: dirtTex() }));
    for (let gx = -132; gx < 132; gx += 12) for (let gz = -132; gz < 132; gz += 12) b.add(quadUp(gx, gx + 12, gz, gz + 12, 3, 3, 0), grass); // 12 m grid: one huge quad shades black in SwiftShader at grazing angles
    const patch = new THREE.CircleGeometry(8.5, 36); patch.rotateX(-Math.PI / 2); patch.scale(1.25, 1, 0.92);
    b.add(patch, dirt, new THREE.Matrix4().makeTranslation(0.5, 0.012, 0.5));
    b.add(quadUp(-14, 20, -19.2, -17.6, 12, 1, 0.018), dirt); // back path (the woman walks it)
    b.add(quadUp(-7.6, -5.4, -8.2, 1.5, 1, 5, 0.018), dirt); // hut path to the field
    // ---- houses: north row + west pair, all fronts to the field ----
    const H: [number, number, number, number, number, number, number][] = [
      [-26, -31, 0, 10, 8, 8.2, 0], [-13, -32, 0, 9, 8, 6.8, 1], [0, -31.5, 0, 11, 9, 9.4, 3], [13, -32, 0, 9, 8, 7.4, 4], [25, -31, 0, 10, 8, 8.6, 2],
      [-36, -14, Math.PI / 2, 10, 8, 8.4, 5], [-36.5, 8, Math.PI / 2, 9, 8, 7.2, 6],
      [38, -16, -Math.PI / 2, 10, 8, 8.8, 7],
    ];
    for (const [x, z, yaw, w, d, h, si] of H) house(b, x, z, yaw, w, d, h, si, 0);
    // ---- Kakek's hut (gubuk) at (-6.5, -8.5): raised deck, posts, thatch roof, back wall ----
    const wood = lam("woodHut", () => ({ map: beam() }));
    const darkWood = lam("darkWood", () => ({ color: "#6e4f30" }));
    const thatch = lam("thatch", () => ({ color: "#9a7f4e" }));
    b.add(boxGeo(V(-8.2, 0, -9.8), V(-4.8, 0.34, -7.2), 1), wood); // deck (seat edge at z=-7.2)
    b.add(boxGeo(V(-7.6, 0, -7.1), V(-5.4, 0.17, -6.6), 1), darkWood); // step
    for (const [px, pz] of [[-8.0, -9.6], [-5.0, -9.6], [-8.0, -7.4], [-5.0, -7.4]] as const)
      b.add(boxGeo(V(px - 0.055, 0.3, pz - 0.055), V(px + 0.055, 2.42, pz + 0.055), 1), darkWood);
    const roofM = new THREE.Matrix4().makeRotationX(-0.3).setPosition(-6.5, 2.66, -8.6);
    b.add(boxGeo(V(-2.15, -0.08, -1.85), V(2.15, 0.08, 1.85), 1), thatch, roofM);
    b.add(boxGeo(V(-8.65, 2.28, -7.02), V(-4.35, 2.46, -6.9), 1), darkWood); // front fascia under the roof edge
    b.add(boxGeo(V(-8.2, 0.34, -9.82), V(-4.8, 1.9, -9.7), 1), wood); // back wall
    // ---- south fence (behind the closing wide) ----
    const fenceW = lam("fenceW", () => ({ color: "#8a6a44" }));
    for (let x = -24; x <= 24; x += 2.4) b.add(boxGeo(V(x - 0.05, 0, 17.95), V(x + 0.05, 1.05, 18.05), 1), fenceW);
    b.add(boxGeo(V(-24.2, 0.82, 17.96), V(24.2, 0.92, 18.04), 1), fenceW);
    b.add(boxGeo(V(-24.2, 0.38, 17.96), V(24.2, 0.48, 18.04), 1), fenceW);
    // ---- static trees (batch) + distant hills ----
    const bark = lam("bark", () => ({ color: "#8a5a3c" }));
    const leafCols = ["#5aa83c", "#4c9a37", "#69b545"];
    const trunkG = new THREE.CylinderGeometry(0.13, 0.24, 1.9, 7); trunkG.translate(0, 0.95, 0);
    const still: [number, number, number][] = [[-24, -14, 1.1], [24, -16, 1.25], [-12, -22, 1.0], [10, -24, 1.15], [28, 2, 1.05], [-28, 6, 1.2], [-20, -26, 1.3], [19, -27, 1.2]];
    still.forEach(([x, z, s], ti) => {
      const m = new THREE.Matrix4().makeScale(s, s, s).setPosition(x, 0, z);
      b.add(trunkG, bark, m);
      const leaf = lam("leafS" + (ti % 3), () => ({ color: leafCols[ti % 3] }));
      const lobes: [number, number, number, number][] = [[0, 2.9, 0, 1.45], [0.85, 2.45, 0.3, 1.05], [-0.8, 2.5, -0.25, 1.0], [0.15, 3.5, -0.4, 0.95]];
      for (const [lx, ly, lz, r] of lobes) { const sg = new THREE.SphereGeometry(r, 18, 12); b.add(sg, leaf, new THREE.Matrix4().makeTranslation(lx, ly, lz).premultiply(m)); }
    });
    // distant hills are added after the batch as non-casting meshes (see below):
    // inside the Batch they would cast a field-wide shadow band (sun sits north).
    // foreground bushes near the S1 camera (foreground layer, kept off the subject line)
    const bush = lam("bush", () => ({ color: "#3f7d2e" }));
    for (const [x, z, r] of [[7.5, 12.5, 0.85], [-3.5, 13.8, 0.7], [8.3, 12.1, 0.55]] as const) {
      const sg = new THREE.SphereGeometry(r, 14, 10); sg.scale(1, 0.72, 1);
      b.add(sg, bush, new THREE.Matrix4().makeTranslation(x, r * 0.5, z));
    }
    // grass tufts scattered on the field (batch, static)
    const tuft = lam("tuft", () => ({ color: "#4c8a34" }));
    const tuftG = new THREE.ConeGeometry(0.1, 0.34, 6); tuftG.translate(0, 0.17, 0);
    let ti2 = 0;
    for (let x = -20; x <= 22; x += 3.7) for (let z = -12; z <= 14; z += 4.3) {
      const jx = x + ((ti2 * 37) % 10) / 6 - 0.8, jz = z + ((ti2 * 53) % 10) / 7 - 0.7; ti2++;
      if (Math.hypot(jx - 0.5, jz - 0.5) < 12.5) continue; // keep the dirt patch clear
      b.add(tuftG, tuft, new THREE.Matrix4().makeTranslation(jx, 0, jz));
    }
    b.build(R);
    // ---- distant hills (never cast shadows) ----
    const hillMat = new THREE.MeshLambertMaterial({ color: "#7fa05c" });
    for (const [x, z, r] of [[-150, -190, 110], [60, -230, 130], [190, -120, 95], [-230, -60, 100]] as const) {
      const hg = new THREE.SphereGeometry(r, 24, 12); hg.scale(1, 0.16, 1);
      const hm = new THREE.Mesh(hg, hillMat);
      hm.position.set(x, 0, z); hm.castShadow = false; hm.receiveShadow = false;
      R.add(hm);
    }
    // ---- hero swaying trees (own groups, gated ambient motion) ----
    const hero: [number, number, number, number][] = [[-16, -6, 1.2, 0.0], [14, -10, 1.35, 2.1], [20, 8, 1.1, 4.2]];
    hero.forEach(([x, z, s, ph], hi) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, 1.9, 7), new THREE.MeshLambertMaterial({ color: "#8a5a3c" }));
      trunk.position.y = 0.95; g.add(trunk);
      const leafM = new THREE.MeshLambertMaterial({ color: leafCols[hi % 3] });
      for (const [lx, ly, lz, r] of [[0, 2.9, 0, 1.45], [0.85, 2.45, 0.3, 1.05], [-0.8, 2.5, -0.25, 1.0], [0.15, 3.5, -0.4, 0.95]] as const) {
        const sm = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), leafM);
        sm.position.set(lx, ly, lz); g.add(sm);
      }
      R.add(g);
      this.sways.push({ g, ph, amp: 1 });
    });
    // ---- cast + kite + string ----
    this.cast = new Cast(R);
    this.kite = new Actor(R, kiteGeo);
    this.stringGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(25 * 3), 3));
    this.stringLine = new THREE.Line(this.stringGeo, new THREE.LineBasicMaterial({ color: "#33302c" }));
    this.stringLine.frustumCulled = false;
    this.stringLine.layers.set(NOINK);
    R.add(this.stringLine);
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const L = LIGHTS.day, K = LOOK.day, at = ambT(f), w = windAt(f);
    const c = camAt(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 30, 48, 120); // frustum must cover the whole field: outside it, ground samples dark shadow-map edge texels (black band)
    this.sun.position.copy(focus).addScaledVector(this.sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    const skyMesh = this.root.getObjectByName("sky");
    if (skyMesh) skyMesh.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.position.x = m.userData.baseX + at * (1.5 + i * 0.22);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    }
    // hero trees sway on gated time (frozen in the hening beat)
    for (const s of this.sways) {
      const a = (0.25 + 0.75 * w) * s.amp;
      s.g.rotation.z = Math.sin(at * 0.9 + s.ph) * 0.02 * a;
      s.g.rotation.x = Math.cos(at * 0.7 + s.ph) * 0.013 * a;
    }
    // cast (billboard yaw needs the camera position)
    this.cast.update(f, { x: cam.position.x, z: cam.position.z });
    // kite
    const ks = kiteAt(f);
    this.kite.r = this.pool.req(`kite-${Math.round(ks.dance * 8.8)}`, 700, 900, 1, (p: Pen) => drawKiteCard(p, ks.dance));
    this.pool.flush();
    this.kite.bind();
    this.kite.mesh.visible = true;
    this.kite.mesh.position.set(ks.pos[0], ks.pos[1], ks.pos[2]);
    this.kite.mesh.rotation.order = "YXZ";
    this.kite.mesh.rotation.y = Math.atan2(cam.position.x - ks.pos[0], cam.position.z - ks.pos[2]);
    this.kite.mesh.rotation.x = -0.42 + Math.sin(ks.dance * 1.3) * 0.07 * Math.min(1, w);
    this.kite.mesh.rotation.z = ks.roll;
    // string: spool (in Dika's acting hand) -> bridle, quadratic sag
    this.cast.dika.mesh.updateMatrixWorld();
    const a = this.cast.dika.mesh.localToWorld(this.cast.dikaHandLocal.clone());
    const bpt = new THREE.Vector3(ks.pos[0], ks.pos[1], ks.pos[2]);
    const sag = sagAt(f);
    const posAttr = this.stringGeo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < 25; i++) {
      const t = i / 24;
      const mx = (a.x + bpt.x) / 2, my = (a.y + bpt.y) / 2 - sag, mz = (a.z + bpt.z) / 2;
      const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * bpt.x;
      const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * bpt.y;
      const z = (1 - t) * (1 - t) * a.z + 2 * (1 - t) * t * mz + t * t * bpt.z;
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
    return focus;
  }
}
