#!/usr/bin/env bash
# prep-episode.sh — copy ONE episode's minimal render payload from the live series1
# tree into this repo (episodes/<name>/), so a workflow run can render it.
# Only the files short.html actually pulls are copied: scenes.js, timeline.js,
# short.html, short.json, timeline.json. NO audio (segments are video-only;
# mix.wav stays on the VM and is muxed after concat), NO rec/, stills/, out/.
# Usage: tools/prep-episode.sh <episode-name> [series1-dir]
set -euo pipefail
EP="${1:?usage: prep-episode.sh <episode-name> [series1-dir]}"
SRC="${2:-$HOME/workspace/cartoon-tools/cartoon-shorts-skill/series1}"
DST="$(cd "$(dirname "$0")/.." && pwd)/episodes/$EP"
mkdir -p "$DST"
for f in scenes.js timeline.js short.html short.json timeline.json; do
  cp "$SRC/episodes/$EP/$f" "$DST/$f"
done
echo "prepared episodes/$EP from $SRC/episodes/$EP:"
ls -la "$DST"
