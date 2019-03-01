# ccd-case-ui-toolkit
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/hmcts/ccd-case-ui-toolkit.svg?branch=master)](https://travis-ci.org/hmcts/ccd-case-ui-toolkit)
[![codecov](https://codecov.io/gh/hmcts/ccd-case-ui-toolkit/branch/master/graph/badge.svg)](https://codecov.io/gh/hmcts/ccd-case-ui-toolkit)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/93a438c61ff54973bc09a4387497e282)](https://www.codacy.com/app/adr1ancho/ccd-case-ui-toolkit?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=hmcts/ccd-case-ui-toolkit&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/hmcts/ccd-case-ui-toolkit/badge.svg)](https://snyk.io/test/github/hmcts/ccd-case-ui-toolkit)
[![HitCount](http://hits.dwyl.io/hmcts/ccd-case-ui-toolkit.svg)](#ccd-case-ui-toolkit)
[![Issue Stats](http://issuestats.com/github/hmcts/ccd-case-ui-toolkit/badge/pr)](http://issuestats.com/github/hmcts/ccd-case-ui-toolkit)

# Quick Start (for local development and testing)

```bash
# Install all dependencies
yarn install

# Create symbolic link
yarn link

# Build library in watch mode
yarn build:watch
```

In you project folder that should consume the library:

```bash
# Go to consumer repository folder
cd case-management-web

# Link you library to the project
yarn link "@hmcts/ccd-case-ui-toolkit"

yarn start

```

*Note: The linking might be broken so if your encounter problems please follow this process:*

```bash
# Install all dependencies
yarn install

# Build library in watch mode
yarn build:watch
```

In you project folder that should consume the library:

```bash
# Go to consumer repository folder
cd case-management-web

# Remove existing toolkit dist
rm -rf node_modules/\@hmcts/ccd-case-ui-toolkit/dist

# Link you library to the project
cp <location of ccd-case-ui-toolkit>/dist node_modules/\@hmcts/ccd-case-ui-toolkit

yarn start

```

You can also have a quick look at an example usage of the UI Toolkit demo project by (after both folders had `yarn install` ran on them):
```bash
# build UI Toolkit
yarn build:esm

# copy UI Toolkit dist folder to demo/node_modules/@hmcts/ccd-case-ui-toolkit/dist
yarn build:demo

# start demo app and stub server in same process
yarn start:demo
# Go to http://localhost:8080
```

# File Structure

```
case-ui-toolkit
  |
  ├─ src                          * Library sources home folder
  |  ├─ components                * Example of library components with tests
  |  ├─ services                  * Example of library services with tests
  |  ├─ index.ts                  * Library entry point that is used by builders
  |  └─ footers.module.ts         * Example of library module
  |  └─ headers-module.ts         * Example of library module
  |
  ├─ .editorconfig                * Common IDE configuration
  ├─ .gitignore	                  * List of files that are ignored while publishing to git repo
  ├─ .npmignore                   * List of files that are ignored while publishing to npmjs
  ├─ .travis.yml                  * Travic CI configuration
  ├─ LICENSE.md                   * License details
  ├─ README.md                    * README for you library
  ├─ gulpfile.js                  * Gulp helper scripts
  ├─ karma-test-entry.ts          * Entry script for Karma tests
  ├─ karma.conf.ts                * Karma configuration for our unit tests
  ├─ package.json                 * yarn dependencies, scripts and package configuration
  ├─ tsconfig-aot.json            * TypeScript configuration for AOT build
  ├─ tsconfig.json                * TypeScript configuration for UMD and Test builds
  ├─ tslint.json                  * TypeScript linting configuration
  ├─ webpack-test.config.ts       * Webpack configuration for building test version of the library
  ├─ webpack-umd.config.ts        * Webpack configuration for building UMD bundle
  └─ yarn.lock                    * yarn lock file that locks dependency versions
```

# Getting Started

## Build the library
- `yarn build` for building the library once (both ESM and AOT versions).
- `yarn build:watch` for building the library (both ESM and AOT versions) and watch for file changes.

You may also build UMD bundle and ESM files separately:
- `yarn build:esm` - for building AOT/JIT compatible versions of files.
- `yarn build:esm:watch` - the same as previous command but in watch-mode.
- `yarn build:umd` - for building UMD bundle only.
- `yarn build:umd:watch` - the same as previous command but in watch-mode.

## Build the library (for CCD devs working on ccd-case-management-web)
For CCD developers it should be noted the library should be built with just the `yarn build:esm` which is much faster. That will build the JIT version that is currently used by case management web.

## Other commands

#### Test the library
- `yarn test` for running all your `*.spec.ts` tests once. Generated code coverage report may be found in `coverage` folder.
- `yarn test:watch` for running all you `*.spec.ts` and watch for file changes.

# Library development workflow

In order to debug your library in browser you need to have Angular project that will consume your library, build the application and display it. For your convenience all of that should happen automatically in background so once you change library source code you should instantly see the changes in browser.

There are several ways to go here:
- Use your **real library-consumer project** and link your library to it via `yarn link` command (see below).
- Use [Angular-CLI](https://cli.angular.io/) to generate library-consumer project for you and then use `yarn link` to link your library to it.

### Using consumer applications

You may take advantage of watch-modes for library build in order to see changes to your library's source code immediately in your browser.

To do so you need to:
1. Open two console instances.
2. Launch library build in watch mode in first console instance by running `yarn build:watch` (assuming that you're in `case-ui-toolkit` root folder).
3. Launch your consumer project build (JIT version) in watch-mode by running `yarn start` in second console instance (for instance assuming that you're in `case-management-web` folder).

As a result once you change library source code it will be automatically re-compiled and in turn your JIT consuming project (e.g. case-management-web) will be automatically re-built and you will be able to see that changes in your browser instantly.

## LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
