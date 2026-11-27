// Banaspati scene stills (Ep.9 gate): the template post chain (ink -> lens
// blur -> bloom -> NEUTRAL tone map -> grade) over the night world. Frame 0 =
// fireball over the bamboo bridge, Rendi facing it; 1 = climax, the inverted
// fire figure stopped at the bridge edge, Rendi in the kali; 2 = dawn ending,
// the gentong with its faint warm shimmer. Grades are local: night presses
// the darks blue and lets the fire own the highlights; dawn lifts warm.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { NightWorld } from "./nworld";
import { InkPass, noInkFallback } from "../layang/ink";
import { LensBlur } from "../layang/lensblur";
import { GradeEffect, GradeParams } from "../layang/grade";

export const GRADE_NIGHT: GradeParams = {
  ky: [0, 0.055, 0.19, 0.48, 0.78, 0.92, 1],
  sat: [0.85, 1.0, 1.06],
  tintS: [0.03, 0.003], tintM: [0.006, 0], tintH: [-0.012, 0.005],
  vig: [0.34, 0.32],
};
export const GRADE_DAWN: GradeParams = {
  ky: [0, 0.08, 0.24, 0.55, 0.82, 0.94, 1],
  sat: [0.95, 1.06, 1.1],
  tintS: [0.02, 0.002], tintM: [0, 0], tintH: [-0.014, 0.007],
  vig: [0.18, 0.4],
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
  const world = useMemo(() => new NightWorld(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADE_NIGHT, 1),
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
  world.update(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fpt.set(...world.focus);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = world.cInf;
  fx.grade.set(f === 2 ? GRADE_DAWN : GRADE_NIGHT);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
export const BanaspatiScenes: React.FC = () => (
  <AbsoluteFill style={{ background: "#070a14" }}>
    <ThreeCanvas width={1080} height={1920} dpr={dprOverride() ?? 0.75} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 44, near: 0.2, far: 1500 }}>
      <Inner />
    </ThreeCanvas>
  </AbsoluteFill>
);
