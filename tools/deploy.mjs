#!/usr/bin/env node
// Builds dist/ and ships it to the host that serves Rounds on the tailnet.
// The host runs tools/serve.mjs as a user service; dist/ is swapped atomically.
// Usage: node tools/deploy.mjs [--strict] [--host nova]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const host = args.includes('--host') ? args[args.indexOf('--host') + 1] : (process.env.ROUNDS_HOST || 'nova');
const remoteDir = process.env.ROUNDS_REMOTE_DIR || 'rounds';
const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });

sh(`node "${path.join(ROOT, 'tools', 'build.mjs')}"${strict ? ' --strict' : ''}`);
const build = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').match(/data-build="([a-f0-9]+)"/)?.[1] || 'unknown';

// Ship dist/ and the server script as one tarball; swap the live dist/ in a single mv.
const remote = [
  `set -e`,
  `mkdir -p ~/${remoteDir}/tools`,
  `rm -rf ~/${remoteDir}/dist.new && mkdir -p ~/${remoteDir}/dist.new`,
  `tar xzf - -C ~/${remoteDir}/dist.new`,
  `mv ~/${remoteDir}/dist.new/serve.mjs ~/${remoteDir}/tools/serve.mjs`,
  `rm -rf ~/${remoteDir}/dist.old`,
  `[ -d ~/${remoteDir}/dist ] && mv ~/${remoteDir}/dist ~/${remoteDir}/dist.old || true`,
  `mv ~/${remoteDir}/dist.new ~/${remoteDir}/dist`,
  `rm -rf ~/${remoteDir}/dist.old`,
  `ls ~/${remoteDir}/dist/content.js >/dev/null`,
].join(' && ');
fs.copyFileSync(path.join(ROOT, 'tools', 'serve.mjs'), path.join(DIST, 'serve.mjs'));
try {
  sh(`tar czf - -C "${DIST}" . | ssh -o BatchMode=yes ${host} '${remote}'`, { shell: process.platform === 'win32' ? 'bash.exe' : '/bin/sh' });
} finally {
  fs.rmSync(path.join(DIST, 'serve.mjs'), { force: true });
}
console.log(`deployed build ${build} to ${host}`);
