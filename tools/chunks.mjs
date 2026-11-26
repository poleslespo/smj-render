// chunks.mjs — split [0, totalFrames) into N contiguous, near-equal frame ranges.
// Usage: node tools/chunks.mjs <totalFrames> <nChunks>
// Prints a JSON array: [{"index":0,"start":0,"end":365}, ...]  (end exclusive)
// The render workflow feeds this to a GitHub Actions matrix via fromJson().
const total = Math.floor(+process.argv[2]);
const n = Math.floor(+process.argv[3]);
if (!(total > 0) || !(n > 0)) { console.error('usage: node tools/chunks.mjs <totalFrames> <nChunks>'); process.exit(1); }
const count = Math.min(n, total);
const base = Math.floor(total / count), extra = total % count;
const chunks = [];
let s = 0;
for (let i = 0; i < count; i++) {
  const len = base + (i < extra ? 1 : 0);
  chunks.push({ index: i, start: s, end: s + len });
  s += len;
}
console.log(JSON.stringify(chunks));
