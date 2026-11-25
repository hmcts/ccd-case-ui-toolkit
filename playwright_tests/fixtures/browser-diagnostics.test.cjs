const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
runInNewContext(ts.transpileModule(readFileSync(join(__dirname, 'browser-diagnostics.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText, { exports: exportsObject });
const main = new EventEmitter();
const context = new EventEmitter();
context.pages = () => [main];
const errors = [];
exportsObject.observeBrowserErrors(context, errors, errors);
main.emit('pageerror', new Error('main failure'));
const popup = new EventEmitter();
context.emit('page', popup);
popup.emit('pageerror', new Error('popup failure'));
popup.emit('console', { type: () => 'error', text: () => 'popup console failure' });
popup.emit('console', { type: () => 'log', text: () => 'normal diagnostic' });
assert.deepEqual(errors, ['main failure', 'popup failure', 'popup console failure']);
