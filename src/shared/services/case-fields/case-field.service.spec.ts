import { CaseFieldService } from './case-field.service';
import { LogService } from '../logging/log.service';
import { CaseField } from '../../domain/definition/case-field.model';
import { AbstractAppConfig } from '../../../app.config';

describe('CaseFieldService', () => {

  let appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getLoggingCaseFieldList']);
  appConfig.getLoggingCaseFieldList.and.returnValue('respondents,staffUploadedDocuments');

  let logService = new LogService(appConfig);
  let caseFieldService: CaseFieldService = new CaseFieldService(logService);

  describe('isOptional', () => {

    it('should identify null field as NOT optional', () => {
      expect(caseFieldService.isOptional(null))
        .toBeFalsy();
    });

    it('should identify undefined display_context as NOT optional', () => {
      expect(caseFieldService.isOptional({} as CaseField))
        .toBeFalsy();
    });

    it('should identify unknown display_context value as NOT optional', () => {
      expect(caseFieldService.isOptional({ id: 'test', display_context: '', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify OPTIONAL display_context field as optional', () => {
      expect(caseFieldService.isOptional({ id: 'test', display_context: 'OPTIONAL', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeTruthy();
    });

    it('should identify MANDATORY display_context field as NOT optional', () => {
      expect(caseFieldService.isOptional({ id: 'test', display_context: 'MANDATORY', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify READONLY display_context field as NOT optional', () => {
      expect(caseFieldService.isOptional({ id: 'test', display_context: 'READONLY', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });
  });

  describe('isReadOnly', () => {

    it('should identify null field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly(null))
        .toBeFalsy();
    });

    it('should identify undefined display_context as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({} as CaseField))
        .toBeFalsy();
    });

    it('should identify unknown display_context value as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ id: 'test', display_context: '', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify OPTIONAL display_context field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ id: 'test', display_context: 'OPTIONAL', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify MANDATORY display_context field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ id: 'test', display_context: 'MANDATORY', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify READONLY display_context field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ id: 'test', display_context: 'READONLY', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeTruthy();
    });
  });

  describe('isMandatory', () => {

    it('should identify null field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory(null))
        .toBeFalsy();
    });

    it('should identify undefined display_context as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({} as CaseField))
        .toBeFalsy();
    });

    it('should identify unknown display_context value as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ id: 'test', display_context: '', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify OPTIONAL display_context field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ id: 'test', display_context: 'OPTIONAL', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });

    it('should identify MANDATORY display_context field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ id: 'test', display_context: 'MANDATORY', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeTruthy();
    });

    it('should identify READONLY display_context field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ id: 'test', display_context: 'READONLY', label: 'test',
        field_type: { id: 'Text', type: 'Text' } } as CaseField))
        .toBeFalsy();
    });
  });
});
