import { CaseField } from '../../../domain/definition';
import { createFieldType, newCaseField } from '../../../fixture';
import { CaseFieldService } from '../../../services/case-fields';
import { IsReadOnlyAndNotCollectionPipe } from './is-read-only-and-not-collection.pipe';

describe('IsReadOnlyAndNotCollectionPipe', () => {

  const caseFieldService = new CaseFieldService();
  const isReadOnlyAndNotCollectionPipe: IsReadOnlyAndNotCollectionPipe = new IsReadOnlyAndNotCollectionPipe(caseFieldService);

  it('should identify null field as NOT readOnly', () => {
    expect(isReadOnlyAndNotCollectionPipe.transform(null)).toBeFalsy();
  });

  it('should identify undefined display_context as NOT readOnly', () => {
    expect(isReadOnlyAndNotCollectionPipe.transform({} as CaseField)).toBeFalsy();
  });

  it('should identify unknown display_context value as NOT readOnly', () => {
    const field = newCaseField('', '', null, null, '').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify OPTIONAL display_context field as NOT readOnly', () => {
    const field = newCaseField('', '', null, null, 'OPTIONAL').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify MANDATORY display_context field as NOT readOnly', () => {
    const field = newCaseField('', '', null, null, 'MANDATORY').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should not identify as READONLY if field is of Type Collection', () => {
    const field = newCaseField('', '', null, createFieldType('Coll', 'Collection'), 'READONLY').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify READONLY display_context field as readOnly', () => {
    const field = newCaseField('', '', null, null, 'READONLY').build();

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeTruthy();
  });
});
