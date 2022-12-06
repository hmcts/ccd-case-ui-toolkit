import { CaseTab, CaseView } from '../../domain/case-view';
import { CaseField, FieldType } from '../../domain/definition';
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

    it('should handle numeric zero in MoneyGBP field', () => {
      const data = { someText: 'Test', caseAmountToPay: 0 };
      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], data);
      expect(caseFields['caseAmountToPay']).toBeUndefined();
    });

    it('should handle invalid value in MoneyGBP field', () => {
      const data = { someText: 'Test', caseAmountToPay: 'bob' };
      const caseFields = fieldUtils.mergeLabelCaseFieldsAndFormFields([textField, caseAmountToPay], data);
      expect(caseFields['caseAmountToPay']).toBeNull();
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
    const ITEMS = [
      { code: 'arya', label: 'Arya Stark' },
      { code: 'bob', label: 'Robert Baratheon' },
      { code: 'cersei', label: 'Cersei Lannister' },
      { code: 'dani', label: 'Daenerys Targaryen' }
    ];
    const addItems = (field: CaseField): CaseField => {
      field.field_type.fixed_list_items = ITEMS;
      field.value = [ ITEMS[1].code, ITEMS[2].code ];
      return field;
    };
    const getComplex = (multiSelect: CaseField): CaseField => {
      const complex: CaseField = aCaseField('complex', 'Complex', 'Complex', 'COMPLEX', null);
      complex.field_type.complex_fields = [ multiSelect ];
      return complex;
    };
    it(`should set up ${FieldsUtils.LABEL_SUFFIX} properties for multi-select values`, () => {
      const MULTI_SELECT: CaseField = addItems(aCaseField('ms', 'MS', 'MultiSelectList', 'OPTIONAL', null));
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

    it(`should set up ${FieldsUtils.LABEL_SUFFIX} properties for multi-select values within complex types`, () => {
      const MULTI_SELECT: CaseField = addItems(aCaseField('ms', 'MS', 'MultiSelectList', 'OPTIONAL', null));
      const COMPLEX: CaseField = getComplex(MULTI_SELECT);
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

    it(`should set up ${FieldsUtils.LABEL_SUFFIX} properties for multi-select values within collections`, () => {
      const MULTI_SELECT: CaseField = addItems(aCaseField('ms', 'MS', 'MultiSelectList', 'OPTIONAL', null));
      const COMPLEX: CaseField = getComplex(MULTI_SELECT);
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

  describe('setDynamicListDefinition()', () => {

    it('should set data for dynamic lists', () => {

      const callbackResponse = {
            field_type: {
              complex_fields: [
                {
                  field_type: {
                    type: 'DynamicList'
                  },
                  id: 'complex_dl',
                  value: {},
                  formatted_value: {}
                }
              ],
              type: 'Complex'
            },
            value: {
              complex_dl: {
                list_items: [
                  {code: '1', value: '1'},
                  {code: '2', value: '2'}
                ],
                value: {code: '2', value: '2'}
              }
            }
      };

      (FieldsUtils as any).setDynamicListDefinition(callbackResponse, callbackResponse.field_type, callbackResponse);

      const expected = {
            field_type: {
              complex_fields: [
                {
                  field_type: {
                    type: 'DynamicList'
                  },
                  id: 'complex_dl',
                  value: {
                    list_items: [
                      {code: '1', value: '1'},
                      {code: '2', value: '2'}
                    ],
                    value: [{code: '2', value: '2'}]
                  },
                  formatted_value: {
                    list_items: [
                      {code: '1', value: '1'},
                      {code: '2', value: '2'}
                    ],
                    value: [{code: '2', value: '2'}]
                  }
                }
              ],
              type: 'Complex'
            },
            value: {
              complex_dl: {
                list_items: [
                  {code: '1', value: '1'},
                  {code: '2', value: '2'}
                ],
                value: {code: '2', value: '2'}
              }
            }
      };

      expect(callbackResponse).toEqual(expected);
    });
  });

  describe('isFlagsCaseField() function test', () => {
    it('should return false if case field is null', () => {
      expect(FieldsUtils.isFlagsCaseField(null)).toBe(false);
    });

    it('should return false if field type ID is not "Flags"', () => {
      const caseField = aCaseField('flags', 'flags', 'Complex', 'OPTIONAL', null, [], false, true);
      expect(FieldsUtils.isFlagsCaseField(caseField)).toBe(false);
    });

    it('should return false if field type ID is "Flags" but field type is not Complex', () => {
      const caseField = aCaseField('flags', 'flags', 'Flags', 'OPTIONAL', null, null, false, true);
      expect(FieldsUtils.isFlagsCaseField(caseField)).toBe(false);
    });

    it('should return true if field type ID is "Flags" and field type is Complex', () => {
      const caseField = aCaseField('flags', 'flags', 'Complex', 'OPTIONAL', null, [], false, true);
      caseField.field_type.id = 'Flags';
      expect(FieldsUtils.isFlagsCaseField(caseField)).toBe(true);
    });
  });

  describe('isFlagLauncherCaseField() function test', () => {
    it('should return false if case field is null', () => {
      expect(FieldsUtils.isFlagLauncherCaseField(null)).toBe(false);
    });

    it('should return false if case field is not of type FlagLauncher', () => {
      const caseField = aCaseField('flagLauncher', 'flagLauncher', 'Complex', 'OPTIONAL', null, [], false, true);
      expect(FieldsUtils.isFlagLauncherCaseField(caseField)).toBe(false);
    });

    it('should return true if case field is of type FlagLauncher', () => {
      const caseField = aCaseField('flagLauncher', 'flagLauncher', 'FlagLauncher', 'OPTIONAL', null, null, false, true);
      expect(FieldsUtils.isFlagLauncherCaseField(caseField)).toBe(true);
    });
  });

  describe('isFlagsFieldType() function test', () => {
    it('should return false if field type is null', () => {
      expect(FieldsUtils.isFlagsFieldType(null)).toBe(false);
    });

    it('should return false if field type ID is not "Flags"', () => {
      const fieldType = {
        id: 'flags',
        type: 'Complex'
      } as FieldType;
      expect(FieldsUtils.isFlagsFieldType(fieldType)).toBe(false);
    });

    it('should return false if field type ID is "Flags" but field type is not Complex', () => {
      const fieldType = {
        id: 'Flags',
        type: 'Flags'
      } as FieldType;
      expect(FieldsUtils.isFlagsFieldType(fieldType)).toBe(false);
    });

    it('should return true if field type ID is "Flags" and field type is Complex', () => {
      const fieldType = {
        id: 'Flags',
        type: 'Complex'
      } as FieldType;
      expect(FieldsUtils.isFlagsFieldType(fieldType)).toBe(true);
    });
  });

  describe('extractFlagsDataFromCaseField() function test', () => {
    it('should extract flags data from a root-level Flags case field', () => {
      const caseField = {
        id: 'party1Flags',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        value: {
          partyName: 'Party 1',
          roleOnCase: null,
          details: []
        }
      } as CaseField;
      expect(FieldsUtils.extractFlagsDataFromCaseField([], caseField, caseField.id, caseField)).toEqual([
        {
          caseField,
          pathToFlagsFormGroup: caseField.id,
          flags: {
            flagsCaseFieldId: caseField.id,
            partyName: 'Party 1',
            roleOnCase: null,
            details: null
          }
        }
      ]);
    });

    it('should not fail if the root-level Flags case field is the special "caseFlags" field and its value is an empty object', () => {
      const caseField = {
        id: 'caseFlags',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        value: {}
      } as CaseField;
      expect(FieldsUtils.extractFlagsDataFromCaseField([], caseField, caseField.id, caseField)).toEqual([
        {
          caseField,
          pathToFlagsFormGroup: caseField.id,
          flags: {
            flagsCaseFieldId: caseField.id,
            partyName: undefined,
            roleOnCase: undefined,
            details: null
          }
        }
      ]);
    });

    it('should not fail if the root-level Flags case field is the special "caseFlags" field and its value is null', () => {
      const caseField = {
        id: 'caseFlags',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        value: null
      } as CaseField;
      expect(FieldsUtils.extractFlagsDataFromCaseField([], caseField, caseField.id, caseField)).toEqual([
        {
          caseField,
          pathToFlagsFormGroup: caseField.id,
          flags: {
            flagsCaseFieldId: caseField.id,
            partyName: null,
            roleOnCase: null,
            details: null
          }
        }
      ]);
    });

    it('should not fail if the root-level Flags case field is the special "caseFlags" field and its value is undefined', () => {
      const caseField = {
        id: 'caseFlags',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType
      } as CaseField;
      expect(FieldsUtils.extractFlagsDataFromCaseField([], caseField, caseField.id, caseField)).toEqual([
        {
          caseField,
          pathToFlagsFormGroup: caseField.id,
          flags: {
            flagsCaseFieldId: caseField.id,
            partyName: null,
            roleOnCase: null,
            details: null
          }
        }
      ]);
    });
  });
});
