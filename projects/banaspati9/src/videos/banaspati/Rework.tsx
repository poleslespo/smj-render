// BanaspatiRework — Ep.9 v2 visual gate: 10 key stills (frames 0..9) from
// SHOTPLAN.md, rendered through the template post chain (ink -> lens ->
// bloom -> NEUTRAL tone map -> grade). The rework grade lifts shadows hard
// (the user's "masih terlalu gelap" verdict, twice) and eases the vignette
// so darkness lives only at the frame edges. Lens blur is gentled
// (maxCoC 14, cInf 4-ish) so the surroundings stay sharp and readable.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../layang/ink";
import { LensBlur } from "../layang/lensblur";
import { GradeEffect, GradeParams } from "../layang/grade";
import { ReworkWorld } from "./rworld";

export const GRADE_NIGHT_R: GradeParams = {
  ky: [0, 0.13, 0.33, 0.6, 0.84, 0.95, 1],
  sat: [0.95, 1.05, 1.08],
  tintS: [0.028, 0.003], tintM: [0.006, 0], tintH: [-0.012, 0.005],
  vig: [0.15, 0.45],
};
export const GRADE_DUSK_R: GradeParams = {
  ky: [0, 0.15, 0.35, 0.62, 0.85, 0.95, 1],
  sat: [0.98, 1.07, 1.12],
  tintS: [0.026, 0.002], tintM: [0.01, 0], tintH: [-0.014, 0.007],
  vig: [0.12, 0.48],
};

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.65, luminanceThreshold: 1.0, luminanceSmoothing: 0.25, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC = () => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new ReworkWorld(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 14, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADE_NIGHT_R, 1),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  const cam = camera as THREE.PerspectiveCamera;
  const d = world.frame(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fpt.set(...world.focus);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = world.cInf;
  fx.grade.set(d.phase === "dusk" ? GRADE_DUSK_R : GRADE_NIGHT_R);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
export const BanaspatiRework: React.FC = () => (
  <AbsoluteFill style={{ background: "#101a30" }}>
    <ThreeCanvas width={1080} height={1920} dpr={dprOverride() ?? 0.75} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.06 }}
      camera={{ fov: 44, near: 0.2, far: 1500 }}>
      <Inner />
    </ThreeCanvas>
  </AbsoluteFill>
);
