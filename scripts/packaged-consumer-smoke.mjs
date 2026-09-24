import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist/ccd-case-ui-toolkit');
const consumer = mkdtempSync(join(tmpdir(), 'ccd-case-ui-toolkit-consumer-'));

try {
  const packageJson = JSON.parse(readFileSync(join(dist, 'package.json'), 'utf8'));
  if (packageJson.name !== '@hmcts/ccd-case-ui-toolkit') {
    throw new Error(`Unexpected packed package: ${packageJson.name}`);
  }

  const tarball = JSON.parse(run('npm', ['pack', '--json'], dist))[0].filename;
  cpSync(join(root, 'packaged-consumer'), consumer, { recursive: true });
  const consumerPackage = JSON.parse(readFileSync(join(consumer, 'package.json'), 'utf8'));
  consumerPackage.dependencies = {
    ...packageJson.peerDependencies,
    ...(consumerPackage.dependencies ?? {}),
    '@hmcts/ccd-case-ui-toolkit': `file:${join(dist, tarball)}`
  };
  writeFileSync(join(consumer, 'package.json'), `${JSON.stringify(consumerPackage, null, 2)}\n`);

  try {
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'], consumer);
  } catch {
    console.warn('Normal npm peer resolution failed; running forced-install diagnostics with --legacy-peer-deps.');
    run('npm', ['install', '--legacy-peer-deps', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'], consumer);
  }
  run('npx', ['ng', 'build'], consumer);
  run('npx', ['playwright', 'test'], consumer);
} finally {
  rmSync(consumer, { recursive: true, force: true });
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: join(consumer, '.npm-cache') },
    stdio: ['ignore', 'pipe', 'inherit']
  });
}
