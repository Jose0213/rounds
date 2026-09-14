#!/usr/bin/env node
// Builds dist/ and force-pushes it to the gh-pages branch, which GitHub Pages serves.
// Auth: set GH_TOKEN (a token with repo scope) or have a credential helper that can push.
// Usage: GH_TOKEN=... node tools/deploy.mjs [--strict]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const REPO = process.env.ROUNDS_REPO || 'Jose0213/rounds';
const strict = process.argv.includes('--strict');
const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });

sh(`node "${path.join(ROOT, 'tools', 'build.mjs')}"${strict ? ' --strict' : ''}`, { stdio: 'inherit' });
const build = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').match(/data-build="([a-f0-9]+)"/)?.[1] || 'unknown';
const remote = process.env.GH_TOKEN ? `https://x-access-token:${process.env.GH_TOKEN}@github.com/${REPO}.git` : `https://github.com/${REPO}.git`;
const git = (args) => sh(`git ${args}`, { cwd: DIST, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });

fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });
git('init -q -b gh-pages');
git('config user.name "Jose Franco"');
git('config user.email "josefranco0213@gmail.com"');
git('add -A');
git(`-c commit.gpgsign=false commit -q -m "Deploy build ${build}"`);
try {
  git(`push -q --force "${remote}" gh-pages:gh-pages`);
} finally {
  fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });
}
console.log(`\ndeployed build ${build} → https://${REPO.split('/')[0].toLowerCase()}.github.io/${REPO.split('/')[1]}/  (Pages usually serves it within a minute)`);
