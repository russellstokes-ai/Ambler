const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

const data = read('src/ui-prototype/data.ts');
const screens = read('src/ui-prototype/screens.tsx');
const checklist = read('docs/ui/09_DRAFTBIT_IMPLEMENTATION_CHECKLIST.md');
const motion = read('docs/UI_MOTION_STANDARD.md');
const lottiePolicy = read('docs/LOTTIE_ASSET_POLICY.md');
const previewRoute = read('app/ui-preview/[screen].tsx');

const ids = [...data.matchAll(/\{ id: '([^']+)'/g)].map((m) => m[1]);
const cases = [...screens.matchAll(/case '([^']+)'/g)].map((m) => m[1]);
const goTargets = [...screens.matchAll(/go\('([^']+)'\)/g)].map((m) => m[1]);

assert(ids.length === 36, 'Expected 36 prototype screens, found ' + ids.length);
assert(new Set(ids).size === 36, 'Prototype screen IDs must be unique');
assert(cases.length === 36, 'Expected 36 PrototypeScreen cases, found ' + cases.length);

const missingCases = ids.filter((id) => !cases.includes(id));
const extraCases = cases.filter((id) => !ids.includes(id));
assert(!missingCases.length, 'Missing screen implementations: ' + missingCases.join(', '));
assert(!extraCases.length, 'Unknown screen switch cases: ' + extraCases.join(', '));

const badTargets = [...new Set(goTargets.filter((id) => !ids.includes(id)))];
assert(!badTargets.length, 'Navigation targets unknown screen IDs: ' + badTargets.join(', '));

assert(previewRoute.includes('ui-screen-'), 'Preview route must expose stable per-screen test IDs');

const startTags = [...screens.matchAll(/<Pressable\b[\s\S]*?>/g)].map((m) => m[0]);
const deadPressables = startTags.filter((tag) => !/onPress=/.test(tag));
assert(deadPressables.length === 0, 'Found ' + deadPressables.length + ' Pressable controls without onPress');

const buttonTags = [...screens.matchAll(/<(PrimaryButton|SecondaryButton)\b[\s\S]*?\/>/g)].map((m) => m[0]);
const deadButtons = buttonTags.filter((tag) => !/onPress=/.test(tag));
assert(deadButtons.length === 0, 'Found ' + deadButtons.length + ' primary/secondary buttons without onPress');

const journeys = {
  organiser: ['home','create-basics','event-type','story-style','privacy-route','invite','event-hub','add-moment','finish-build','generation','story-ready','relive'],
  guest: ['guest-join','guest-contribution','guest-result'],
  route: ['event-hub','route-capture','relive','route-replay','route-moment'],
  editShare: ['relive','story-editor','theme-music','share-export','shared-web'],
  hosting: ['profile','storage-hosting','add-server','server-detail'],
};
for (const [name, journey] of Object.entries(journeys)) {
  const missing = journey.filter((id) => !ids.includes(id));
  assert(!missing.length, name + ' journey references missing screens: ' + missing.join(', '));
}

const requiredData = [
  'Snowdon Weekend',
  'Saturday in Barcelona',
  "Sophie's 40th Birthday Celebration at The Orangery",
  'Thorpe Park Day',
  'One Quiet Afternoon',
  'Five-a-side Final',
  'Walking the Thames',
];
for (const label of requiredData) {
  const present = data.includes(label) || screens.includes(label);
  assert(present, 'Required realistic test data missing: ' + label);
}

const requiredResilience = ['UPLOAD FAILED','SERVER OFFLINE','LINK EXPIRED','Your work is safe'];
for (const label of requiredResilience) {
  assert(screens.includes(label), 'Required resilience state missing: ' + label);
}

assert(checklist.includes('360 × 800'), 'Compact viewport test requirement missing');
assert(checklist.includes('Fold open'), 'Fold-open test requirement missing');
assert(motion.includes('Reduced motion'), 'Reduced-motion policy missing');
assert(lottiePolicy.includes('local JSON assets'), 'Lottie policy must require local JSON assets');

const lottieFiles = [
  'assets/lottie/story-building.json',
  'assets/lottie/server-discovery.json',
  'assets/lottie/completion.json',
];

const allowed = [
  [0.3568627450980392,0.17254901960784313,1,1],
  [0.09411764705882353,0.7803921568627451,0.8352941176470589,1],
  [1,1,1,1],
];

function walk(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit);
  } else if (value && typeof value === 'object') {
    visit(value);
    for (const item of Object.values(value)) walk(item, visit);
  }
}

for (const file of lottieFiles) {
  const raw = read(file);
  assert(!/https?:\/\//i.test(raw), file + ' must not reference external URLs');
  const json = JSON.parse(raw);
  assert(Array.isArray(json.layers) && json.layers.length > 0, file + ' has no layers');
  assert(!json.assets?.some((a) => a && (a.p || a.u)), file + ' contains external/raster asset references');

  const colors = [];
  walk(json, (obj) => {
    if ((obj.ty === 'fl' || obj.ty === 'st') && obj.c && Array.isArray(obj.c.k)) colors.push(obj.c.k);
  });
  for (const color of colors) {
    const ok = allowed.some((candidate) => candidate.length === color.length && candidate.every((v, i) => Math.abs(v - color[i]) < 1e-9));
    assert(ok, file + ' contains a non-Ambler utility colour: ' + JSON.stringify(color));
  }
}

const summary = {
  screens: ids.length,
  navigationTargets: new Set(goTargets).size,
  journeys: Object.keys(journeys).length,
  pressables: startTags.length,
  buttons: buttonTags.length,
  lottieFiles: lottieFiles.length,
  result: 'PASS',
};

console.log('Ambler UI static simulation audit passed');
console.log(JSON.stringify(summary, null, 2));
