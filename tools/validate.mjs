#!/usr/bin/env node
// Validates Rounds content files against content/SCHEMA.md.
// Usage: node tools/validate.mjs <file.json> [more.json ...]   (exit 1 on any error)
//        node tools/validate.mjs --all                          (every module + reference + manifest)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TRACKS = new Set(['foundations', 'emt', 'edtech', 'prepa']);
const GROUPS = new Set(['assessment', 'airway', 'cardiac', 'trauma', 'meds', 'labs', 'ecg', 'ed', 'terms', 'exam']);
const SETTINGS = new Set(['field', 'ed', 'classroom']);

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

  const lessons = Array.isArray(m.lessons) ? m.lessons : [];
  if (lessons.length < 6 || lessons.length > 10) errs.push(`lessons: need 6–10, have ${lessons.length}`);
  const lessonIds = new Set();
  lessons.forEach((l, i) => {
    const w = `lesson[${i}] ${l?.id || ''}`;
    if (!isStr(l?.id) || !l.id.startsWith(m.id + '-l')) errs.push(`${w}: id must start with '${m.id}-l'`);
    if (lessonIds.has(l?.id)) errs.push(`${w}: duplicate id`);
    lessonIds.add(l?.id);
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
  });

  const cards = Array.isArray(m.cards) ? m.cards : [];
  if (cards.length < 40 || cards.length > 80) errs.push(`cards: need 40–80, have ${cards.length}`);
  const cardIds = new Set();
  cards.forEach((c, i) => {
    const w = `card[${i}] ${c?.id || ''}`;
    if (!isStr(c?.id) || !c.id.startsWith(m.id + '-c')) errs.push(`${w}: id must start with '${m.id}-c'`);
    if (cardIds.has(c?.id)) errs.push(`${w}: duplicate id`);
    cardIds.add(c?.id);
    if (!isStr(c?.front, 8)) errs.push(`${w}: front missing/too short`);
    if (!isStr(c?.back)) errs.push(`${w}: back missing`);
    if (words(c?.back) > 60) warns.push(`${w}: back is ${words(c.back)} words (aim <= 45)`);
    if (!lessonIds.has(c?.lesson)) errs.push(`${w}: lesson '${c?.lesson}' not in module`);
  });

  const quiz = Array.isArray(m.quiz) ? m.quiz : [];
  if (quiz.length < 20 || quiz.length > 40) errs.push(`quiz: need 20–40, have ${quiz.length}`);
  const qIds = new Set();
  quiz.forEach((q, i) => {
    const w = `quiz[${i}] ${q?.id || ''}`;
    if (!isStr(q?.id) || !q.id.startsWith(m.id + '-q')) errs.push(`${w}: id must start with '${m.id}-q'`);
    if (qIds.has(q?.id)) errs.push(`${w}: duplicate id`);
    qIds.add(q?.id);
    if (!isStr(q?.q, 15)) errs.push(`${w}: q missing/too short`);
    if (!Array.isArray(q?.choices) || q.choices.length !== 4 || !q.choices.every((x) => isStr(x))) errs.push(`${w}: need exactly 4 string choices`);
    else if (!isIdx(q?.answer, 4)) errs.push(`${w}: answer must be 0–3`);
    if (!isStr(q?.why, 20)) errs.push(`${w}: why missing/too short`);
    if (!lessonIds.has(q?.lesson)) errs.push(`${w}: lesson '${q?.lesson}' not in module`);
    if (![1, 2, 3].includes(q?.difficulty)) errs.push(`${w}: difficulty must be 1|2|3`);
  });
  if (quiz.length) {
    const dist = [0, 0, 0, 0];
    quiz.forEach((q) => { if (isIdx(q?.answer, 4)) dist[q.answer]++; });
    const max = Math.max(...dist);
    if (max > quiz.length * 0.5) warns.push(`quiz: answer index distribution skewed ${JSON.stringify(dist)} — shuffle correct positions`);
  }

  const scen = Array.isArray(m.scenarios) ? m.scenarios : [];
  if (scen.length > 3) errs.push(`scenarios: max 3, have ${scen.length}`);
  scen.forEach((s, i) => {
    const w = `scenario[${i}] ${s?.id || ''}`;
    if (!isStr(s?.id) || !s.id.startsWith(m.id + '-s')) errs.push(`${w}: id must start with '${m.id}-s'`);
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
  });
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
  const isRef = file.replace(/\\/g, '/').includes('/reference/');
  return isRef ? validateReference(data, file) : validateModule(data, file);
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
    const id = f.replace(/\.json$/, '');
    if (f.endsWith('.json') && !seen.has(id)) errs.push(`manifest: module file '${id}' is not listed`);
  }
  return { errs, warns };
}

export { validateFile, validateManifest, validateModule, validateReference };

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const args = isCli ? process.argv.slice(2) : [];
let files = args.filter((a) => !a.startsWith('--'));
if (!isCli) files = [];
if (args.includes('--all')) {
  for (const sub of ['modules', 'reference']) {
    const dir = path.join(ROOT, 'content', sub);
    if (fs.existsSync(dir)) files.push(...fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f)));
  }
}
if (isCli && !files.length && !args.includes('--all')) { console.error('usage: node tools/validate.mjs <file.json>... | --all'); process.exit(2); }

let failed = 0;
if (isCli) {
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
