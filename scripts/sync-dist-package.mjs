import { readFileSync, writeFileSync } from 'node:fs';

const rootPackagePath = new URL('../package.json', import.meta.url);
const libraryPackagePath = new URL('../projects/ccd-case-ui-toolkit/package.json', import.meta.url);
const distPackagePath = new URL('../dist/ccd-case-ui-toolkit/package.json', import.meta.url);

const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf8'));
const libraryPackage = JSON.parse(readFileSync(libraryPackagePath, 'utf8'));
const distPackage = JSON.parse(readFileSync(distPackagePath, 'utf8'));

const libraryPeerDependencies = libraryPackage.peerDependencies || {};
const distDependencies = distPackage.dependencies || {};
const rootDependencies = rootPackage.dependencies || {};

const excludedDependencyNames = new Set([
  'rxjs',
  'zone.js',
  'ngx-pagination'
]);

const excludedDependencyPrefixes = [
  '@angular/',
  '@ngrx/',
  'ngx-',
  '@angular-material-components/',
  '@nicky-lenaers/ngx-'
];

const mergedDependencies = { ...distDependencies };

for (const [dependencyName, version] of Object.entries(rootDependencies)) {
  if (shouldExcludeDependency(dependencyName)) {
    continue;
  }

  if (!mergedDependencies[dependencyName]) {
    mergedDependencies[dependencyName] = version;
  }
}

distPackage.dependencies = Object.keys(mergedDependencies)
  .sort()
  .reduce((dependencies, dependencyName) => {
    dependencies[dependencyName] = mergedDependencies[dependencyName];
    return dependencies;
  }, {});

writeFileSync(distPackagePath, `${JSON.stringify(distPackage, null, 2)}\n`);

function shouldExcludeDependency(dependencyName) {
  if (libraryPeerDependencies[dependencyName]) {
    return true;
  }

  if (excludedDependencyNames.has(dependencyName)) {
    return true;
  }

  return excludedDependencyPrefixes.some((prefix) => dependencyName.startsWith(prefix));
}
