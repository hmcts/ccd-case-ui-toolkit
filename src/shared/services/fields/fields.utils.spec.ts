import { CaseTab, CaseView } from '../../domain/case-view';
import { FieldsUtils } from './fields.utils';
import { CaseField } from '../../domain/definition';
import { newCaseField, createFieldType } from '../../fixture';

describe('FieldsUtils', () => {
  let fieldUtils = new FieldsUtils();

  let textField: CaseField = newCaseField('textField', 'Some text', null, null, 'OPTIONAL', null).build();
  let caseCreationDate: CaseField = newCaseField('caseCreationDate', 'Creation date', null,
    createFieldType('Date', 'Date'), 'OPTIONAL', null).build();
  let caseAmountToPay: CaseField = newCaseField('caseAmountToPay', 'Amount to pay', null,
    createFieldType('MoneyGBP', 'MoneyGBP'), 'OPTIONAL', null).build();
  let complexFieldWithDateAndMoney: CaseField = newCaseField('claimDetails', 'Claima details', null,
    createFieldType('Complex', 'Complex', [caseCreationDate, caseAmountToPay]), 'OPTIONAL', null).build();
  let complexFieldWithAnotherComplexField: CaseField = newCaseField('details', 'Details', null,
      createFieldType('Complex', 'Complex', [complexFieldWithDateAndMoney]), 'OPTIONAL', null).build();

  describe('getCaseFields', () => {
    let caseField1 = new CaseField();
    caseField1.id = 'field1';
    let caseField2 = new CaseField();
    caseField2.id = 'field2';
    let caseField3 = new CaseField();
    caseField3.id = 'field3';

    let caseTab1 = new CaseTab();
    caseTab1.fields = [caseField1];
    let caseTab2 = new CaseTab();
    caseTab2.fields = [caseField2];

    let caseView = new CaseView();
    caseView.tabs = [caseTab1, caseTab2];

    it('should return array of case data fields and metadata fields as case fields for given case view object', () => {
      caseView.metadataFields = [caseField3];

      let caseFields = FieldsUtils.getCaseFields(caseView);

      expect(caseFields.length).toBe(3);
      expect(caseFields).toEqual(jasmine.arrayContaining([caseField1, caseField2, caseField3]));
    });

    it('should return array of unique case fields', () => {
      caseView.metadataFields = [caseField2];

      let caseFields = FieldsUtils.getCaseFields(caseView);

      expect(caseFields.length).toBe(2);
      expect(caseFields).toEqual(jasmine.arrayContaining([caseField1, caseField2]));
    });

  });

  describe('mergeLabelCaseFieldsAndFormFields using formFields data', () => {
    it('should merge simple Date field', () => {
      let formFieldsData = {
        caseCreationDate: '1999-02-01',
        someText: 'This is test.'
      };

      let caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([caseCreationDate, textField], formFieldsData);

      expect(caseFields['caseCreationDate']).toBe('1 Feb 1999');
    });

    it('should merge simple MoneyGBP field', () => {
      let formFieldsData = {
        someText: 'This is test.',
        caseAmountToPay: '1245'
      };

      let caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], formFieldsData);

      expect(caseFields['caseAmountToPay']).toBe('£12.45');
    });

    it('should merge complex field containing Date and Money field', () => {
      let formFieldsData = {
        someText: 'This is test.',
        claimDetails: {
          caseAmountToPay: '6789',
          caseCreationDate: '2018-11-22'
        }
      };

      let caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithDateAndMoney], formFieldsData);

      let caseFields1 = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithDateAndMoney], formFieldsData);

      expect(caseFields['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields['claimDetails']['caseAmountToPay']).toBe('£67.89');
      expect(caseFields1['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields1['claimDetails']['caseAmountToPay']).toBe('£67.89');
    });

    it('should merge complex field containing Date and Money two levels deep', () => {
      let formFieldsData = {
        someText: 'This is test.',
        details: {
          claimDetails: {
            caseAmountToPay: '6789',
            caseCreationDate: '2018-11-22'
          }
        }
      };

      let caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithAnotherComplexField], formFieldsData);

      expect(caseFields['details']['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields['details']['claimDetails']['caseAmountToPay']).toBe('£67.89');
    });
  });

  describe('mergeLabelCaseFieldsAndFormFields using data from caseFields value', () => {
    it('should merge simple Date field', () => {
      caseCreationDate.value = '1999-02-01';
      textField.value = 'This is test.';

      let caseFields = fieldUtils
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

      let caseFields = fieldUtils
        .mergeLabelCaseFieldsAndFormFields([textField, complexFieldWithAnotherComplexField], {});

      expect(caseFields['details']['claimDetails']['caseCreationDate']).toBe('22 Nov 2018');
      expect(caseFields['details']['claimDetails']['caseAmountToPay']).toBe('£67.89');
    });
  });
});
