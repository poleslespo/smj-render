// usage: node scripts/render.mjs <output.mp4> [fromFrame toFrame]
// Full pipeline render via renderMedia (the CLI cannot pass --enable-unsafe-swiftshader, which this
// Chromium needs for software WebGL). Prints bundle time, render wall time and s/frame.
import fs from "node:fs";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [output, from, to] = process.argv.slice(2);
// CHROME_PATH unset (e.g. on a GitHub runner) -> undefined -> Remotion uses its own downloaded
// Chrome Headless Shell. On this VM the caller passes the Playwright Chromium explicitly.
const browserExecutable = process.env.CHROME_PATH || undefined;
const chromiumOptions = { gl: "angle", flags: { "enable-unsafe-swiftshader": true } };
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: "PlazaShort", browserExecutable, chromiumOptions });
const tBundle = (Date.now() - t0) / 1000;
const frameRange = from !== undefined ? [Number(from), Number(to)] : undefined;
const n = frameRange ? frameRange[1] - frameRange[0] + 1 : composition.durationInFrames;
let last = 0;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 16, outputLocation: output,
  browserExecutable, chromiumOptions, frameRange,
  timeoutInMilliseconds: 300000,
  concurrency: Number(process.env.CONC || 1),
  onProgress: ({ progress }) => { const p = Math.floor(progress * 20); if (p > last) { last = p; console.log(`progress ${Math.round(progress * 100)}% at ${((Date.now() - t0) / 1000).toFixed(0)}s`); } },
});
const total = (Date.now() - t0) / 1000;
console.log(JSON.stringify({ bundle_s: +tBundle.toFixed(1), render_s: +(total - tBundle).toFixed(1), frames: n, s_per_frame: +((total - tBundle) / n).toFixed(2), total_s: +total.toFixed(1) }));
