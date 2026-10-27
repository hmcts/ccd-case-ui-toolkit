import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist/ccd-case-ui-toolkit');

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  smoke();
}

function smoke() {
  const consumer = mkdtempSync(join(tmpdir(), 'ccd-case-ui-toolkit-consumer-'));
  const evidence = join(root, 'packaged-consumer-results');
  rmSync(evidence, { recursive: true, force: true });
  mkdirSync(evidence, { recursive: true });
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

    if (process.argv.includes('--strict-peer-deps')) {
      run('npm', ['install', '--strict-peer-deps', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'], consumer);
    } else {
      // Match WebApp's normal Yarn policy; strict npm peer acceptance remains a separate check.
      writeFileSync(join(consumer, '.yarnrc.yml'), 'nodeLinker: node-modules\nenableScripts: false\nenableImmutableInstalls: false\n');
      process.stdout.write(run(process.execPath, [join(root, '.yarn/releases/yarn-4.5.0.cjs'), 'install'], consumer));
    }
    process.stdout.write(run('npx', ['ng', 'build'], consumer));
    process.stdout.write(run('npx', ['playwright', 'test'], consumer));
  } finally {
    try {
      retainConsumerEvidence(consumer, evidence);
    } catch (error) {
      // Retention failure must fail a green run without replacing its original exception.
      process.stderr.write(`Could not retain packaged-consumer evidence: ${error.message}\n`);
      process.exitCode = 1;
    } finally {
      rmSync(consumer, { recursive: true, force: true });
    }
  }
}

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: join(tmpdir(), 'ccd-case-ui-toolkit-npm-cache') },
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (error) {
    process.stdout.write(error.stdout ?? '');
    process.stderr.write(error.stderr ?? '');
    throw error;
  }
}

export function retainConsumerEvidence(consumer, evidence) {
  for (const directory of ['test-results', 'playwright-report']) {
    if (existsSync(join(consumer, directory))) {
      cpSync(join(consumer, directory), join(evidence, directory), {
        recursive: true,
        filter: (source) => !source.endsWith('.webm') && !source.endsWith('.mp4')
      });
    }
  }
}
