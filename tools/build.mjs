#!/usr/bin/env node
// Builds dist/: validates content, bundles it into content.js, copies the app shell, stamps the build id, writes icons.
// Usage: node tools/build.mjs [--strict]   (strict: any invalid content file fails the build)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateFile, validateManifest, validateExam } from './validate.mjs';
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
  m.scenarios = m.scenarios || [];
  let extNote = '';
  const xf = path.join(CONTENT, 'modules', id + '.ext.json');
  if (fs.existsSync(xf)) {
    const xv = validateFile(xf);
    if (xv.errs.length) { problems++; log(`  x ${id}.ext: ${xv.errs.length} error(s)${strict ? '' : ' — extension skipped'}`); xv.errs.slice(0, 4).forEach((e) => log('      ' + e)); if (strict) continue; }
    else {
      const x = JSON.parse(fs.readFileSync(xf, 'utf8'));
      m.lessons.push(...(x.lessons || [])); m.cards.push(...(x.cards || [])); m.quiz.push(...(x.quiz || [])); m.scenarios.push(...(x.scenarios || []));
      extNote = ` +ext(${(x.lessons || []).length}l/${(x.cards || []).length}c/${(x.quiz || []).length}q/${(x.scenarios || []).length}s)`;
    }
  }
  const qf = path.join(CONTENT, 'modules', id + '.quiz.json');
  if (fs.existsSync(qf)) {
    const qv = validateFile(qf);
    if (qv.errs.length) { problems++; log(`  x ${id}.quiz: ${qv.errs.length} error(s)${strict ? '' : ' — bank skipped'}`); qv.errs.slice(0, 4).forEach((e) => log('      ' + e)); if (strict) continue; }
    else {
      const b = JSON.parse(fs.readFileSync(qf, 'utf8'));
      let nc = 0; for (const l of m.lessons) if (b.checks && b.checks[l.id]) { l.checks.push(...b.checks[l.id]); nc += b.checks[l.id].length; }
      m.quiz.push(...(b.quiz || []));
      extNote += ` +bank(${nc}chk/${(b.quiz || []).length}q)`;
    }
  }
  const vf = path.join(CONTENT, 'modules', id + '.videos.json');
  if (fs.existsSync(vf)) {
    const vv = validateFile(vf);
    if (vv.errs.length) { problems++; log(`  x ${id}.videos: ${vv.errs.length} error(s)${strict ? '' : ' — videos skipped'}`); vv.errs.slice(0, 4).forEach((e) => log('      ' + e)); if (strict) continue; }
    else {
      const vd = JSON.parse(fs.readFileSync(vf, 'utf8')); let nv = 0;
      for (const l of m.lessons) if (vd.videos && vd.videos[l.id]) { l.videos = vd.videos[l.id].map((v) => ({ id: v.id, title: v.title, channel: v.channel, start: v.start || 0 })); nv += l.videos.length; }
      extNote += ` +videos(${nv})`;
    }
  }
  modules.push(m);
  log(`  ok ${id}: ${m.lessons.length} lessons, ${m.cards.length} cards, ${m.quiz.length} q, ${m.scenarios.length} scen${extNote}${warns.length ? ' (' + warns.length + ' warn)' : ''}`);
}
const reference = [];
const refDir = path.join(CONTENT, 'reference');
if (fs.existsSync(refDir)) for (const f of fs.readdirSync(refDir).filter((x) => x.endsWith('.json')).sort()) {
  const fp = path.join(refDir, f);
  const { errs } = validateFile(fp);
  if (errs.length) { problems++; log(`  x ref ${f}: ${errs.length} error(s)${strict ? '' : ' — skipped'}`); errs.slice(0, 3).forEach((e) => log('      ' + e)); if (!strict) continue; }
  reference.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
}
const exams = [];
const examDir = path.join(CONTENT, 'exams');
if (fs.existsSync(examDir)) for (const f of fs.readdirSync(examDir).filter((x) => x.endsWith('.json')).sort()) {
  const fp = path.join(examDir, f);
  let x; try { x = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { problems++; log(`  x exam ${f}: invalid JSON`); if (strict) continue; else continue; }
  const partsDir = path.join(examDir, 'parts');
  if (fs.existsSync(partsDir)) for (const pf of fs.readdirSync(partsDir).filter((n) => n.startsWith(x.id + '.part') && n.endsWith('.json')).sort()) {
    try { const part = JSON.parse(fs.readFileSync(path.join(partsDir, pf), 'utf8')); x.questions = [...(x.questions || []), ...(part.questions || [])]; } catch (e) { log(`  ! exam part ${pf} is not valid JSON yet — skipped`); }
  }
  const { errs } = validateExam(x, fp);
  if (errs.length) { problems++; log(`  x exam ${f}: ${errs.length} error(s)${strict ? '' : ' — skipped'}`); errs.slice(0, 3).forEach((e) => log('      ' + e)); if (!strict) continue; }
  if (!x.questions.length) { log(`  - exam ${x.id}: no questions yet`); continue; }
  exams.push(x);
  log(`  ok exam ${x.id}: ${x.questions.length} questions in ${x.sections.length} sections`);
}
if (strict && problems) { log(`\nBuild failed: ${problems} content problem(s).`); process.exit(1); }

// ---- content: a light index for navigation + one file per module, loaded on demand ----
const indexModules = modules.map((m) => ({
  id: m.id, track: m.track, title: m.title, short: m.short, summary: m.summary,
  lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.minutes, checks: l.checks.length, cards: m.cards.filter((c) => c.lesson === l.id).length })),
  scenarios: m.scenarios.map((s) => ({ id: s.id, title: s.title, setting: s.setting, steps: s.steps.length })),
  counts: { cards: m.cards.length, quiz: m.quiz.length, scenarios: m.scenarios.length, minutes: m.lessons.reduce((a, l) => a + l.minutes, 0) },
}));
const moduleFiles = new Map(modules.map((m) => [m.id, 'window.ROUNDS_MODULES=window.ROUNDS_MODULES||{};window.ROUNDS_MODULES[' + JSON.stringify(m.id) + ']=' + JSON.stringify(m) + ';\n']));
const indexExams = exams.map((x) => ({ id: x.id, title: x.title, blurb: x.blurb, minutes: x.minutes, count: x.count, sections: x.sections, pool: x.questions.length }));
for (const x of exams) moduleFiles.set('exam-' + x.id, 'window.ROUNDS_MODULES=window.ROUNDS_MODULES||{};window.ROUNDS_MODULES[' + JSON.stringify('exam-' + x.id) + ']=' + JSON.stringify(x) + ';\n');

// ---- build id from everything that ships ----
const hash = crypto.createHash('sha1');
for (const [, js] of moduleFiles) hash.update(js);
hash.update(JSON.stringify(reference));
for (const f of fs.readdirSync(SRC).sort()) hash.update(fs.readFileSync(path.join(SRC, f)));
const BUILD = hash.digest('hex').slice(0, 10);
const indexObj = { version: new Date().toISOString().slice(0, 10) + '.' + BUILD.slice(0, 4), build: BUILD, tracks: manifest.tracks, modules: indexModules, reference, exams: indexExams };
const indexJS = 'window.ROUNDS_INDEX=' + JSON.stringify(indexObj) + ';\n';

// ---- dist ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'content'), { recursive: true });
const shipped = [];
for (const f of fs.readdirSync(SRC)) {
  let data = fs.readFileSync(path.join(SRC, f));
  if (/\.(html|js|css|webmanifest)$/.test(f)) data = Buffer.from(data.toString('utf8').replace(/__BUILD__/g, BUILD));
  fs.writeFileSync(path.join(DIST, f), data);
  shipped.push('./' + f);
}
fs.writeFileSync(path.join(DIST, 'content', 'index.js'), indexJS);
shipped.push('./content/index.js');
let contentBytes = indexJS.length;
for (const [id, js] of moduleFiles) { fs.writeFileSync(path.join(DIST, 'content', id + '.js'), js); shipped.push('./content/' + id + '.js'); contentBytes += js.length; }
const finalContentJS = { length: contentBytes };
writeIcons(path.join(DIST, 'icons'));
for (const f of fs.readdirSync(path.join(DIST, 'icons'))) shipped.push('./icons/' + f);
const precache = ['./', ...shipped.filter((s) => s !== './sw.js')];
const sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8').replace('__PRECACHE__', JSON.stringify(precache));
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);

const lessons = modules.reduce((a, m) => a + m.lessons.length, 0), cards = modules.reduce((a, m) => a + m.cards.length, 0), qs = modules.reduce((a, m) => a + m.quiz.length, 0), sc = modules.reduce((a, m) => a + (m.scenarios || []).length, 0);
log(`\nbuild ${BUILD} · ${modules.length} modules · ${lessons} lessons · ${cards} cards · ${qs} questions · ${sc} scenarios · ${reference.length} sheets · content.js ${(finalContentJS.length / 1024).toFixed(0)} KB${problems ? ` · ${problems} file(s) skipped` : ''}`);
