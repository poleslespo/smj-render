import React from "react";
import { Composition } from "remotion";
import { PlazaShort, PLAZA_FRAMES } from "./videos/plaza/Plaza";
import { LayangShort, LAYANG_FRAMES } from "./videos/layang/Layang";
import { LayangSheet } from "./videos/layang/Sheet";
import { BanaspatiSheet } from "./videos/banaspati/Sheet";
import { BanaspatiScenes } from "./videos/banaspati/Scenes";
import { BanaspatiEp, BanaspatiTestComp } from "./videos/banaspati/Episode";
import { BanaspatiEp2, BanaspatiEp2TestComp, TEST2_LEN } from "./videos/banaspati/Episode2";
import { BanaspatiRework } from "./videos/banaspati/Rework";
import { TOTAL as EP9_FRAMES, TEST_OFF, TEST_LEN } from "./videos/banaspati/timing9";

export const Root: React.FC = () => (
  <>
    <Composition id="PlazaShort" component={PlazaShort} durationInFrames={PLAZA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LayangShort" component={LayangShort} durationInFrames={LAYANG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LayangSheet" component={LayangSheet} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiSheet" component={BanaspatiSheet} durationInFrames={8} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiScenes" component={BanaspatiScenes} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiEp" component={BanaspatiEp} durationInFrames={EP9_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiTest" component={BanaspatiTestComp} durationInFrames={TEST_LEN} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiRework" component={BanaspatiRework} durationInFrames={10} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiEp2" component={BanaspatiEp2} durationInFrames={EP9_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BanaspatiEp2Test" component={BanaspatiEp2TestComp} durationInFrames={TEST2_LEN} fps={30} width={1080} height={1920} />
  </>
);
