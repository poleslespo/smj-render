// Banaspati design sheets (Ep.9 gate): frame 0 = fireball at TRUE scale beside
// Rendi (fist-sized vs fear-enlarged — the growth mechanic), 1 = fireball flame
// detail, 2 = inverted burning figure front + side, 3 = face-in-flame close,
// 4 = cast full bodies, 5 = cast busts. Dark night stage, no post chain — the
// fire carries its own painted halo; night/fire light is baked into the cards.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Pool, Actor, Fx, SU } from "../layang/cards";
import { Pen, bodyFront, fxContact } from "../layang/toon";
import { CHAR } from "../layang/shade";
import { NOINK } from "../layang/ink";
import { drawFireball, drawFireFigure, drawGlow } from "./fire";
import { RENDI, SEED_RENDI, nightWash, tonoFront, karsoFront, rendiBust, karsoBust, tonoBust, rendiSide, karsoSide, tonoSide, rendiBack, karsoBack, tonoBack } from "./cast9";

const bodyGeo = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const bustGeo = (() => {
  const g = new THREE.PlaneGeometry(600 * SU, 800 * SU); g.translate(0, 425 * SU, 0);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 0.05 + uv.getY(i) * 0.8);
  return g;
})();
const sqGeo = new THREE.PlaneGeometry(1, 1);
const BG = "#070a14";

class SheetWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private ground: THREE.Mesh;
  constructor() {
    const R = this.root;
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshBasicMaterial({ color: BG }));
    bg.position.set(0, 3, -4); bg.layers.set(NOINK); R.add(bg);
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.05), new THREE.MeshBasicMaterial({ color: "#1a2233" }));
    this.ground.position.set(0, 0.02, -0.2); this.ground.layers.set(NOINK); R.add(this.ground);
    R.add(new THREE.HemisphereLight("#33415e", "#0c0a08", 0.55));
    const moon = new THREE.DirectionalLight("#a8c0ff", 0.7); moon.position.set(4, 7, 5); R.add(moon);
    for (let i = 0; i < 4; i++) this.actors.push(new Actor(R, bodyGeo));
    for (let i = 0; i < 3; i++) this.actors.push(new Actor(R, bustGeo));
    for (let i = 0; i < 8; i++) this.fxs.push(new Fx(R));
  }
  private actor(i: number, key: string, w: number, h: number, k: number, draw: (p: Pen) => void,
    x: number, y: number, z: number, s: number, mirror = false) {
    const a = this.actors[i];
    a.r = this.pool.req(key, w, h, k, draw);
    a.mesh.visible = true;
    a.mesh.position.set(x, y, z);
    a.mesh.rotation.set(0, 0, 0);
    a.mesh.scale.set(mirror ? -s : s, s, s);
  }
  private fx(i: number, key: string, cw: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h = w, soft = true, flat = false) {
    const f = this.fxs[i];
    f.r = this.pool.req(key, cw, cw, 1, draw);
    f.use(soft);
    f.mesh.visible = true;
    f.mesh.position.set(x, y, z);
    f.mesh.rotation.set(flat ? -Math.PI / 2 : 0, 0, 0);
    f.mesh.scale.set(w, h, 1);
    if (soft) f.soft.color.setRGB(1, 1, 1);
  }
  private blob(i: number, x: number, z: number, w: number) {
    const f = this.fxs[i];
    f.r = this.pool.req("blob|contact|#0a0c12", 128, 128, 1, (p) => fxContact(p, "#0a0c12"));
    f.use(false);
    f.mesh.visible = true;
    f.mesh.position.set(x, 0.035, z);
    f.mesh.rotation.set(-Math.PI / 2, 0, 0);
    f.mesh.scale.set(w, w * 0.85, 1);
  }
  private glowPool(i: number, x: number, z: number, w: number) {
    this.fx(i, "glowpool", 512, (p) => drawGlow(p), x, 0.045, z, w, w * 0.7, true, true);
  }
  update(f: number, cam: THREE.PerspectiveCamera) {
    cam.position.set(0, 1.66, 7.2); cam.lookAt(0, 1.38, 0);
    cam.fov = 46; cam.near = 0.2; cam.far = 100; cam.updateProjectionMatrix();
    cam.layers.enable(NOINK);
    CHAR.uCharTint.value.set(0.82, 0.88, 1.05); CHAR.uCharShade.value = 0.5; CHAR.uGrad.value = 0.05;
    CHAR.uBodyGrad.value = 0.15; CHAR.uSideTint.value.set(0.75, 0.82, 1.1);
    for (const a of this.actors) a.mesh.visible = false;
    for (const x of this.fxs) x.mesh.visible = false;
    if (f === 0) {
      // growth mechanic at true scale: Rendi + fist ball at his head + enlarged ball
      this.actor(0, "sh-rendi-stand", 1080, 1800, 1.8, (p) => { bodyFront(p, RENDI, { mode: "stand", expr: "nervous", seed: SEED_RENDI }); nightWash(p, 1); }, -1.02, 0.03, 0, 1.3);
      this.blob(0, -1.02, 0, 0.85);
      this.fx(1, "ball-small", 700, (p) => drawFireball(p, { seed: 3 }), -1.48, 1.52, 0.1, 0.14);
      this.fx(2, "ball-big", 700, (p) => drawFireball(p, { seed: 5 }), 1.02, 1.52, 0, 0.92);
      this.glowPool(3, 1.02, 0.1, 1.5);
    } else if (f === 1) {
      this.fx(0, "ball-detail", 700, (p) => drawFireball(p, { seed: 7 }), 0.25, 1.95, 0, 2.35);
      this.fx(1, "ball-detail2", 700, (p) => drawFireball(p, { seed: 11 }), -1.08, 0.95, 0, 0.85);
      this.glowPool(2, -1.08, 0.05, 1.3);
    } else if (f === 2) {
      this.actor(0, "fig-front", 1080, 1800, 1.8, (p) => drawFireFigure(p, false), -0.78, 0.03, 0, 1.3);
      this.actor(1, "fig-side", 1080, 1800, 1.8, (p) => drawFireFigure(p, true), 0.8, 0.03, -0.05, 1.3);
      this.glowPool(0, -0.78, 0.05, 1.7);
      this.glowPool(1, 0.8, 0.05, 1.7);
    } else if (f === 3) {
      this.fx(0, "ball-face", 700, (p) => drawFireball(p, { face: 1, seed: 13 }), 0.1, 1.95, 0, 2.9);
      this.fx(1, "ball-face2", 700, (p) => drawFireball(p, { face: 1, seed: 17 }), -1.12, 0.72, 0.1, 0.55);
    } else if (f === 4) {
      this.actor(0, "sh-rendi-n", 1080, 1800, 1.8, (p) => { bodyFront(p, RENDI, { mode: "stand", expr: "nervous", seed: SEED_RENDI }); nightWash(p, 1); }, -1.22, 0.03, 0, 1.28);
      this.actor(1, "sh-karso", 1080, 1800, 1.8, (p) => { karsoFront(p, "stern"); nightWash(p, 1); }, 0, 0.03, -0.04, 1.28);
      this.actor(2, "sh-tono", 1080, 1800, 1.8, (p) => { tonoFront(p, "neutral"); nightWash(p, 1); }, 1.22, 0.03, 0, 1.28);
      this.blob(0, -1.22, 0, 0.8); this.blob(1, 0, -0.04, 0.85); this.blob(2, 1.22, 0, 0.8);
    } else if (f === 5) {
      this.actor(4, "bust-rendi", 900, 1500, 1.5, (p) => { rendiBust(p, "nervous"); nightWash(p, 1); }, -1.12, 0.55, 0, 0.92);
      this.actor(5, "bust-karso", 900, 1500, 1.5, (p) => { karsoBust(p, "stern"); nightWash(p, 1); }, 0, 0.55, -0.03, 0.92);
      this.actor(6, "bust-tono", 900, 1500, 1.5, (p) => { tonoBust(p, "pained"); nightWash(p, 1); }, 1.12, 0.55, 0, 0.92);
    } else if (f === 6) {
      // U5 facing variants: Rendi front / side / back on one rig
      this.actor(0, "fv-rendi-front", 1080, 1800, 1.8, (p) => { bodyFront(p, RENDI, { mode: "stand", expr: "neutral", seed: SEED_RENDI }); nightWash(p, 1); }, -1.22, 0.03, 0, 1.28);
      this.actor(1, "fv-rendi-side", 1080, 1800, 1.8, (p) => { rendiSide(p, "neutral"); nightWash(p, 1); }, 0, 0.03, -0.04, 1.28);
      this.actor(2, "fv-rendi-back", 1080, 1800, 1.8, (p) => { rendiBack(p); nightWash(p, 1); }, 1.22, 0.03, 0, 1.28);
      this.blob(0, -1.22, 0, 0.8); this.blob(1, 0, -0.04, 0.85); this.blob(2, 1.22, 0, 0.8);
    } else {
      // U5 facing variants: Karso side / back, Tono side / back
      this.actor(0, "fv-karso-side", 1080, 1800, 1.8, (p) => { karsoSide(p, "stern"); nightWash(p, 1); }, -1.35, 0.03, 0, 1.05);
      this.actor(1, "fv-karso-back", 1080, 1800, 1.8, (p) => { karsoBack(p); nightWash(p, 1); }, -0.45, 0.03, -0.04, 1.05);
      this.actor(2, "fv-tono-side", 1080, 1800, 1.8, (p) => { tonoSide(p, "neutral"); nightWash(p, 1); }, 0.45, 0.03, 0, 1.05);
      this.actor(3, "fv-tono-back", 1080, 1800, 1.8, (p) => { tonoBack(p); nightWash(p, 1); }, 1.35, 0.03, -0.04, 1.05);
      this.blob(0, -1.35, 0, 0.68); this.blob(1, -0.45, -0.04, 0.72); this.blob(2, 0.45, 0, 0.68); this.blob(3, 1.35, -0.04, 0.72);
    }
    this.pool.flush();
    for (const a of this.actors) a.bind();
    for (const x of this.fxs) x.bind();
  }
}

const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const world = useMemo(() => new SheetWorld(), []);
  world.update(f, camera as THREE.PerspectiveCamera);
  return <primitive object={world.root} dispose={null} />;
};

export const BanaspatiSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <ThreeCanvas width={1080} height={1920} dpr={1} gl={{ antialias: true, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 46, near: 0.2, far: 100 }}>
      <Inner />
    </ThreeCanvas>
  </AbsoluteFill>
);
