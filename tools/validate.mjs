#!/usr/bin/env node
// Validates Rounds content files against content/SCHEMA.md.
// Usage: node tools/validate.mjs <file.json> [more.json ...]   (exit 1 on any error)
//        node tools/validate.mjs --all                          (every module, extension, reference + manifest)
// A module may have an extension file <id>.ext.json that adds lessons/cards/quiz/scenarios; it is validated
// against the merged module (ids unique across both, cards may reference base lessons).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRACKS = new Set(['foundations', 'emt', 'edtech', 'prepa', 'prereq']);
const GROUPS = new Set(['assessment', 'airway', 'cardiac', 'trauma', 'meds', 'labs', 'ecg', 'ed', 'terms', 'exam', 'spanish', 'math']);
const SETTINGS = new Set(['field', 'ed', 'classroom']);
const LIMITS = {
  base: { lessons: [6, 10], cards: [40, 80], quiz: [20, 40], scenarios: [0, 3] },
  ext: { lessons: [3, 10], cards: [20, 80], quiz: [15, 50], scenarios: [0, 3] },
  merged: { lessons: [6, 20], cards: [40, 170], quiz: [20, 90], scenarios: [0, 6] },
};

const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const isStr = (v, min = 1) => typeof v === 'string' && v.trim().length >= min;
const isIdx = (v, n) => Number.isInteger(v) && v >= 0 && v < n;

function checkMarkdown(md, where, errs, warns) {
  if (/<[a-z][^>]*>/i.test(md)) errs.push(`${where}: HTML tag found`);
  if (/^#\s/m.test(md)) errs.push(`${where}: top-level '# ' heading (use ## or ###)`);
  if (/!\[/.test(md) || /\]\(http/.test(md)) errs.push(`${where}: images/links not allowed`);
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(md)) errs.push(`${where}: emoji found`);
  const badCallout = md.match(/^>\s*\*\*(?!Key:|Trap:|On the exam:|On shift:)[^*]*\*\*/m);
  if (badCallout) warns.push(`${where}: callout label '${badCallout[0].slice(0, 40)}' is not one of Key/Trap/On the exam/On shift`);
}
function checkCount(name, arr, [lo, hi], errs) { if (arr.length < lo || arr.length > hi) errs.push(`${name}: need ${lo}–${hi}, have ${arr.length}`); }

function checkLesson(l, i, modId, seen, errs, warns) {
  const w = `lesson[${i}] ${l?.id || ''}`;
  if (!isStr(l?.id) || !l.id.startsWith(modId + '-l')) errs.push(`${w}: id must start with '${modId}-l'`);
  if (seen.has(l?.id)) errs.push(`${w}: duplicate id`);
  seen.add(l?.id);
  if (!isStr(l?.title)) errs.push(`${w}: title missing`);
  if (!Number.isInteger(l?.minutes) || l.minutes < 3 || l.minutes > 12) errs.push(`${w}: minutes must be 3–12`);
  const n = words(l?.body);
  if (n < 300) errs.push(`${w}: body too short (${n} words, need 300+)`);
  if (n > 800) warns.push(`${w}: body long (${n} words, aim <= 700)`);
  if (isStr(l?.body)) checkMarkdown(l.body, w, errs, warns);
  if (!Array.isArray(l?.keyPoints) || l.keyPoints.length < 3 || l.keyPoints.length > 5) errs.push(`${w}: keyPoints need 3–5`);
  const checks = Array.isArray(l?.checks) ? l.checks : [];
  if (checks.length < 2 || checks.length > 3) errs.push(`${w}: checks need 2–3`);
  checks.forEach((c, j) => {
    const cw = `${w} check[${j}]`;
    if (!isStr(c?.q)) errs.push(`${cw}: q missing`);
    if (!Array.isArray(c?.choices) || c.choices.length !== 4 || !c.choices.every((x) => isStr(x))) errs.push(`${cw}: need exactly 4 string choices`);
    else if (!isIdx(c?.answer, 4)) errs.push(`${cw}: answer must be 0–3`);
    if (!isStr(c?.why, 10)) errs.push(`${cw}: why missing/too short`);
  });
}
function checkCard(c, i, modId, lessonIds, seen, errs, warns) {
  const w = `card[${i}] ${c?.id || ''}`;
  if (!isStr(c?.id) || !c.id.startsWith(modId + '-c')) errs.push(`${w}: id must start with '${modId}-c'`);
  if (seen.has(c?.id)) errs.push(`${w}: duplicate id`);
  seen.add(c?.id);
  if (!isStr(c?.front, 8)) errs.push(`${w}: front missing/too short`);
  if (!isStr(c?.back)) errs.push(`${w}: back missing`);
  if (words(c?.back) > 60) warns.push(`${w}: back is ${words(c.back)} words (aim <= 45)`);
  if (!lessonIds.has(c?.lesson)) errs.push(`${w}: lesson '${c?.lesson}' not in module`);
}
function checkQuestion(q, i, modId, lessonIds, seen, errs) {
  const w = `quiz[${i}] ${q?.id || ''}`;
  if (!isStr(q?.id) || !q.id.startsWith(modId + '-q')) errs.push(`${w}: id must start with '${modId}-q'`);
  if (seen.has(q?.id)) errs.push(`${w}: duplicate id`);
  seen.add(q?.id);
  if (!isStr(q?.q, 15)) errs.push(`${w}: q missing/too short`);
  if (!Array.isArray(q?.choices) || q.choices.length !== 4 || !q.choices.every((x) => isStr(x))) errs.push(`${w}: need exactly 4 string choices`);
  else if (!isIdx(q?.answer, 4)) errs.push(`${w}: answer must be 0–3`);
  if (!isStr(q?.why, 20)) errs.push(`${w}: why missing/too short`);
  if (!lessonIds.has(q?.lesson)) errs.push(`${w}: lesson '${q?.lesson}' not in module`);
  if (![1, 2, 3].includes(q?.difficulty)) errs.push(`${w}: difficulty must be 1|2|3`);
}
function checkAnswerSpread(quiz, warns) {
  if (!quiz.length) return;
  const dist = [0, 0, 0, 0];
  quiz.forEach((q) => { if (isIdx(q?.answer, 4)) dist[q.answer]++; });
  if (Math.max(...dist) > quiz.length * 0.5) warns.push(`quiz: answer index distribution skewed ${JSON.stringify(dist)} — shuffle correct positions`);
}
function checkScenario(s, i, modId, seen, errs) {
  const w = `scenario[${i}] ${s?.id || ''}`;
  if (!isStr(s?.id) || !s.id.startsWith(modId + '-s')) errs.push(`${w}: id must start with '${modId}-s'`);
  if (seen.has(s?.id)) errs.push(`${w}: duplicate id`);
  seen.add(s?.id);
  if (!isStr(s?.title)) errs.push(`${w}: title missing`);
  if (!SETTINGS.has(s?.setting)) errs.push(`${w}: setting must be field|ed|classroom`);
  if (!isStr(s?.intro, 30)) errs.push(`${w}: intro missing/too short`);
  if (!isStr(s?.debrief, 40)) errs.push(`${w}: debrief missing/too short`);
  const steps = Array.isArray(s?.steps) ? s.steps : [];
  if (steps.length < 4 || steps.length > 7) errs.push(`${w}: steps need 4–7, have ${steps.length}`);
  const stepIds = new Set(steps.map((st) => st?.id));
  steps.forEach((st, j) => {
    const sw = `${w} step[${j}] ${st?.id || ''}`;
    if (!isStr(st?.id)) errs.push(`${sw}: id missing`);
    if (!isStr(st?.prompt, 20)) errs.push(`${sw}: prompt missing/too short`);
    if (st?.vitals && typeof st.vitals !== 'object') errs.push(`${sw}: vitals must be an object`);
    const ch = Array.isArray(st?.choices) ? st.choices : [];
    if (ch.length < 3 || ch.length > 4) errs.push(`${sw}: choices need 3–4`);
    if (!ch.some((c) => c?.score === 1)) errs.push(`${sw}: at least one choice must score 1`);
    ch.forEach((c, k) => {
      const cw = `${sw} choice[${k}]`;
      if (!isStr(c?.text)) errs.push(`${cw}: text missing`);
      if (!isStr(c?.feedback, 10)) errs.push(`${cw}: feedback missing/too short`);
      if (![1, 0, -1].includes(c?.score)) errs.push(`${cw}: score must be 1|0|-1`);
      if (c?.next !== 'end' && !stepIds.has(c?.next)) errs.push(`${cw}: next '${c?.next}' is not a step id or 'end'`);
    });
    if (j === steps.length - 1 && !ch.every((c) => c?.next === 'end')) errs.push(`${sw}: last step choices must all go to 'end'`);
  });
}

function validateModule(m, file) {
  const errs = [], warns = [];
  const base = path.basename(file, '.json');
  if (m.schema !== 1) errs.push('schema must be 1');
  if (!isStr(m.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id)) errs.push('id must be kebab-case');
  if (m.id !== base) errs.push(`id '${m.id}' must match filename '${base}'`);
  if (!TRACKS.has(m.track)) errs.push(`track must be one of ${[...TRACKS].join('|')}`);
  if (!isStr(m.title)) errs.push('title missing');
  if (!isStr(m.short) || m.short.length > 16) errs.push('short missing or > 16 chars');
  if (!isStr(m.summary, 20)) errs.push('summary missing/too short');
  const lessons = Array.isArray(m.lessons) ? m.lessons : [], cards = Array.isArray(m.cards) ? m.cards : [], quiz = Array.isArray(m.quiz) ? m.quiz : [], scen = Array.isArray(m.scenarios) ? m.scenarios : [];
  checkCount('lessons', lessons, LIMITS.base.lessons, errs); checkCount('cards', cards, LIMITS.base.cards, errs); checkCount('quiz', quiz, LIMITS.base.quiz, errs); checkCount('scenarios', scen, LIMITS.base.scenarios, errs);
  const lessonIds = new Set(), cardIds = new Set(), qIds = new Set(), sIds = new Set();
  lessons.forEach((l, i) => checkLesson(l, i, m.id, lessonIds, errs, warns));
  cards.forEach((c, i) => checkCard(c, i, m.id, lessonIds, cardIds, errs, warns));
  quiz.forEach((q, i) => checkQuestion(q, i, m.id, lessonIds, qIds, errs));
  checkAnswerSpread(quiz, warns);
  scen.forEach((s, i) => checkScenario(s, i, m.id, sIds, errs));
  return { errs, warns };
}

function validateExtension(x, file) {
  const errs = [], warns = [];
  const modId = path.basename(file, '.ext.json');
  if (x.schema !== 1) errs.push('schema must be 1');
  if (x.extends !== modId) errs.push(`extends '${x.extends}' must match filename '${modId}.ext.json'`);
  const baseFile = path.join(path.dirname(file), modId + '.json');
  let base = null;
  try { base = JSON.parse(fs.readFileSync(baseFile, 'utf8')); } catch (e) { errs.push(`base module ${modId}.json is missing or invalid JSON`); return { errs, warns }; }
  const lessons = Array.isArray(x.lessons) ? x.lessons : [], cards = Array.isArray(x.cards) ? x.cards : [], quiz = Array.isArray(x.quiz) ? x.quiz : [], scen = Array.isArray(x.scenarios) ? x.scenarios : [];
  checkCount('ext lessons', lessons, LIMITS.ext.lessons, errs); checkCount('ext cards', cards, LIMITS.ext.cards, errs); checkCount('ext quiz', quiz, LIMITS.ext.quiz, errs); checkCount('ext scenarios', scen, LIMITS.ext.scenarios, errs);
  const bl = base.lessons || [], bc = base.cards || [], bq = base.quiz || [], bs = base.scenarios || [];
  checkCount('merged lessons', [...bl, ...lessons], LIMITS.merged.lessons, errs); checkCount('merged cards', [...bc, ...cards], LIMITS.merged.cards, errs); checkCount('merged quiz', [...bq, ...quiz], LIMITS.merged.quiz, errs); checkCount('merged scenarios', [...bs, ...scen], LIMITS.merged.scenarios, errs);
  const lessonIds = new Set(bl.map((l) => l.id)), cardIds = new Set(bc.map((c) => c.id)), qIds = new Set(bq.map((q) => q.id)), sIds = new Set(bs.map((s) => s.id));
  const baseTitles = new Set(bl.map((l) => String(l.title || '').toLowerCase().trim()));
  lessons.forEach((l, i) => { checkLesson(l, i, modId, lessonIds, errs, warns); if (baseTitles.has(String(l?.title || '').toLowerCase().trim())) errs.push(`lesson[${i}]: title duplicates a base lesson`); });
  cards.forEach((c, i) => checkCard(c, i, modId, lessonIds, cardIds, errs, warns));
  quiz.forEach((q, i) => checkQuestion(q, i, modId, lessonIds, qIds, errs));
  checkAnswerSpread(quiz, warns);
  scen.forEach((s, i) => checkScenario(s, i, modId, sIds, errs));
  return { errs, warns };
}

function validateBank(x, file) {
  const errs = [], warns = [];
  const modId = path.basename(file, '.quiz.json');
  if (x.schema !== 1) errs.push('schema must be 1');
  if (x.extends !== modId) errs.push(`extends '${x.extends}' must match filename '${modId}.quiz.json'`);
  const dir = path.dirname(file);
  let base = null, ext = null;
  try { base = JSON.parse(fs.readFileSync(path.join(dir, modId + '.json'), 'utf8')); } catch (e) { errs.push(`base module ${modId}.json is missing or invalid JSON`); return { errs, warns }; }
  try { if (fs.existsSync(path.join(dir, modId + '.ext.json'))) ext = JSON.parse(fs.readFileSync(path.join(dir, modId + '.ext.json'), 'utf8')); } catch (e) { warns.push('extension file is invalid JSON; validated against base only'); }
  const lessons = [...(base.lessons || []), ...((ext && ext.lessons) || [])];
  const lessonIds = new Set(lessons.map((l) => l.id));
  const qIds = new Set([...(base.quiz || []), ...((ext && ext.quiz) || [])].map((q) => q.id));
  const checks = x.checks && typeof x.checks === 'object' ? x.checks : {};
  const covered = Object.keys(checks).filter((k) => lessonIds.has(k));
  Object.keys(checks).forEach((k) => { if (!lessonIds.has(k)) errs.push(`checks: lesson '${k}' not in module`); });
  if (covered.length < lessons.length) warns.push(`checks: ${lessons.length - covered.length} lesson(s) have no extra checks`);
  for (const [lid, arr] of Object.entries(checks)) {
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 4) { errs.push(`checks[${lid}]: need 1–4 checks`); continue; }
    arr.forEach((c, j) => {
      const cw = `checks[${lid}][${j}]`;
      if (!isStr(c?.q)) errs.push(`${cw}: q missing`);
      if (!Array.isArray(c?.choices) || c.choices.length !== 4 || !c.choices.every((v) => isStr(v))) errs.push(`${cw}: need exactly 4 string choices`);
      else if (!isIdx(c?.answer, 4)) errs.push(`${cw}: answer must be 0–3`);
      if (!isStr(c?.why, 10)) errs.push(`${cw}: why missing/too short`);
    });
  }
  const quiz = Array.isArray(x.quiz) ? x.quiz : [];
  if (quiz.length < 20 || quiz.length > 120) errs.push(`quiz: need 20–120, have ${quiz.length}`);
  quiz.forEach((q, i) => checkQuestion(q, i, modId, lessonIds, qIds, errs));
  checkAnswerSpread(quiz, warns);
  return { errs, warns };
}

function validateExam(x, file) {
  const errs = [], warns = [];
  const base = path.basename(file, '.json');
  if (x.schema !== 1) errs.push('schema must be 1');
  if (x.id !== base) errs.push(`id '${x.id}' must match filename '${base}'`);
  if (!isStr(x.title)) errs.push('title missing');
  if (!isStr(x.blurb, 30)) errs.push('blurb missing/too short');
  if (!Number.isInteger(x.minutes) || x.minutes < 10) errs.push('minutes must be an integer >= 10');
  if (!Number.isInteger(x.count) || x.count < 10) errs.push('count must be an integer >= 10');
  const secs = Array.isArray(x.sections) ? x.sections : [];
  if (!secs.length) errs.push('sections missing');
  const secIds = new Set(); let wsum = 0;
  secs.forEach((sc, i) => { if (!isStr(sc?.id)) errs.push(`section[${i}]: id missing`); if (secIds.has(sc?.id)) errs.push(`section[${i}]: duplicate id`); secIds.add(sc?.id); if (!isStr(sc?.title)) errs.push(`section[${i}]: title missing`); if (typeof sc?.weight !== 'number' || sc.weight <= 0) errs.push(`section[${i}]: weight must be > 0`); else wsum += sc.weight; });
  if (secs.length && Math.abs(wsum - 1) > 0.05) warns.push(`section weights sum to ${wsum.toFixed(2)}, expected ~1`);
  const qs = Array.isArray(x.questions) ? x.questions : [];
  const seen = new Set(); const perSec = {};
  qs.forEach((q, i) => {
    const w = `question[${i}] ${q?.id || ''}`;
    if (!isStr(q?.id) || !q.id.startsWith(x.id + '-q')) errs.push(`${w}: id must start with '${x.id}-q'`);
    if (seen.has(q?.id)) errs.push(`${w}: duplicate id`); seen.add(q?.id);
    if (!secIds.has(q?.section)) errs.push(`${w}: section '${q?.section}' not defined`); else perSec[q.section] = (perSec[q.section] || 0) + 1;
    if (!isStr(q?.q, 15)) errs.push(`${w}: q missing/too short`);
    if (!Array.isArray(q?.choices) || q.choices.length !== 4 || !q.choices.every((v) => isStr(v))) errs.push(`${w}: need exactly 4 string choices`);
    else if (!isIdx(q?.answer, 4)) errs.push(`${w}: answer must be 0–3`);
    if (!isStr(q?.why, 20)) errs.push(`${w}: why missing/too short`);
    if (![1, 2, 3].includes(q?.difficulty)) errs.push(`${w}: difficulty must be 1|2|3`);
  });
  secs.forEach((sc) => { const need = Math.ceil((x.count || 0) * (sc.weight || 0) * 1.5); if ((perSec[sc.id] || 0) < need) warns.push(`section '${sc.id}': ${perSec[sc.id] || 0} questions, want at least ${need} for a ${x.count}-item attempt`); });
  checkAnswerSpread(qs, warns);
  return { errs, warns };
}

function validateReference(r, file) {
  const errs = [], warns = [];
  const base = path.basename(file, '.json');
  if (r.schema !== 1) errs.push('schema must be 1');
  if (r.id !== base) errs.push(`id '${r.id}' must match filename '${base}'`);
  if (!isStr(r.title)) errs.push('title missing');
  if (!GROUPS.has(r.group)) errs.push(`group must be one of ${[...GROUPS].join('|')}`);
  if (!isStr(r.body, 80)) errs.push('body missing/too short');
  else checkMarkdown(r.body, 'body', errs, warns);
  if (!Array.isArray(r.tags) || !r.tags.every((t) => isStr(t))) errs.push('tags must be string[]');
  return { errs, warns };
}

function validateFile(file) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return { errs: [`invalid JSON: ${e.message}`], warns: [] }; }
  const norm = file.replace(/\\/g, '/');
  if (norm.includes('/reference/')) return validateReference(data, file);
  if (norm.includes('/exams/')) return validateExam(data, file);
  if (norm.endsWith('.ext.json')) return validateExtension(data, file);
  if (norm.endsWith('.quiz.json')) return validateBank(data, file);
  return validateModule(data, file);
}

function validateManifest() {
  const errs = [], warns = [];
  const mf = path.join(ROOT, 'content', 'manifest.json');
  let m;
  try { m = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (e) { return { errs: [`manifest: ${e.message}`], warns }; }
  const seen = new Set();
  for (const t of m.tracks || []) {
    if (!TRACKS.has(t.id)) errs.push(`manifest: unknown track '${t.id}'`);
    for (const id of t.modules || []) {
      if (seen.has(id)) errs.push(`manifest: module '${id}' listed twice`);
      seen.add(id);
      const f = path.join(ROOT, 'content', 'modules', id + '.json');
      if (!fs.existsSync(f)) warns.push(`manifest: module '${id}' has no file yet`);
      else {
        try {
          const d = JSON.parse(fs.readFileSync(f, 'utf8'));
          if (d.track !== t.id) errs.push(`manifest: module '${id}' is track '${d.track}' but listed under '${t.id}'`);
        } catch (e) { warns.push(`manifest: module '${id}' is not valid JSON yet (${e.message.slice(0, 60)})`); }
      }
    }
  }
  const dir = path.join(ROOT, 'content', 'modules');
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json') || f.endsWith('.ext.json') || f.endsWith('.quiz.json')) continue;
    const id = f.replace(/\.json$/, '');
    if (!seen.has(id)) errs.push(`manifest: module file '${id}' is not listed`);
  }
  return { errs, warns };
}

export { validateFile, validateManifest, validateModule, validateExtension, validateBank, validateExam, validateReference, LIMITS };

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const args = process.argv.slice(2);
  let files = args.filter((a) => !a.startsWith('--'));
  if (args.includes('--all')) {
    for (const sub of ['modules', 'reference', 'exams']) {
      const dir = path.join(ROOT, 'content', sub);
      if (fs.existsSync(dir)) files.push(...fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f)));
    }
  }
  if (!files.length && !args.includes('--all')) { console.error('usage: node tools/validate.mjs <file.json>... | --all'); process.exit(2); }
  let failed = 0;
  for (const f of files) {
    const { errs, warns } = validateFile(f);
    const name = path.relative(ROOT, f);
    if (errs.length) { failed++; console.log(`FAIL ${name}`); errs.forEach((e) => console.log(`  x ${e}`)); }
    else console.log(`ok   ${name}`);
    warns.forEach((w) => console.log(`  ! ${w}`));
  }
  if (args.includes('--all')) {
    const { errs, warns } = validateManifest();
    if (errs.length) { failed++; console.log('FAIL content/manifest.json'); errs.forEach((e) => console.log(`  x ${e}`)); }
    else console.log('ok   content/manifest.json');
    warns.forEach((w) => console.log(`  ! ${w}`));
  }
  process.exit(failed ? 1 : 0);
}
