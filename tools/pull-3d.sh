#!/usr/bin/env bash
# pull-3d.sh — after a render3d.yml run finishes:
#   1. download every seg3d-<scene>-<i> artifact of the run into ./pulled/<scene>-3d/
#   2. verify each segment's frame count against tools/chunks.mjs (ffprobe)
#   3. concat -c copy (video only) in chunk order -> projects/<scene>/out/<scene>-merged.mp4
#   4. verify the merged total frame count
# The scene is silent, so there is no audio mux step (unlike the 2D flow).
# Usage: tools/pull-3d.sh <scene> <totalFrames> <nChunks> [run-id]
# With no run-id, the latest completed run of render3d.yml is used.
set -euo pipefail
SCENE="${1:?usage: pull-3d.sh <scene> <totalFrames> <nChunks> [run-id]}"
TOTAL="${2:?missing totalFrames}"
NCH="${3:?missing nChunks}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"
RUN_ID="${4:-$(gh run list --workflow render3d.yml --status completed --limit 1 --json databaseId --jq '.[0].databaseId')}"
echo "run: $RUN_ID"
PULLED="pulled/$SCENE-3d"
rm -rf "$PULLED" # gh run download refuses to overwrite; a re-pull starts clean
mkdir -p "$PULLED" "projects/$SCENE/out"
gh run download "$RUN_ID" --pattern "seg3d-$SCENE-*" --dir "$PULLED"
node tools/chunks.mjs "$TOTAL" "$NCH" > /tmp/chunks3d.json
LIST="projects/$SCENE/out/concat.txt"
: > "$LIST"
node -e '
const fs = require("fs");
const chunks = JSON.parse(fs.readFileSync("/tmp/chunks3d.json", "utf8"));
for (const c of chunks) console.log(`${c.index} ${c.start} ${c.end}`);
' | while read -r idx start end; do
  f="$PULLED/seg3d-$SCENE-$idx/seg-$idx.mp4"
  [ -f "$f" ] || { echo "MISSING segment $idx ($f)"; exit 1; }
  got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f" | head -n 1 | tr -d '[:space:]')
  want=$((end - start))
  echo "chunk $idx: frames $got / $want"
  [ "$got" = "$want" ] || { echo "FRAME COUNT MISMATCH on chunk $idx"; exit 1; }
  echo "file '../../../$f'" >> "$LIST"
done
ffmpeg -y -v error -f concat -safe 0 -i "$LIST" -map 0:v:0 -c copy "projects/$SCENE/out/$SCENE-merged.mp4"
total_got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "projects/$SCENE/out/$SCENE-merged.mp4" | head -n 1 | tr -d '[:space:]')
echo "merged: $total_got frames (expected $TOTAL)"
[ "$total_got" = "$TOTAL" ] && echo "OK — merged segment is frame-exact" || { echo "MERGED FRAME COUNT MISMATCH"; exit 1; }
