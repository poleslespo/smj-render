
## 3D route (render3d.yml) — added 2026-11-26

A sibling workflow for the cartoon_3d_short skill (Remotion + three.js):
`tools/prep-3d.sh <scene>` stages a Remotion project into `projects/<scene>/`
(package.json + lockfile, src/, scripts/render.mjs, public/); `render3d.yml`
matrix-splits the frame range with the same `tools/chunks.mjs`, each runner
npm-ci's, renders only its range via renderMedia, verifies its frame count
and uploads `seg3d-<scene>-<i>`; `tools/pull-3d.sh` downloads, re-verifies,
concats `-c copy` and checks the merged total. WebGL on runners is software
SwiftShader and needs `--enable-unsafe-swiftshader` (passed in render.mjs).
Proven 2026-11-26 on the plaza3d test (390 frames): run 45840426122 all 10
jobs green, dispatch→done 159 s, merged frame-exact; a lamp-placement fix
re-ran as 45841747810 in 164 s, also frame-exact, QA clean.
