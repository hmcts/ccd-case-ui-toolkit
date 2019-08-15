import { CaseFieldService } from '../../../services/case-fields';
import { CaseField } from '../../../domain/definition';
import { IsReadOnlyAndNotCollectionPipe } from './is-read-only-and-not-collection.pipe';
import { createFieldType, newCaseField } from '../../../fixture';

describe('IsReadOnlyAndNotCollectionPipe', () => {

  let caseFieldService = new CaseFieldService();
  let isReadOnlyAndNotCollectionPipe: IsReadOnlyAndNotCollectionPipe = new IsReadOnlyAndNotCollectionPipe(caseFieldService);

  it('should identify null field as NOT readOnly', () => {
    expect(isReadOnlyAndNotCollectionPipe.transform(null)).toBeFalsy();
  });

  it('should identify undefined display_context as NOT readOnly', () => {
    expect(isReadOnlyAndNotCollectionPipe.transform({} as CaseField)).toBeFalsy();
  });

  it('should identify unknown display_context value as NOT readOnly', () => {
    let field = newCaseField('', '', null, null, '').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify OPTIONAL display_context field as NOT readOnly', () => {
    let field = newCaseField('', '', null, null, 'OPTIONAL').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify MANDATORY display_context field as NOT readOnly', () => {
    let field = newCaseField('', '', null, null, 'MANDATORY').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should not identify as READONLY if field is of Type Collection', () => {
    let field = newCaseField('', '', null, createFieldType('Coll', 'Collection'), 'READONLY').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify READONLY display_context field as readOnly', () => {
    let field = newCaseField('', '', null, null, 'READONLY').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeTruthy();
  });
});
