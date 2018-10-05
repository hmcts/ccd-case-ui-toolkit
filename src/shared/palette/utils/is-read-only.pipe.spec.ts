import { IsReadOnlyPipe } from './is-read-only.pipe';
import { CaseFieldService } from '../../domain/case-field.service';
import { CaseField } from '../../domain/definition/case-field.model';

describe('IsReadOnlyPipe', () => {

  let caseFieldService = new CaseFieldService();
  let isReadOnly: IsReadOnlyPipe = new IsReadOnlyPipe(caseFieldService);

  it('should identify null field as NOT readOnly', () => {
    expect(isReadOnly.transform(null))
      .toBeFalsy();
  });

  it('should identify undefined display_context as NOT readOnly', () => {
    expect(isReadOnly.transform({} as CaseField))
      .toBeFalsy();
  });

  it('should identify unknown display_context value as NOT readOnly', () => {
    expect(isReadOnly.transform({ display_context: ''} as CaseField))
      .toBeFalsy();
  });

  it('should identify OPTIONAL display_context field as NOT readOnly', () => {
    expect(isReadOnly.transform({ display_context: 'OPTIONAL' } as CaseField))
      .toBeFalsy();
  });

  it('should identify MANDATORY display_context field as NOT readOnly', () => {
    expect(isReadOnly.transform({ display_context: 'MANDATORY' } as CaseField))
      .toBeFalsy();
  });

  it('should identify READONLY display_context field as NOT readOnly', () => {
    expect(isReadOnly.transform({ display_context: 'READONLY' } as CaseField))
      .toBeTruthy();
  });
});
