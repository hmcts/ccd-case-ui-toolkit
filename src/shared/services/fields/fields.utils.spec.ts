import { CaseTab, CaseView } from '../../domain/case-view';
import { CaseField } from '../../domain/definition';
import { aCaseField } from '../../fixture/shared.test.fixture';
import { FieldsUtils } from './fields.utils';

describe('FieldsUtils', () => {
  const fieldUtils: FieldsUtils = new FieldsUtils();

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

  describe('mergeLabelCaseFieldsAndFormFields containing MultiSelectLists', () => {
    it('should set up -LABEL properties for multi-select values', () => {
      const MULTI_SELECT: CaseField = aCaseField('ms', 'MS', 'MultiSelectList', 'OPTIONAL', null);
      const ITEMS = [
        { code: 'arya', label: 'Arya Stark' },
        { code: 'bob', label: 'Robert Baratheon' },
        { code: 'cersei', label: 'Cersei Lannister' },
        { code: 'dani', label: 'Daenerys Targaryen' }
      ];
      MULTI_SELECT.field_type.fixed_list_items = ITEMS;
      MULTI_SELECT.value = [ ITEMS[1].code, ITEMS[2].code ];
      const FORM_FIELDS = {};

      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([ MULTI_SELECT ], FORM_FIELDS);
      expect(caseFields['ms']).toBeDefined();
      expect(caseFields['ms'].length).toBe(2);
      expect(caseFields['ms'][0]).toBe(ITEMS[1].code);
      expect(caseFields['ms'][1]).toBe(ITEMS[2].code);
      expect(caseFields[`ms${FieldsUtils.LABEL_SUFFIX}`]).toBeDefined();
      expect(caseFields[`ms${FieldsUtils.LABEL_SUFFIX}`].length).toBe(2);
      expect(caseFields[`ms${FieldsUtils.LABEL_SUFFIX}`][0]).toBe(ITEMS[1].label);
      expect(caseFields[`ms${FieldsUtils.LABEL_SUFFIX}`][1]).toBe(ITEMS[2].label);
    });

    it('should set up -LABEL properties for multi-select values within complex types', () => {
      const MULTI_SELECT: CaseField = aCaseField('ms', 'MS', 'MultiSelectList', 'OPTIONAL', null);
      const ITEMS = [
        { code: 'arya', label: 'Arya Stark' },
        { code: 'bob', label: 'Robert Baratheon' },
        { code: 'cersei', label: 'Cersei Lannister' },
        { code: 'dani', label: 'Daenerys Targaryen' }
      ];
      MULTI_SELECT.field_type.fixed_list_items = ITEMS;
      MULTI_SELECT.value = [ ITEMS[1].code, ITEMS[2].code ];
      const COMPLEX: CaseField = aCaseField('complex', 'Complex', 'Complex', 'COMPLEX', null);
      COMPLEX.field_type.complex_fields = [ MULTI_SELECT ];
      const FORM_FIELDS = {};

      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([ COMPLEX ], FORM_FIELDS);
      expect(caseFields['complex']).toBeDefined();
      expect(caseFields['complex']['ms']).toBeDefined();
      expect(caseFields['complex']['ms'].length).toBe(2);
      expect(caseFields['complex']['ms'][0]).toBe(ITEMS[1].code);
      expect(caseFields['complex']['ms'][1]).toBe(ITEMS[2].code);
      expect(caseFields['complex'][`ms${FieldsUtils.LABEL_SUFFIX}`]).toBeDefined();
      expect(caseFields['complex'][`ms${FieldsUtils.LABEL_SUFFIX}`].length).toBe(2);
      expect(caseFields['complex'][`ms${FieldsUtils.LABEL_SUFFIX}`][0]).toBe(ITEMS[1].label);
      expect(caseFields['complex'][`ms${FieldsUtils.LABEL_SUFFIX}`][1]).toBe(ITEMS[2].label);
    });

    it('should set up -LABEL properties for multi-select values within collections', () => {
      const MULTI_SELECT: CaseField = aCaseField('ms', 'MS', 'MultiSelectList', 'OPTIONAL', null);
      const ITEMS = [
        { code: 'arya', label: 'Arya Stark' },
        { code: 'bob', label: 'Robert Baratheon' },
        { code: 'cersei', label: 'Cersei Lannister' },
        { code: 'dani', label: 'Daenerys Targaryen' }
      ];
      MULTI_SELECT.field_type.fixed_list_items = ITEMS;
      MULTI_SELECT.value = [ ITEMS[1].code, ITEMS[2].code ];
      const COMPLEX: CaseField = aCaseField('complex', 'Complex', 'Complex', 'COMPLEX', null);
      COMPLEX.field_type.complex_fields = [ MULTI_SELECT ];
      const COLLECTION: CaseField = aCaseField('collection', 'Collection', 'Collection', 'OPTIONAL', null);
      COLLECTION.field_type.collection_field_type = COMPLEX.field_type;
      const FORM_FIELDS = {
        collection: [
          { id: '1', value: MULTI_SELECT.value }
        ]
      };

      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([ COLLECTION ], FORM_FIELDS);
      expect(caseFields['collection']).toBeDefined();
      expect(caseFields['collection'].length).toBe(1);
      const item = caseFields['collection'][0];
      expect(item['value']).toBeDefined();
      expect(item['value']['ms']).toBeDefined();
      expect(item['value']['ms'].length).toBe(2);
      expect(item['value']['ms'][0]).toBe(ITEMS[1].code);
      expect(item['value']['ms'][1]).toBe(ITEMS[2].code);
      expect(item['value'][`ms${FieldsUtils.LABEL_SUFFIX}`]).toBeDefined();
      expect(item['value'][`ms${FieldsUtils.LABEL_SUFFIX}`].length).toBe(2);
      expect(item['value'][`ms${FieldsUtils.LABEL_SUFFIX}`][0]).toBe(ITEMS[1].label);
      expect(item['value'][`ms${FieldsUtils.LABEL_SUFFIX}`][1]).toBe(ITEMS[2].label);
    });
  });
});
