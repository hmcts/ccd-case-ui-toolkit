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

const mergedPeerDependencies = {
  ...libraryPeerDependencies
};

const mergedDependencies = Object.fromEntries(
  Object.entries(distDependencies).filter(([dependencyName]) => {
    if (shouldMoveToPeerDependency(dependencyName)) {
      return false;
    }

    return true;
  })
);

for (const [dependencyName, version] of Object.entries(rootDependencies)) {
  if (shouldMoveToPeerDependency(dependencyName)) {
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

distPackage.peerDependencies = Object.keys(mergedPeerDependencies)
  .sort()
  .reduce((peerDependencies, dependencyName) => {
    peerDependencies[dependencyName] = mergedPeerDependencies[dependencyName];
    return peerDependencies;
  }, {});

writeFileSync(distPackagePath, `${JSON.stringify(distPackage, null, 2)}\n`);

function shouldMoveToPeerDependency(dependencyName) {
  return Boolean(libraryPeerDependencies[dependencyName]);
}
