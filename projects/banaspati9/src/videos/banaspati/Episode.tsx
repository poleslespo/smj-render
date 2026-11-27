// BanaspatiEp — Ep.9 full 3D episode composition (the channel's first).
// Post chain copied from the proven BanaspatiScenes/Layang pattern (ink ->
// lens pre -> lens main -> bloom -> NEUTRAL tone map -> grade, MSAA 4).
// The night grade is LIFTED per the user's lighting note (shadow knot up,
// vignette eased); dusk/dawn grades cover the conversion coda. A frame
// offset via input props powers the climax test composition (same world,
// windowed frames) without a second code path.
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
import { EpisodeWorld } from "./eworld";
import { dofAt, stageAt } from "./story9";
import { TEST_OFF } from "./timing9";

export const GRADE_NIGHT_EP: GradeParams = {
  ky: [0, 0.09, 0.26, 0.55, 0.82, 0.95, 1],
  sat: [0.88, 1.02, 1.06],
  tintS: [0.03, 0.003], tintM: [0.006, 0], tintH: [-0.012, 0.005],
  vig: [0.24, 0.36],
};
export const GRADE_DUSK_EP: GradeParams = {
  ky: [0, 0.07, 0.22, 0.5, 0.8, 0.94, 1],
  sat: [0.95, 1.05, 1.12],
  tintS: [0.03, 0.002], tintM: [0.01, 0], tintH: [-0.014, 0.007],
  vig: [0.2, 0.4],
};
export const GRADE_DAWN_EP: GradeParams = {
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

const Inner: React.FC<{ off?: number }> = ({ off = 0 }) => {
  const f = useCurrentFrame() + off;
  const { camera, scene } = useThree();
  const world = useMemo(() => new EpisodeWorld(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADE_NIGHT_EP, 1),
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
  const d = dofAt(f);
  world.focus = d.focus; world.cInf = d.cInf;
  world.update(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fpt.set(...world.focus);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = world.cInf;
  const phase = stageAt(f).phase;
  fx.grade.set(phase === "night" ? GRADE_NIGHT_EP : phase === "dusk" ? GRADE_DUSK_EP : GRADE_DAWN_EP);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const Canvas: React.FC<{ off?: number }> = ({ off = 0 }) => (
  <AbsoluteFill style={{ background: "#070a14" }}>
    <ThreeCanvas width={1080} height={1920} dpr={dprOverride() ?? 0.75} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 42, near: 0.2, far: 1500 }}>
      <Inner off={off} />
    </ThreeCanvas>
  </AbsoluteFill>
);
export const BanaspatiEp: React.FC = () => <Canvas off={0} />;
/** climax test window: same world, frames shifted by TEST_OFF (timing9) */
export const BanaspatiTestComp: React.FC = () => <Canvas off={TEST_OFF} />;
