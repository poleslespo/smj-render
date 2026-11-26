#!/usr/bin/env bash
# pull-and-concat.sh — after a render workflow run finishes:
#   1. download every seg-<episode>-<i> artifact of the run into ./pulled/<episode>/
#   2. verify each segment's frame count against tools/chunks.mjs (ffprobe)
#   3. concat -c copy in chunk order -> episodes/<episode>/out/<episode>-merged.ts
# Audio mux stays a separate VM step afterwards, exactly like the Box flow:
#   ffmpeg -i merged.ts -i episodes/<ep>/audio-local/mix.wav ... (see README)
# Usage: tools/pull-and-concat.sh <episode> <totalFrames> <nChunks> [run-id]
# With no run-id, the latest completed run of render.yml is used.
set -euo pipefail
EP="${1:?usage: pull-and-concat.sh <episode> <totalFrames> <nChunks> [run-id]}"
TOTAL="${2:?missing totalFrames}"
NCH="${3:?missing nChunks}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"
RUN_ID="${4:-$(gh run list --workflow render.yml --status completed --limit 1 --json databaseId --jq '.[0].databaseId')}"
echo "run: $RUN_ID"
PULLED="pulled/$EP"
mkdir -p "$PULLED" "episodes/$EP/out"
gh run download "$RUN_ID" --pattern "seg-$EP-*" --dir "$PULLED"
# expected ranges
node tools/chunks.mjs "$TOTAL" "$NCH" > /tmp/chunks.json
LIST="episodes/$EP/out/concat.txt"
: > "$LIST"
node -e '
const fs = require("fs");
const chunks = JSON.parse(fs.readFileSync("/tmp/chunks.json", "utf8"));
for (const c of chunks) console.log(`${c.index} ${c.start} ${c.end}`);
' | while read -r idx start end; do
  f="$PULLED/seg-$EP-$idx/$EP-part-$idx.ts"
  [ -f "$f" ] || { echo "MISSING segment $idx ($f)"; exit 1; }
  got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$f" | head -n 1 | tr -d '[:space:]')
  want=$((end - start))
  echo "chunk $idx: frames $got / $want"
  [ "$got" = "$want" ] || { echo "FRAME COUNT MISMATCH on chunk $idx"; exit 1; }
  echo "file '$EP-part-$idx.ts'" >> "$LIST"
done
# concat list paths are relative to the concat file's dir; segments live in $PULLED — copy them in
for d in "$PULLED"/seg-"$EP"-*; do cp "$d"/*.ts "episodes/$EP/out/"; done
ffmpeg -y -v error -f concat -safe 0 -i "$LIST" -c copy "episodes/$EP/out/$EP-merged.ts"
total_got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "episodes/$EP/out/$EP-merged.ts" | head -n 1 | tr -d '[:space:]')
echo "merged: $total_got frames (expected $TOTAL)"
[ "$total_got" = "$TOTAL" ] && echo "OK — merged segment is frame-exact" || { echo "MERGED FRAME COUNT MISMATCH"; exit 1; }
