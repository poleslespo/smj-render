import React from "react";
import { Composition } from "remotion";
import { PlazaShort, PLAZA_FRAMES } from "./videos/plaza/Plaza";
import { LayangShort, LAYANG_FRAMES } from "./videos/layang/Layang";

export const Root: React.FC = () => (
  <>
    <Composition id="PlazaShort" component={PlazaShort} durationInFrames={PLAZA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LayangShort" component={LayangShort} durationInFrames={LAYANG_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
