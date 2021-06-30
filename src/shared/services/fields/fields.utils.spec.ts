import { CaseTab, CaseView } from '../../domain/case-view';
import { FieldsUtils } from './fields.utils';
import { CaseField } from '../../domain/definition';
import { aCaseField } from '../../index';

describe('FieldsUtils', () => {
  const fieldUtils = new FieldsUtils();

  const textField: CaseField =
    aCaseField('textField', 'Some text', 'Text', 'OPTIONAL', null);
  const caseCreationDate: CaseField =
    aCaseField('caseCreationDate', 'Creation date', 'Date', 'OPTIONAL', null);
  const caseAmountToPay: CaseField =
    aCaseField('caseAmountToPay', 'Amount to pay', 'MoneyGBP', 'OPTIONAL', null);
  const complexFieldWithDateAndMoney: CaseField =
    aCaseField('claimDetails', 'Claima details', 'Complex', 'OPTIONAL', null, [caseCreationDate, caseAmountToPay]);
  const complexFieldWithAnotherComplexField: CaseField =
    aCaseField('details', 'Details', 'Complex', 'OPTIONAL', null, [complexFieldWithDateAndMoney]);

  describe('getCaseFields', () => {
    const caseField1 = new CaseField();
    caseField1.id = 'field1';
    const caseField2 = new CaseField();
    caseField2.id = 'field2';
    const caseField3 = new CaseField();
    caseField3.id = 'field3';

    const caseTab1 = new CaseTab();
    caseTab1.fields = [caseField1];
    const caseTab2 = new CaseTab();
    caseTab2.fields = [caseField2];

    const caseView = new CaseView();
    caseView.tabs = [caseTab1, caseTab2];

    it('should return array of case data fields and metadata fields as case fields for given case view object', () => {
      caseView.metadataFields = [caseField3];

      const caseFields = FieldsUtils.getCaseFields(caseView);

      expect(caseFields.length).toBe(3);
      expect(caseFields).toEqual(jasmine.arrayContaining([caseField1, caseField2, caseField3]));
    });

    it('should return array of unique case fields', () => {
      caseView.metadataFields = [caseField2];

      const caseFields = FieldsUtils.getCaseFields(caseView);

      expect(caseFields.length).toBe(2);
      expect(caseFields).toEqual(jasmine.arrayContaining([caseField1, caseField2]));
    });

  });

  describe('mergeLabelCaseFieldsAndFormFields using formFields data', () => {
    it('should merge simple Date field', () => {
      const formFieldsData = {
        caseCreationDate: '1999-02-01',
        someText: 'This is test.'
      };

      const caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([caseCreationDate, textField], formFieldsData);

      expect(caseFields['caseCreationDate']).toBe('1 Feb 1999');
    });

    it('should merge simple MoneyGBP field', () => {
      const data = { someText: 'Test', caseAmountToPay: '1245' };
      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], data);
      expect(caseFields['caseAmountToPay']).toBe('£12.45');
    });

    it('should handle zero string in MoneyGBP field', () => {
      const data = { someText: 'Test', caseAmountToPay: '0' };
      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], data);
      expect(caseFields['caseAmountToPay']).toBe('£0.00');
    });

    it('should handle numeric zero in MoneyGBP field', () => {
      const data = { someText: 'Test', caseAmountToPay: 0 };
      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], data);
      expect(caseFields['caseAmountToPay']).toBe('£0.00');
    });

    it('should handle invalid value in MoneyGBP field', () => {
      const data = { someText: 'Test', caseAmountToPay: 'bob' };
      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], data);
      expect(caseFields['caseAmountToPay']).toBe('');
    });

    it('should merge complex field containing Date and Money field', () => {
      const formFieldsData = {
        someText: 'This is test.',
        claimDetails: {
          caseAmountToPay: '6789',
          caseCreationDate: '2018-11-22'
        }
      };

      const caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithDateAndMoney], formFieldsData);

      const caseFields1 = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithDateAndMoney], formFieldsData);

      expect(caseFields['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields['claimDetails']['caseAmountToPay']).toBe('£67.89');
      expect(caseFields1['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields1['claimDetails']['caseAmountToPay']).toBe('£67.89');
    });

    it('should merge complex field containing Date and Money two levels deep', () => {
      const formFieldsData = {
        someText: 'This is test.',
        details: {
          claimDetails: {
            caseAmountToPay: '6789',
            caseCreationDate: '2018-11-22'
          }
        }
      };

      const caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithAnotherComplexField], formFieldsData);

      expect(caseFields['details']['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields['details']['claimDetails']['caseAmountToPay']).toBe('£67.89');
    });
  });

  describe('mergeLabelCaseFieldsAndFormFields using data from caseFields value', () => {
    it('should merge simple Date field', () => {
      caseCreationDate.value = '1999-02-01';
      textField.value = 'This is test.';

      const caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([caseCreationDate, textField], {});

      expect(caseFields['textField']).toBe('This is test.');
      expect(caseFields['caseCreationDate']).toBe('1 Feb 1999');
    });

    it('should merge complex field containing Date and Money two levels deep', () => {
      textField.value = 'This is test.';
      complexFieldWithAnotherComplexField.value = {
        claimDetails: {
          caseAmountToPay: '6789',
          caseCreationDate: '2018-11-22'
        }
      };

      const caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithAnotherComplexField], {});

      expect(caseFields['details']['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields['details']['claimDetails']['caseAmountToPay']).toBe('£67.89');
    });
  });

  describe('containsNonEmptyValues() function tests', () => {
    it('should return false for null', () => {
      expect(FieldsUtils.containsNonEmptyValues(null)).toBe(false);
    });

    it('should return true for a non-empty object', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: 'value' })).toBe(true);
    });

    it('should return false for an empty object', () => {
      expect(FieldsUtils.containsNonEmptyValues({})).toBe(false);
    });

    it('should return false for an object containing only null and empty string values', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: null, field2: '' })).toBe(false);
    });

    it('should return false for an object containing only an undefined value', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: undefined })).toBe(false);
    });

    it('should return true for an object containing a zero number value', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: 0 })).toBe(true);
    });

    it('should return false for an object containing no non-empty descendant values', () => {
      expect(FieldsUtils.containsNonEmptyValues({
        field1: {
          field1_1: null,
          field1_2: '',
          field1_3: undefined
        }
      })).toBe(false);
    });

    it('should return true for an object containing at least one non-empty descendant value', () => {
      expect(FieldsUtils.containsNonEmptyValues({
        field1: {
          field1_1: null,
          field1_2: 'null'
        }
      })).toBe(true);
    });

    it('should return true for an object containing a non-empty array', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: ['value'] })).toBe(true);
    });

    it('should return false for an object containing an empty array', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: [] })).toBe(false);
    });

    it('should return false for an object with an array containing only null and empty string values', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: [null, ''] })).toBe(false);
    });

    it('should return false for an object with an array containing only an undefined value', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: [undefined] })).toBe(false);
    });

    it('should return true for an object with an array containing a zero number value', () => {
      expect(FieldsUtils.containsNonEmptyValues({ field1: [0] })).toBe(true);
    });

    it('should return true for a non-empty array', () => {
      expect(FieldsUtils.containsNonEmptyValues(['value'])).toBe(true);
    });

    it('should return false for an empty array', () => {
      expect(FieldsUtils.containsNonEmptyValues([])).toBe(false);
    });

    it('should return false for an array containing only null and empty string values', () => {
      expect(FieldsUtils.containsNonEmptyValues([null, ''])).toBe(false);
    });

    it('should return false for an array containing only an undefined value', () => {
      expect(FieldsUtils.containsNonEmptyValues([undefined])).toBe(false);
    });

    it('should return true for an array containing a zero number value', () => {
      expect(FieldsUtils.containsNonEmptyValues([0])).toBe(true);
    });

    it('should return true for an array containing a non-empty object', () => {
      expect(FieldsUtils.containsNonEmptyValues([{ field1: 'value' }])).toBe(true);
    });

    it('should return false for an array containing an empty object', () => {
      expect(FieldsUtils.containsNonEmptyValues([{}])).toBe(false);
    });

    it('should return false for an array with an object containing only null and empty string values', () => {
      expect(FieldsUtils.containsNonEmptyValues([{ field1: null, field2: '' }])).toBe(false);
    });

    it('should return false for an array with an object containing only an undefined value', () => {
      expect(FieldsUtils.containsNonEmptyValues([{ field1: undefined }])).toBe(false);
    });

    it('should return true for an array with an object containing a zero number value', () => {
      expect(FieldsUtils.containsNonEmptyValues([{ field1: 0 }])).toBe(true);
    });

    it('should return false for an array with an object containing no non-empty descendant values', () => {
      expect(FieldsUtils.containsNonEmptyValues([{
        field1: {
          field1_1: null,
          field1_2: '',
          field1_3: undefined
        }
      }])).toBe(false);
    });

    it('should return true for an array with an object containing at least one non-empty descendant value', () => {
      expect(FieldsUtils.containsNonEmptyValues([{
        field1: {
          field1_1: null,
          field1_2: 'null'
        }
      }])).toBe(true);
    });
  });
});
