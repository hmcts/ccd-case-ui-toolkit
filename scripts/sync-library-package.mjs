import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const rootPackagePath = path.join(repoRoot, 'package.json');
const libraryPackagePath = path.join(repoRoot, 'projects/ccd-case-ui-toolkit/package.json');
const ngPackagePath = path.join(repoRoot, 'projects/ccd-case-ui-toolkit/ng-package.json');

const rootPackage = readJson(rootPackagePath);
const libraryPackage = readJson(libraryPackagePath);
const ngPackage = readJson(ngPackagePath);

const publishableFields = [
  'name',
  'version',
  'engines',
  'description',
  'license',
  'repository',
  'publishConfig',
  'dependencies',
  'peerDependencies',
  'optionalDependencies'
];

const nextLibraryPackage = {};

for (const field of publishableFields) {
  if (rootPackage[field] !== undefined) {
    nextLibraryPackage[field] = rootPackage[field];
  }
}

for (const [key, value] of Object.entries(libraryPackage)) {
  if (nextLibraryPackage[key] === undefined) {
    nextLibraryPackage[key] = value;
  }
}

const allowedNonPeerDependencies = Object.keys(nextLibraryPackage.dependencies || {}).sort();
const nextNgPackage = {
  ...ngPackage,
  allowedNonPeerDependencies
};

writeJson(libraryPackagePath, nextLibraryPackage);
writeJson(ngPackagePath, nextNgPackage);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
