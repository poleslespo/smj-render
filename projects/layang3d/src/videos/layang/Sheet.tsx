// Character sheets for the Layang redesign gate: frame 0 = Dika, frame 1 = Kakek
// (full-body neutral + the expression busts the short uses), frame 2 = both full
// bodies in flat black for the silhouette-distinctness test. Plain background,
// no post chain — the same card system (Pool/Actor/cardShade) as the short itself.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Pool, Actor, SU } from "./cards";
import { Pen, bodyFront, Outfit } from "./toon";
import { DIKA, KAKEK, dikaBust, kakekBust } from "./cast2";
import { CHAR } from "./shade";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";

const bodyGeo = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
/** bust crop of the same canvas: shows design y 150..950 (hat crown + shoulders), via a uv remap */
const bustGeo = (() => {
  const g = new THREE.PlaneGeometry(600 * SU, 800 * SU); g.translate(0, 425 * SU, 0);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 0.05 + uv.getY(i) * 0.8);
  return g;
})();

const SIL = "#17141c";
const DIKA_SIL: Outfit = { jacket: SIL, pants: SIL, boots: SIL, hat: "cap", cap: SIL, skin: SIL, build: "kid" };
const KAKEK_SIL: Outfit = { jacket: SIL, pants: SIL, boots: SIL, hat: "peci", hair: SIL, moustache: SIL, skin: SIL, build: "adult" };

type Slot = { actor: Actor; key: string; w: number; h: number; k: number; draw: (p: Pen) => void; x: number; y: number; z: number; s: number };

class SheetWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private bodies: Actor[] = [];
  private busts: Actor[] = [];
  private ground: THREE.Mesh;
  constructor() {
    const R = this.root, L = LIGHTS.day;
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: "#ece7db" }));
    bg.position.set(0, 2, -3); R.add(bg);
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.03), new THREE.MeshBasicMaterial({ color: "#b3a58c" }));
    this.ground.position.set(0, 0.265, -0.2); R.add(this.ground);
    R.add(new THREE.HemisphereLight(L.sky, L.ground, L.hemiI));
    const sun = new THREE.DirectionalLight(L.sunCol, L.sunI); sun.position.set(5, 8, 6); R.add(sun);
    for (let i = 0; i < 2; i++) this.bodies.push(new Actor(R, bodyGeo));
    for (let i = 0; i < 6; i++) this.busts.push(new Actor(R, bustGeo));
  }
  private layout(f: number): Slot[] {
    const B = (i: number, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, s: number): Slot =>
      ({ actor: this.bodies[i], key, w: 1080, h: 1800, k: 1.8, draw, x, y, z, s });
    const U = (i: number, key: string, draw: (p: Pen) => void, x: number, y: number): Slot =>
      ({ actor: this.busts[i], key, w: 900, h: 1500, k: 1.5, draw, x, y, z: -0.05, s: 0.6 });
    if (f === 0) return [
      B(0, "sheet-dk-full", (p) => bodyFront(p, DIKA, { mode: "stand", expr: "smile", blink: 0, seed: 5 }), -0.8, 0.28, 0, 1.38),
      U(0, "sheet-dk-laugh", (p) => dikaBust(p, DIKA, "laugh"), 0.3, 2.52),
      U(1, "sheet-dk-shock", (p) => dikaBust(p, DIKA, "shock"), 1.06, 2.52),
      U(2, "sheet-dk-nervous", (p) => dikaBust(p, DIKA, "nervous"), 0.3, 1.5),
      U(3, "sheet-dk-stern", (p) => dikaBust(p, DIKA, "stern"), 1.06, 1.5),
      U(4, "sheet-dk-relief", (p) => dikaBust(p, DIKA, "relief_open"), 0.3, 0.48),
      U(5, "sheet-dk-smile", (p) => dikaBust(p, DIKA, "smile"), 1.06, 0.48),
    ];
    if (f === 1) return [
      B(0, "sheet-kk-full", (p) => bodyFront(p, KAKEK, { mode: "stand", expr: "neutral", blink: 0, seed: 11 }), -0.8, 0.28, 0, 1.38),
      U(0, "sheet-kk-neutral", (p) => kakekBust(p, KAKEK, "neutral"), 0.3, 2.52),
      U(1, "sheet-kk-call", (p) => kakekBust(p, KAKEK, "smile", "o"), 1.06, 2.52),
      U(2, "sheet-kk-teach", (p) => kakekBust(p, KAKEK, "smile_closed"), 0.3, 1.5),
      U(3, "sheet-kk-relief", (p) => kakekBust(p, KAKEK, "relief_open"), 1.06, 1.5),
    ];
    return [
      B(0, "sheet-dk-sil", (p) => bodyFront(p, DIKA_SIL, { mode: "stand", expr: "smile", blink: 0, seed: 5 }), -0.6, 0.42, 0, 1.5),
      B(1, "sheet-kk-sil", (p) => bodyFront(p, KAKEK_SIL, { mode: "stand", expr: "neutral", blink: 0, seed: 11 }), 0.6, 0.42, -0.05, 1.5),
    ];
  }
  update(f: number, cam: THREE.PerspectiveCamera) {
    const L = LIGHTS.day;
    cam.position.set(0, 1.78, 6.6); cam.lookAt(0, 1.72, 0);
    cam.fov = 42; cam.near = 0.2; cam.far = 100; cam.updateProjectionMatrix();
    cam.layers.enable(NOINK);
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    this.ground.position.y = f === 2 ? 0.405 : 0.265;
    const used = new Set<Actor>();
    for (const s of this.layout(f)) {
      used.add(s.actor);
      s.actor.r = this.pool.req(s.key, s.w, s.h, s.k, s.draw);
      s.actor.mesh.visible = true;
      s.actor.mesh.position.set(s.x, s.y, s.z);
      s.actor.mesh.rotation.set(0, 0, 0);
      s.actor.mesh.scale.set(s.s, s.s, s.s);
    }
    for (const a of [...this.bodies, ...this.busts]) if (!used.has(a)) a.mesh.visible = false;
    this.pool.flush();
    for (const a of [...this.bodies, ...this.busts]) a.bind();
  }
}

const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const world = useMemo(() => new SheetWorld(), []);
  world.update(f, camera as THREE.PerspectiveCamera);
  return <primitive object={world.root} dispose={null} />;
};

export const LayangSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#ece7db" }}>
    <ThreeCanvas width={1080} height={1920} dpr={0.75} gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 42, near: 0.2, far: 100 }}>
      <Inner />
    </ThreeCanvas>
  </AbsoluteFill>
);
