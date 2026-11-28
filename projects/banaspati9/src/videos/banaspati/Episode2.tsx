// BanaspatiEp2 — Ep.9 REWORK full episode (Phase 2). The approved stills'
// post chain (Rework.tsx: ink -> lens pre -> lens main -> bloom -> NEUTRAL
// tone map -> grade; lens gentled to maxCoC 14 so the surroundings stay
// readable) over rworld2's full-timeline world. Grades are the rework
// family (night/dusk lifted) plus a dawn grade derived in the same
// register for the L27 coda, which the stills gate never covered.
// Audio/captions are NOT part of this composition — the v1 master's mix
// and captions are re-muxed in post, untouched.
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
import { ReworkEpisodeWorld } from "./rworld2";
import { dofAt2 } from "./story9r";
import { stageAt } from "./story9";
import { GRADE_NIGHT_R, GRADE_DUSK_R } from "./Rework";

export const GRADE_DAWN_R: GradeParams = {
  ky: [0, 0.14, 0.34, 0.61, 0.85, 0.95, 1],
  sat: [0.98, 1.06, 1.11],
  tintS: [0.024, 0.002], tintM: [0.008, 0], tintH: [-0.014, 0.007],
  vig: [0.13, 0.47],
};

/** test window: L17 tail -> L24 end (drop/unfold/reveal/chase/leap/plunge) */
export const TEST2_OFF = 1960;
export const TEST2_LEN = 1455;

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
  const world = useMemo(() => new ReworkEpisodeWorld(), []);
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
  const d = dofAt2(f);
  world.focus = d.focus; world.cInf = d.cInf;
  world.update(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fpt.set(...world.focus);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = world.cInf;
  const phase = stageAt(f).phase;
  fx.grade.set(phase === "night" ? GRADE_NIGHT_R : phase === "dusk" ? GRADE_DUSK_R : GRADE_DAWN_R);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const Canvas: React.FC<{ off?: number }> = ({ off = 0 }) => (
  <AbsoluteFill style={{ background: "#101a30" }}>
    <ThreeCanvas width={1080} height={1920} dpr={dprOverride() ?? 0.75} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.06 }}
      camera={{ fov: 44, near: 0.2, far: 1500 }}>
      <Inner off={off} />
    </ThreeCanvas>
  </AbsoluteFill>
);
export const BanaspatiEp2: React.FC = () => <Canvas off={0} />;
/** climax test window: same world, frames shifted by TEST2_OFF */
export const BanaspatiEp2TestComp: React.FC = () => <Canvas off={TEST2_OFF} />;
