# `angular-library-seed` demo projects

> This folder contains a demo-project for [ccd-case-ui-toolkit](https://github.com/hmcts/ccd-case-ui-toolkit). This demo project may help you to test whether your library supports JIT build or not.
>
> - `src` folder contains Angular project that is built using [@angular/cli](https://www.npmjs.com/package/@angular/cli). This demo project utilizes ESM (pure ES2015) sources of your library to do [JIT](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html) (just-in-time) compilation.
>
Demo-project is created as an alternative to `npm link` command. You may simply delete this `demo` folder if you prefer to use [yarn link](https://yarnpkg.com/en/docs/cli/link) instead to check how your library is being built.

# Quick Start

```bash
# Assuming the you are already in case-ui-toolkit/demo folder

# Install all dependencies
yarn install

# Start watching library dist folder and do project build in watch mode.
yarn start:watch

```

# File Structure

```
angular-library-seed
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

## Replace `CaseUIToolkit` library related code with your own library tags and imports
This step may be optional at first since you might just want to build demo projects with CaseUIToolkit library example.

Once you're ready to develop your own library you should do the following.
- Adjust source codes of `ccd-case-ui-toolkit/demo/src/app/*.ts` files for Angular builds.

## Build project
- `yarn build` for building Angular Demo app.

## Start project in watch mode
- `yarn start:watch` for starting version of demo project and start watching for library changes.

This command may be used simultaneously in combination with [ccd-case-ui-toolkit](https://github.com/hmcts/ccd-case-ui-toolkit)'s `yarn build:watch`. As a result once you change library source code it will be automatically re-compiled and in turn your demo-project will be automatically re-built and you will be able to see that changes in your browser instantly. 

See [Development Workflow](https://github.com/trekhleb/angular-library-seed#development-workflow) section of [angular-library-seed](https://github.com/trekhleb/angular-library-seed)'s README for more details.
