import { createRequire } from 'node:module';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';

// This is a scoped contract check; unrelated strict declaration diagnostics remain visible.
export function checkPackedFlagContract(consumer) {
  const ts = createRequire(join(consumer, 'package.json'))('typescript');
  const fixture = join(consumer, 'flag-pipe-contract.ts');
  writeFileSync(fixture, `import { AsyncPipe } from '@angular/common';
import { FlagFieldDisplayPipe, type CaseEditSubmitForm } from '@hmcts/ccd-case-ui-toolkit';
import { Observable, Subscribable } from 'rxjs';
type IsAny<T> = 0 extends (1 & T) ? true : false;
const validAsyncPipe: IsAny<AsyncPipe> = false;
const validTransform: IsAny<AsyncPipe['transform']> = false;
const validObservable: IsAny<Observable<string>> = false;
const validSubscribable: IsAny<Subscribable<string>> = false;
void validAsyncPipe; void validTransform; void validObservable; void validSubscribable;
declare const flag: FlagFieldDisplayPipe;
const inherited: AsyncPipe = flag;
declare const value: PromiseLike<string>;
declare const observable: Observable<string>;
const promiseResult = flag.transform(value);
const observableResult = flag.transform(observable);
const nullResult = flag.transform(null);
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const promiseType: IsEqual<typeof promiseResult, string | null> = true;
const observableType: IsEqual<typeof observableResult, string | null> = true;
const nullType: IsEqual<typeof nullResult, null> = true;
const promiseNotAny: IsAny<typeof promiseResult> = false;
const observableNotAny: IsAny<typeof observableResult> = false;
const nullNotAny: IsAny<typeof nullResult> = false;
void inherited; void promiseType; void observableType; void nullType;
void promiseNotAny; void observableNotAny; void nullNotAny;
type SubmitResult = ReturnType<CaseEditSubmitForm['submit']>;
const submitType: IsEqual<SubmitResult, Observable<object>> = true;
const submitNotAny: IsAny<SubmitResult> = false;
void submitType; void submitNotAny;
`);
  const options = {
    strict: true, skipLibCheck: false, noEmit: true,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext, types: []
  };
  const program = ts.createProgram([fixture], options);
  const packageSource = program.getSourceFiles().find((source) =>
    /[/\\]@hmcts[/\\]ccd-case-ui-toolkit[/\\]index\.d\.ts$/.test(source.fileName));
  const flag = packageSource?.statements.find((statement) =>
    ts.isClassDeclaration(statement) && statement.name?.text === 'FlagFieldDisplayPipe');
  if (!flag) throw new Error('Packed FlagFieldDisplayPipe declaration was not found');
  const imports = packageSource.statements.filter((statement) => {
    if (!ts.isImportDeclaration(statement) || !statement.importClause?.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)) return false;
    return statement.importClause.namedBindings.elements.some((element) =>
      ['AsyncPipe', 'Observable', 'Subscribable'].includes((element.propertyName ?? element.name).text));
  });
  const caseEdit = packageSource.statements.find((statement) =>
    ts.isInterfaceDeclaration(statement) && statement.name.text === 'CaseEditModel');
  const submit = caseEdit?.members.find((member) => ts.isMethodSignature(member) && member.name.getText(packageSource) === 'submit');
  if (!submit) throw new Error('Packed case-edit submit declaration was not found');
  const submitTypeName = submit.type && ts.isTypeReferenceNode(submit.type) ? submit.type.typeName.getText(packageSource) : '';
  const usesCompat = packageSource.statements.some((statement) =>
    ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === 'rxjs-compat' &&
    statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings) &&
    statement.importClause.namedBindings.elements.some((element) => element.name.text === submitTypeName));
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const targeted = diagnostics.filter((diagnostic) => !diagnostic.file || (
    diagnostic.file.fileName === fixture ||
    (usesCompat && /[/\\]rxjs-compat[/\\]/.test(diagnostic.file.fileName)) ||
    (diagnostic.file === packageSource && [flag, ...imports].some((node) => diagnostic.start >= node.getStart() && diagnostic.start < node.getEnd()))
  ));
  const unrelated = diagnostics.filter((diagnostic) => !targeted.includes(diagnostic));
  const format = (items) => ts.formatDiagnosticsWithColorAndContext(items, {
    getCurrentDirectory: () => consumer, getCanonicalFileName: (file) => file, getNewLine: () => '\n'
  });
  if (unrelated.length) process.stderr.write(`Unrelated strict diagnostics (${unrelated.length}; not a full strict-build pass):\n${format(unrelated)}`);
  if (usesCompat) throw new Error('Packed case-edit submit must use the rxjs Observable type, not rxjs-compat');
  if (targeted.length) throw new Error(`Packed flag and case-edit contracts failed:\n${format(targeted)}`);
  process.stdout.write('Packed flag and case-edit contracts passed; unrelated strict diagnostics are reported separately.\n');
}
