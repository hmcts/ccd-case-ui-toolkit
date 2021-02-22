import { IsReadOnlyPipe } from './is-read-only.pipe';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { LogService } from '../../../services/logging/log.service';
import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractAppConfig } from '../../../../app.config';

describe('IsReadOnlyPipe', () => {

  let appConfig: any;
  let logService = new LogService(appConfig);
  let caseFieldService = new CaseFieldService(logService);
  let isReadOnly: IsReadOnlyPipe = new IsReadOnlyPipe(caseFieldService);

  beforeEach(() => {
    appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getLoggingCaseFieldList']);
    appConfig.getLoggingCaseFieldList.and.returnValue(['respondents', 'staffUploadedDocuments']);
  });

  it('should identify null field as NOT readOnly', () => {
    expect(isReadOnly.transform(null))
      .toBeFalsy();
  });

  it('should identify undefined display_context as NOT readOnly', () => {
    expect(isReadOnly.transform({} as CaseField))
      .toBeFalsy();
  });

  it('should identify unknown display_context value as NOT readOnly', () => {
    expect(isReadOnly.transform({ id: 'test', display_context: '', label: 'test',
      field_type: { id: 'Text', type: 'Text' } } as CaseField))
      .toBeFalsy();
  });

  it('should identify OPTIONAL display_context field as NOT readOnly', () => {
    expect(isReadOnly.transform({ id: 'test', display_context: 'OPTIONAL', label: 'test',
      field_type: { id: 'Text', type: 'Text' } } as CaseField))
      .toBeFalsy();
  });

  it('should identify MANDATORY display_context field as NOT readOnly', () => {
    expect(isReadOnly.transform({ id: 'test', display_context: 'MANDATORY', label: 'test',
      field_type: { id: 'Text', type: 'Text' } } as CaseField))
      .toBeFalsy();
  });

  it('should identify READONLY display_context field as readOnly', () => {
    expect(isReadOnly.transform({ id: 'test', display_context: 'READONLY', label: 'test',
      field_type: { id: 'Text', type: 'Text' } } as CaseField))
      .toBeTruthy();
  });
});
