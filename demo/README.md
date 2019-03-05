# `ccd-case-ui-toolkit` demo project
[![Heroku CI Status](https://heroku-badge.herokuapp.com/?app=heroku-badge&style=flat)](https://ccd-case-ui-toolkit-demo.herokuapp.com/)

> This folder contains a demo-project for [ccd-case-ui-toolkit](https://github.com/hmcts/ccd-case-ui-toolkit). This demo project may help you to test whether your library supports JIT build or not.
>
> - `src` folder contains Angular project that is built using [@angular/cli](https://www.npmjs.com/package/@angular/cli). This demo project utilizes ESM (pure ES2015) sources of your library to do [JIT](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html) (just-in-time) compilation.
>
Demo-project is created as an alternative to `npm link` command. You may simply delete this `demo` folder if you prefer to use [yarn link](https://yarnpkg.com/en/docs/cli/link) instead to check how your library is being built.

# Quick Start

```bash
# Open first terminal and assuming that you are already in case-ui-toolkit folder

# Install all dependencies
yarn install

# Start build of ccd-case-ui-toolkit in esm watch mode
yarn build:esm

# Open second terminal and assuming that you are already in case-ui-toolkit/demo folder

# Install all dependencies
yarn install

# Build demo app
yarn build

# Notice this spins up stubs api in the same process - see server.js)
yarn start

# To verify the demo app is working go to http://localhost:8080
```

# Heroku

```bash
There is a `heroku-publish.sh` script in this folder that can be used as:

./heroku-publish.sh

# After that the app is accessible in heroku under: https://ccd-case-ui-toolkit-demo.herokuapp.com/
```

# File Structure

```
ccd-case-ui-toolkit
  └─ demo                           * Folder with demo application (MAY BE DELETED if not required) 
     ├─ src                         * Demo project
     |  ├─ app                      * Demo application sources. Adopt them with your library.
     |  ├─ public                   * Demo application resources. Adopt them with your library.
     |  ├─ style                    * Demo application styles. Adopt them with your library.
     |  ├─ index.html               * Main application template.
     |  ├─ main.ts                  * Main entry.
     |  ├─ polyfills.ts             * Browser polyfills.
     |  └─ tsconfig.app.json        * Angular app configuration.
     |   
     ├─ stubs                       * Stubs routes and data for stub server
     ├─ .gitignore                  * List of files that are ignored while publishing to git repository
     ├─ angular.json                * Typescript app configuration.
     ├─ heroku-publish.sh           * Heroku publish script.
     ├─ server.js                   * Node js server wrapping angular app (needed for heroku)
     ├─ gulpfile.js                 * Gulp helper scripts for building demos
     ├─ package.json                * NPM dependencies and helper scripts for building demos
     ├─ tsconfig.json               * Typescript base configuration.
     └─ yarn.lock                   * Yarn dependency versions lock for demo applications
```

# Getting Started

## Dependencies

#### Node/NPM
Install latest Node and NPM following the [instructions](https://nodejs.org/en/download/). Make sure you have Node version ≥ 7.0 and NPM ≥ 4.

- `brew install node` for Mac.

#### Yarn
Install Yarn by following the [instructions](https://yarnpkg.com/en/docs/install).

- `brew install yarn` for Mac.

## Installing
- Switch to `demo` folder in your console.
- `yarn install` to install required dependencies.

## Build project
- `yarn build` for building Angular Demo app.

## Start project in watch mode
- `yarn start:watch` for starting version of demo project and start watching for library changes.

This command may be used simultaneously in combination with [ccd-case-ui-toolkit](https://github.com/hmcts/ccd-case-ui-toolkit)'s `yarn build:watch`. As a result once you change library source code it will be automatically re-compiled and in turn your demo-project will be automatically re-built and you will be able to see that changes in your browser instantly. 

See [Development Workflow](https://github.com/hmcts/ccd-case-ui-toolkit#development-workflow) section of [ccd-case-ui-toolkit](hhttps://github.com/hmcts/ccd-case-ui-toolkit)'s README for more details.
