import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { IsMandatoryPipe } from './is-mandatory.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';

describe('IsReadOnlyPipe', () => {

  let caseFieldService = new CaseFieldService();
  let isMandatoryPipe: IsMandatoryPipe = new IsMandatoryPipe(caseFieldService);

  it('should identify null field as NOT mandatory', () => {
    expect(isMandatoryPipe.transform(null))
      .toBeFalsy();
  });

  it('should identify undefined display_context as NOT mandatory', () => {
    expect(isMandatoryPipe.transform({} as CaseField))
      .toBeFalsy();
  });

  it('should identify unknown display_context value as NOT mandatory', () => {
    expect(isMandatoryPipe.transform({ display_context: ''} as CaseField))
      .toBeFalsy();
  });

  it('should identify OPTIONAL display_context field as NOT mandatory', () => {
    expect(isMandatoryPipe.transform({ display_context: 'OPTIONAL' } as CaseField))
      .toBeFalsy();
  });

  it('should identify MANDATORY display_context field as NOT mandatory', () => {
    expect(isMandatoryPipe.transform({ display_context: 'MANDATORY' } as CaseField))
      .toBeTruthy();
  });

  it('should identify READONLY display_context field as NOT mandatory', () => {
    expect(isMandatoryPipe.transform({ display_context: 'READONLY' } as CaseField))
      .toBeFalsy();
  });
});
