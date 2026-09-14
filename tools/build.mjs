#!/usr/bin/env node
// Builds dist/: validates content, bundles it into content.js, copies the app shell, stamps the build id, writes icons.
// Usage: node tools/build.mjs [--strict]   (strict: any invalid content file fails the build)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateFile, validateManifest } from './validate.mjs';
import { writeIcons } from './icons.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src'), DIST = path.join(ROOT, 'dist'), CONTENT = path.join(ROOT, 'content');
const strict = process.argv.includes('--strict');
const log = (s) => console.log(s);
let problems = 0;

// ---- content ----
const manifest = JSON.parse(fs.readFileSync(path.join(CONTENT, 'manifest.json'), 'utf8'));
const mf = validateManifest();
mf.errs.forEach((e) => { log('  x ' + e); problems++; });
const modules = [];
for (const t of manifest.tracks) for (const id of t.modules) {
  const f = path.join(CONTENT, 'modules', id + '.json');
  if (!fs.existsSync(f)) { log(`  - ${id}: not written yet`); continue; }
  const { errs, warns } = validateFile(f);
  if (errs.length) { problems++; log(`  x ${id}: ${errs.length} error(s)${strict ? '' : ' — skipped'}`); errs.slice(0, 5).forEach((e) => log('      ' + e)); if (!strict) continue; }
  const m = JSON.parse(fs.readFileSync(f, 'utf8'));
  modules.push(m);
  log(`  ok ${id}: ${m.lessons.length} lessons, ${m.cards.length} cards, ${m.quiz.length} q, ${(m.scenarios || []).length} scen${warns.length ? ' (' + warns.length + ' warn)' : ''}`);
}
const reference = [];
const refDir = path.join(CONTENT, 'reference');
if (fs.existsSync(refDir)) for (const f of fs.readdirSync(refDir).filter((x) => x.endsWith('.json')).sort()) {
  const fp = path.join(refDir, f);
  const { errs } = validateFile(fp);
  if (errs.length) { problems++; log(`  x ref ${f}: ${errs.length} error(s)${strict ? '' : ' — skipped'}`); errs.slice(0, 3).forEach((e) => log('      ' + e)); if (!strict) continue; }
  reference.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
}
if (strict && problems) { log(`\nBuild failed: ${problems} content problem(s).`); process.exit(1); }

const bundleObj = { version: new Date().toISOString().slice(0, 10), tracks: manifest.tracks, modules, reference };
const bundleJSON = JSON.stringify(bundleObj);
const contentJS = 'window.ROUNDS_CONTENT=' + bundleJSON + ';\n';

// ---- build id from everything that ships ----
const hash = crypto.createHash('sha1');
hash.update(contentJS);
for (const f of fs.readdirSync(SRC).sort()) hash.update(fs.readFileSync(path.join(SRC, f)));
const BUILD = hash.digest('hex').slice(0, 10);
bundleObj.version += '.' + BUILD.slice(0, 4);
const finalContentJS = 'window.ROUNDS_CONTENT=' + JSON.stringify(bundleObj) + ';\n';

// ---- dist ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const shipped = [];
for (const f of fs.readdirSync(SRC)) {
  let data = fs.readFileSync(path.join(SRC, f));
  if (/\.(html|js|css|webmanifest)$/.test(f)) data = Buffer.from(data.toString('utf8').replace(/__BUILD__/g, BUILD));
  fs.writeFileSync(path.join(DIST, f), data);
  shipped.push('./' + f);
}
fs.writeFileSync(path.join(DIST, 'content.js'), finalContentJS);
shipped.push('./content.js');
writeIcons(path.join(DIST, 'icons'));
for (const f of fs.readdirSync(path.join(DIST, 'icons'))) shipped.push('./icons/' + f);
const precache = ['./', ...shipped.filter((s) => s !== './sw.js')];
const sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8').replace('__PRECACHE__', JSON.stringify(precache));
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

const lessons = modules.reduce((a, m) => a + m.lessons.length, 0), cards = modules.reduce((a, m) => a + m.cards.length, 0), qs = modules.reduce((a, m) => a + m.quiz.length, 0), sc = modules.reduce((a, m) => a + (m.scenarios || []).length, 0);
log(`\nbuild ${BUILD} · ${modules.length} modules · ${lessons} lessons · ${cards} cards · ${qs} questions · ${sc} scenarios · ${reference.length} sheets · content.js ${(finalContentJS.length / 1024).toFixed(0)} KB${problems ? ` · ${problems} file(s) skipped` : ''}`);
