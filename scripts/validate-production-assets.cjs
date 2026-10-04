const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const musicRoot = path.join(root, 'assets/music');
const manifestPath = path.join(musicRoot, 'music-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let failed = false;

const listed = new Set();
for (const track of manifest.tracks ?? []) {
  const relative = String(track.file || '').replace(/\\/g, '/');
  listed.add(relative);
  const file = path.join(musicRoot, relative);
  if (!fs.existsSync(file)) {
    console.error(`Missing music asset: ${track.id} -> ${relative}`);
    failed = true;
  }
  if (track.productionReady !== true) {
    console.error(`Not production-cleared: ${track.id} (${track.license || 'no license recorded'})`);
    failed = true;
  }
  if (!track.license || /placeholder|tbd|unknown/i.test(track.license)) {
    console.error(`Invalid licence record: ${track.id}`);
    failed = true;
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const file of walk(musicRoot).filter((file) => /\.mp3$/i.test(file))) {
  const relative = path.relative(musicRoot, file).replace(/\\/g, '/');
  if (!listed.has(relative)) {
    console.error(`Unlisted music asset: ${relative}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`Production assets clear: ${(manifest.tracks ?? []).length} bundled music tracks.`);
