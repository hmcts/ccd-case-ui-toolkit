import { CaseFieldService } from '../../../services/case-fields';
import { CaseField } from '../../../domain/definition';
import { IsReadOnlyAndNotCollectionPipe } from './is-read-only-and-not-collection.pipe';

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
    let field = { display_context: '', field_type: { id: 'Something', type: 'Text'} } as CaseField;

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify OPTIONAL display_context field as NOT readOnly', () => {
    let field = { display_context: 'OPTIONAL', field_type: { id: 'Something', type: 'Text'} } as CaseField;

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify MANDATORY display_context field as NOT readOnly', () => {
    let field = { display_context: 'MANDATORY', field_type: { id: 'Something', type: 'Text'} } as CaseField;

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should not identify as READONLY if field is of Type Collection', () => {
    let field = { display_context: 'READONLY', field_type: { id: 'Something', type: 'Collection'} } as CaseField;

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeFalsy();
  });

  it('should identify READONLY display_context field as readOnly', () => {
    let field = { display_context: 'READONLY', field_type: { id: 'Something', type: 'Text'} } as CaseField;

    expect(isReadOnlyAndNotCollectionPipe.transform(field)).toBeTruthy();
  });
});
