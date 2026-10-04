const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.expo']);
function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}
const files = walk(root);
const source = files.filter(f => /\.(ts|tsx)$/.test(f) && !f.includes(`${path.sep}android${path.sep}`));
let errors = [];
for (const file of source) {
  const text = fs.readFileSync(file,'utf8');
  const result = ts.transpileModule(text, {
    fileName:file,
    reportDiagnostics:true,
    compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}
  });
  for (const d of result.diagnostics || []) {
    if (d.category === ts.DiagnosticCategory.Error) {
      const pos = d.file && typeof d.start === 'number' ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      errors.push(`${path.relative(root,file)}${pos?`:${pos.line+1}:${pos.character+1}`:''} ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
    }
  }
  const importRe = /(?:from\s+|import\s*\(|require\s*\()\s*['"](\.{1,2}\/[^'"]+)['"]/g;
  for (const m of text.matchAll(importRe)) {
    const spec=m[1]; const base=path.resolve(path.dirname(file), spec);
    const candidates=[base,`${base}.ts`,`${base}.tsx`,`${base}.native.tsx`,`${base}.web.tsx`,`${base}.js`,`${base}.jsx`,`${base}.json`,path.join(base,'index.ts'),path.join(base,'index.tsx'),path.join(base,'index.js')];
    if (!candidates.some(fs.existsSync)) errors.push(`${path.relative(root,file)} unresolved relative import ${spec}`);
  }
}
for (const file of files.filter(f => f.endsWith('.json'))) {
  try { JSON.parse(fs.readFileSync(file,'utf8')); } catch(e) { errors.push(`${path.relative(root,file)} invalid JSON: ${e.message}`); }
}
const app = JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
if (app.name !== 'Ambler' || app.slug !== 'ambler' || app.scheme !== 'ambler') errors.push('app.json identity is not fully Ambler');
if (app.android?.package !== 'com.russellstokes.ambler') errors.push('Android package identity mismatch');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const sdk52Pins = {
  expo: '52.0.49',
  'expo-av': '15.0.2',
  'expo-media-library': '17.0.6',
  'expo-router': '4.0.22',
  'expo-splash-screen': '0.29.24',
  'expo-status-bar': '2.0.1',
  'expo-system-ui': '4.0.9',
  'react-native': '0.76.9',
  'react-native-view-shot': '4.0.3',
};
for (const [name, version] of Object.entries(sdk52Pins)) {
  if (pkg.dependencies?.[name] !== version) errors.push(`${name} must be pinned to SDK-52-compatible ${version}`);
}
for (const [name, version] of Object.entries(pkg.dependencies || {})) {
  if (version === '*') errors.push(`${name} must not use an unbounded '*' dependency`);
}
if (fs.existsSync(path.join(root,'package-lock.json'))) {
  const lock = JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
  const lockedExpoMedia = lock.packages?.['node_modules/expo-media-library']?.version;
  if (lockedExpoMedia && lockedExpoMedia !== sdk52Pins['expo-media-library']) errors.push(`package-lock expo-media-library ${lockedExpoMedia} is incompatible with SDK 52 pin`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Source check passed: ${source.length} TS/TSX files, relative imports resolved, JSON valid.`);
