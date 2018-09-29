import { CaseFieldService } from './case-field.service';
import { CaseField } from './definition/case-field.model';

describe('CaseFieldService', () => {

  let caseFieldService: CaseFieldService = new CaseFieldService();
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
      expect(caseFieldService.isOptional({ display_context: '' } as CaseField))
        .toBeFalsy();
    });

    it('should identify OPTIONAL display_context field as optional', () => {
      expect(caseFieldService.isOptional({ display_context: 'OPTIONAL' } as CaseField))
        .toBeTruthy();
    });

    it('should identify MANDATORY display_context field as NOT optional', () => {
      expect(caseFieldService.isOptional({ display_context: 'MANDATORY' } as CaseField))
        .toBeFalsy();
    });

    it('should identify READONLY display_context field as NOT optional', () => {
      expect(caseFieldService.isOptional({ display_context: 'READONLY' } as CaseField))
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
      expect(caseFieldService.isReadOnly({ display_context: '' } as CaseField))
        .toBeFalsy();
    });

    it('should identify OPTIONAL display_context field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ display_context: 'OPTIONAL' } as CaseField))
        .toBeFalsy();
    });

    it('should identify MANDATORY display_context field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ display_context: 'MANDATORY' } as CaseField))
        .toBeFalsy();
    });

    it('should identify READONLY display_context field as NOT readOnly', () => {
      expect(caseFieldService.isReadOnly({ display_context: 'READONLY' } as CaseField))
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
      expect(caseFieldService.isMandatory({ display_context: '' } as CaseField))
        .toBeFalsy();
    });

    it('should identify OPTIONAL display_context field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ display_context: 'OPTIONAL' } as CaseField))
        .toBeFalsy();
    });

    it('should identify MANDATORY display_context field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ display_context: 'MANDATORY' } as CaseField))
        .toBeTruthy();
    });

    it('should identify READONLY display_context field as NOT mandatory', () => {
      expect(caseFieldService.isMandatory({ display_context: 'READONLY' } as CaseField))
        .toBeFalsy();
    });
  });
});
