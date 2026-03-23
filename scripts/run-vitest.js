const { execFileSync } = require('child_process');
const path = require('path');

const mode = process.argv[2];
const isWin = process.platform === 'win32';

const vitestBin = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  isWin ? 'vitest.cmd' : 'vitest'
);

const args = mode === 'watch' ? [] : ['run'];

// Vercel/CI peut forcer NODE_ENV=production pendant `npm test`.
// React 19 casse `act` en production, donc on force UNIQUEMENT pour le process vitest.
const env = { ...process.env, NODE_ENV: 'test' };

if (isWin) {
  execFileSync('cmd.exe', ['/c', vitestBin, ...args], {
    stdio: 'inherit',
    env,
  });
} else {
  execFileSync(vitestBin, args, {
    stdio: 'inherit',
    env,
  });
}

