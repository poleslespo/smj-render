#!/usr/bin/env bash
# prep-3d.sh — copy the Remotion/three.js test project's minimal render payload from the
# scratch tree into this repo (projects/<scene>/), so a render3d.yml run can render it.
# Ships: package.json + package-lock.json (runners run `npm ci`), src/, scripts/render.mjs,
# public/. NO node_modules (installed on the runner), NO out/ or remotion-tmp/ (local renders).
# Usage: tools/prep-3d.sh <scene-name> [src-dir]
set -euo pipefail
SCENE="${1:?usage: prep-3d.sh <scene-name> [src-dir]}"
SRC="${2:-$HOME/workspace/cartoon-tools/cartoon-3d-test}"
DST="$(cd "$(dirname "$0")/.." && pwd)/projects/$SCENE"
rm -rf "$DST"
mkdir -p "$DST/scripts" "$DST/public"
cp "$SRC/package.json" "$SRC/package-lock.json" "$DST/"
cp -r "$SRC/src" "$DST/src"
cp "$SRC/scripts/render.mjs" "$DST/scripts/render.mjs"
cp -r "$SRC/public/." "$DST/public/"
echo "prepared projects/$SCENE from $SRC:"
find "$DST" -type f | sort
du -sh "$DST"
