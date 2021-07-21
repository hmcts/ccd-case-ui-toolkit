import { CaseField, FieldType } from '../../domain/definition';
import { FieldsUtils } from '../fields';
import { FieldTypeSanitiser } from './field-type-sanitiser';
import { FormValueService } from './form-value.service';

describe('FormValueService', () => {
  let formValueService: FormValueService;
  beforeEach(() => {
    formValueService = new FormValueService(new FieldTypeSanitiser());
  });

  it('should return null when given null', () => {
    const value = formValueService.sanitise(null);
    expect(value).toEqual(null);
  });

  it('should trim spaces from strings', () => {
    const value = formValueService.sanitise({
      'string1': '     x     ',
      'string2': '     y      '
    });
    expect(value).toEqual({
      'string1': 'x',
      'string2': 'y'
    } as object);
  });

  it('should trim spaces from strings recursively', () => {
    const value = formValueService.sanitise({
      'object': {
        'string1': '    x     '
      },
      'string2': '     y      '
    });

    expect(value).toEqual({
      'object': {
        'string1': 'x'
      },
      'string2': 'y'
    } as object);
  });

  it('should trim spaces from strings in collection', () => {
    const value = formValueService.sanitise({
      'collection': [
        {
          'value': '      x        '
        }
      ]
    });

    expect(value).toEqual({
      'collection': [
        {
          'value': 'x'
        }
      ]
    } as object);
  });

  it('should convert numbers to strings', () => {
    const value = formValueService.sanitise({
      'number': 42
    });

    expect(value).toEqual({
      'number': '42'
    } as object);
  });

  it('should fiter current page fields and process DynamicList values back to Json', () => {
    const formFields = { data: { dynamicList: 'L2', thatTimeOfTheDay: {} } };
    const caseField = new CaseField();
    const fieldType = new FieldType();
    fieldType.type = 'DynamicList';
    caseField.id = 'dynamicList';
    caseField.field_type = fieldType
    caseField.value = {
      value: { code: 'L1', label: 'List 1' },
      list_items: [{ code: 'L1', label: 'List 1' }, { code: 'L2', label: 'List 2' }]
    }
    const caseFields = [caseField];
    formValueService.sanitiseDynamicLists(caseFields, formFields);
    const actual = '{"value":{"code":"L2","label":"List 2"},"list_items":[{"code":"L1","label":"List 1"},{"code":"L2","label":"List 2"}]}';
    expect(JSON.stringify(formFields.data.dynamicList))
      .toEqual(actual);
  });

  describe('sanitise for Document fields', () => {
    it('should return null for the Document field if the data to be sanitised has document_url = null', () => {
      const data = {
        document1: {
          document_url: null,
          document_binary_url: 'http://document.binary',
          document_filename: 'doc.file'
        }
      };
      const actual = {
        document1: null
      }
      expect(formValueService.sanitise(data)).toEqual(actual);
    });

    it('should return null for the Document field if the data to be sanitised has document_binary_url = null', () => {
      const data = {
        document1: {
          document_url: 'http://document.url',
          document_binary_url: null,
          document_filename: 'doc.file'
        }
      };
      const actual = {
        document1: null
      }
      expect(formValueService.sanitise(data)).toEqual(actual);
    });

    it('should return null for the Document field if the data to be sanitised has document_filename = null', () => {
      const data = {
        document1: {
          document_url: 'http://document.url',
          document_binary_url: 'http://document.binary',
          document_filename: null
        }
      };
      const actual = {
        document1: null
      }
      expect(formValueService.sanitise(data)).toEqual(actual);
    });
  });

  describe('removeNullLabels', () => {
    it('should remove unnecessary fields', () => {
      const data = { fieldId: null, type: 'Label', label: 'Text Field 0' };
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'fieldId';
      fieldType.type = 'Label';
      caseField.id = 'fieldId';
      caseField.field_type = fieldType;
      caseField.value = { label: 'Text Field 0', default_value: 'test text' }
      const caseFields = [caseField];
      formValueService.removeNullLabels(data, caseFields);
      const actual = '{"type":"Label","label":"Text Field 0"}';
      expect(JSON.stringify(data)).toEqual(actual);
    })

  })

  describe('get field value', () => {
    describe('simple types', () => {
      it('should return value if form is a simple object', () => {
        const pageFormFields = { 'PersonFirstName': 'John' };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('John');
      });

      it('should return value if form is a simple object recursive', () => {
        const pageFormFields = { 'PersonFirstName': 'John' };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('John');
      });

      it('should return value if form is a collection with simple object referenced by exact key reference', () => {
        const pageFormFields = [{ 'value': { 'PersonFirstName': 'John' } }];
        const fieldIdToSubstitute = '0.value.PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('John');
      });

      it('should return value if form is a complex item with nonempty object', () => {
        const pageFormFields = { '_1': { 'field': 'value' }, '_2': 'two', '_3': 'three' };
        const fieldIdToSubstitute = '_1.field';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('value');
      });

      it('should return value if form is a complex item with nonempty object recursive', () => {
        const pageFormFields = { '_1': { 'field': 'value' }, '_2': 'two', '_3': 'three' };
        const fieldIdToSubstitute = '_1.field';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('value');
      });

      it('should retrieve undefined if form is a collection with one empty item', () => {
        const pageFormFields = [{}];
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return undefined if form is a simple item with no value ', () => {
        const pageFormFields = { 'PersonFirstName': null };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeNull();
      });

      it('should return empty value if form is a simple item with empty value', () => {
        const pageFormFields = { 'PersonFirstName': '' };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('');
      });

      it('should return empty object if form is a simple item with empty object value', () => {
        const pageFormFields = { 'PersonFirstName': {} };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toEqual({});
      });

      it('should return undefined referenced key is not in the form', () => {
        const pageFormFields = { '_1': 'one' };
        const fieldIdToSubstitute = '_2';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return label value if form is an object with a collection that is multivalue list', () => {
        const pageFormFields = { '_1_one': ['code1', 'code2'], '_1_one-LABEL': ['label1', 'label2'] };
        const fieldIdToSubstitute = '_1_one';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toEqual('label1, label2');
      });
    });

    describe('complex types', () => {

      it('should return leaf value', () => {
        const pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2', 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        const fieldIdToSubstitute = 'complex.nested3.doubleNested';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('double nested');
      });

      it('should return undefined if complex leaf value', () => {
        const pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2', 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        const fieldIdToSubstitute = 'complex.nested3';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return undefined if reference key has trailing delimiter', () => {
        const pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2'
            , 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        const fieldIdToSubstitute = 'complex.nested3.';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return undefined if reference key not matched', () => {
        const pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2'
            , 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        let fieldIdToSubstitute = 'complex.nested21';
        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
        fieldIdToSubstitute = 'complex.neste';
        actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

    });

    describe('complex of collection of complex types', () => {
      it('should return collection item by index', () => {
        const pageFormFields = {
          'topComplex': {
            'field': 'value',
            'collection': [
              { 'value': {
                'complex': { 'nested': 'nested value1', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested7' } } } }
              },
              { 'value': {
                'complex': { 'nested': 'nested value2', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested8' } } } }
              },
              { 'value': {
                'complex': { 'nested': 'nested value3', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested9' } } } }
              }
            ]
          }
        };
        const fieldIdToSubstitute = 'topComplex.collection.complex.nested2.doubleNested.trippleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBe('tripple nested8');
      });

      it('should return undefined if collection item absent for given index', () => {
        const pageFormFields = {
          'topComplex': {
            'field': 'value',
            'collection': [
              { 'value': {
                'complex': { 'nested': 'nested value1', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested7' } } } }
              },
              { 'value': {
                'complex': { 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested8' } } } }
              },
              { 'value': {
                'complex': { 'nested': 'nested value3', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested9' } } } }
              }
            ]
          }
        };
        const fieldIdToSubstitute = 'topComplex.collection.complex.nested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is complex leaf value', () => {
        const pageFormFields = {
          'topComplex': {
            'collection': [
              { 'value': {
                'complex': { 'nested': 'nested value1', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested7' } } } }
              },
              { 'value': {
                'complex': { 'nested': 'nested value2', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested8' } } } }
              },
              { 'value': {
                'complex': { 'nested': 'nested value3', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested9' } } } }
              }
            ]
          }
        };
        const fieldIdToSubstitute = 'topComplex.collection.complex.nested2.doubleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });
    });

    describe('collection types', () => {

      it('should return simple text collection item by index', () => {
        const pageFormFields = { '_1_one': [{ 'value': 'value1' }, { 'value': 'value2' }], '_3_three': 'simpleValue' };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('value1, value2');
      });

      it('should return simple number collection item by index', () => {
        const pageFormFields = { '_1_one': [{ 'value': 35 }, { 'value': 45 }], '_3_three': 'simpleValue' };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('35, 45');
      });

      it('should return undefined if collection item is complex leaf value', () => {
        const pageFormFields = {
          '_1_one': [{ 'value': { 'id': 'complex1' } }, { 'value': { 'id': 'complex2' } }],
          '_3_three': 'simpleValue'
        };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is another collection', () => {
        const pageFormFields = {
          '_1_one': [{ 'value': [{ 'value': { 'id': 'complex1' } }] }, { 'value': [{ 'value': { 'id': 'complex2' } }] }],
          '_3_three': 'simpleValue'
        };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });
    });

    describe('collection of complex types', () => {

      it('should return simple text collection item by index', () => {
        const pageFormFields = {
          'collection': [
            { 'value': {
              'complex': { 'nested': 'nested value1', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested7' } } } }
            },
            { 'value': {
              'complex': { 'nested': 'nested value2', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested8' } } } }
            },
            { 'value': {
              'complex': { 'nested': 'nested value3', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested9' } } } }
            }
          ]
        };
        const fieldIdToSubstitute = 'collection.complex.nested2.doubleNested.trippleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 2);

        expect(actual).toBe('tripple nested9');
      });

      it('should return undefined if collection item absent for given index', () => {
        const pageFormFields = {
          'collection': [
            { 'value': {
              'complex': { 'nested': 'nested value1', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested7' } } } }
            },
            { 'value': {
              'complex': { 'nested': 'nested value1' } }
            },
            { 'value': {
              'complex': { 'nested': 'nested value3', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested9' } } } }
            }
          ]
        };
        const fieldIdToSubstitute = 'collection.complex.nested2.doubleNested.trippleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is a complex leaf value', () => {
        const pageFormFields = {
          'collection': [
            { 'value': {
              'complex': { 'nested': 'nested value1', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested7' } } } }
            },
            { 'value': {
              'complex': { 'nested': 'nested value2', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested8' } } } }
            },
            { 'value': {
              'complex': { 'nested': 'nested value3', 'nested2': { 'doubleNested': { 'trippleNested': 'tripple nested9' } } } }
            }
          ]
        };
        const fieldIdToSubstitute = 'collection.complex.nested2.doubleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 2);

        expect(actual).toBeUndefined();
      });
    });
  });

  describe('removeEmptyCollectionsWithMinValidation', () => {
    it('should remove the collection field if empty, the FieldType is \"Collection\", with min attribute greater than zero', () => {
      const data = {collection1: []};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeEmptyCollectionsWithMinValidation(data, [caseField]);
      const actual = '{}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

    it('should not remove the collection field if not empty, the FieldType is \"Collection\", min attribute greater than zero', () => {
      const data = {collection1: ['Test']};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeEmptyCollectionsWithMinValidation(data, [caseField]);
      const actual = '{"collection1":[\"Test\"]}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

    it('should not remove the collection field if empty, the FieldType is \"Collection\", with no min attribute value', () => {
      const data = {collection1: []};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeEmptyCollectionsWithMinValidation(data, [caseField]);
      const actual = '{"collection1":[]}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

    it('should not remove the collection field if empty, the FieldType is not \"Collection\", min attribute greater than zero', () => {
      const data = {collection1: []};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'FixedList';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeEmptyCollectionsWithMinValidation(data, [caseField]);
      const actual = '{"collection1":[]}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

    it('should not remove the collection field if not an array, the FieldType is \"Collection\", min attribute greater than zero', () => {
      const data = {collection1: {}};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeEmptyCollectionsWithMinValidation(data, [caseField]);
      const actual = '{"collection1":{}}';
      expect(JSON.stringify(data)).toEqual(actual);
    });
  });

  describe('removeMultiSelectLabels', () => {
    it('should handle null data', () => {
      FormValueService.removeMultiSelectLabels(null);
      // Complete the test to confirm the line above didn't fall over.
      expect(true).toBeTruthy();
    });
    it('should handle undefined data', () => {
      FormValueService.removeMultiSelectLabels(undefined);
      // Complete the test to confirm the line above didn't fall over.
      expect(false).toBeFalsy();
    });
    it('should handle an empty object', () => {
      const DATA = {};
      FormValueService.removeMultiSelectLabels(DATA);
      expect(Object.keys(DATA).length).toEqual(0); // Nothing got added.
    });
    it('should handle when there are no labels to remove', () => {
      const DATA = {
        bob: []
      };
      FormValueService.removeMultiSelectLabels(DATA);
      expect(Object.keys(DATA).length).toEqual(1); // Nothing got added or removed.
    });
    it('should handle when there are labels to remove at the top level', () => {
      const LABEL_FIELD = `bob${FieldsUtils.LABEL_SUFFIX}`;
      const DATA = {
        bob: [],
        [LABEL_FIELD]: []
      };
      FormValueService.removeMultiSelectLabels(DATA);
      // Should have removed 'bob---LABEL' and left 'bob' alone.
      expect(Object.keys(DATA).length).toEqual(1);
      expect(DATA.bob).toBeDefined();
      expect(DATA[LABEL_FIELD]).toBeUndefined();
    });
    it('should handle when a label to remove has no corresponding MultiSelect', () => {
      const LABEL_FIELD = `bob${FieldsUtils.LABEL_SUFFIX}`;
      const DATA = {
        [LABEL_FIELD]: []
      };
      FormValueService.removeMultiSelectLabels(DATA);
      expect(Object.keys(DATA).length).toEqual(0); // Should have removed 'bob---LABEL'
    });
    it('should handle removal within a nested object', () => {
      const DATA = {
        a: {
          aUnrelated: 'A Unrelated',
          aa: [],
          [`aa${FieldsUtils.LABEL_SUFFIX}`]: []
        },
        b: {
          [`bb${FieldsUtils.LABEL_SUFFIX}`]: [],
          c: {
            cUnrelated: 'C Unrelated',
            [`cc${FieldsUtils.LABEL_SUFFIX}`]: []
          }
        }
      };
      FormValueService.removeMultiSelectLabels(DATA);
      expect(DATA.a).toBeDefined();
      expect(DATA.a.aUnrelated).toEqual('A Unrelated');
      expect(DATA.a.aa).toBeDefined();
      expect(DATA.a[`aa${FieldsUtils.LABEL_SUFFIX}`]).toBeUndefined();
      expect(DATA.b).toBeDefined();
      expect(DATA.b[`bb${FieldsUtils.LABEL_SUFFIX}`]).toBeUndefined();
      expect(DATA.b.c).toBeDefined();
      expect(DATA.b.c.cUnrelated).toEqual('C Unrelated');
      expect(DATA.b.c[`cc${FieldsUtils.LABEL_SUFFIX}`]).toBeUndefined();
    });
    it('should handle removal within a collection', () => {
      const DATA = {
        array: [
          {
            id: '1',
            data: {
              aUnrelated: 'A Unrelated',
              aa: [],
              [`aa${FieldsUtils.LABEL_SUFFIX}`]: []
            }
          },
          {
            id: '2',
            data: {
              b: {
                [`bb${FieldsUtils.LABEL_SUFFIX}`]: [],
                c: [
                  {
                    id: '3',
                    data: {
                      cUnrelated: 'C Unrelated',
                      [`cc${FieldsUtils.LABEL_SUFFIX}`]: []
                    }
                  }
                ]
              }
            }
          }
        ],
      };
      FormValueService.removeMultiSelectLabels(DATA);
      expect(DATA.array).toBeDefined();
      expect(DATA.array.length).toEqual(2);
      expect(DATA.array[0].id).toEqual('1');
      expect(DATA.array[0].data).toBeDefined();
      expect(DATA.array[0].data.aUnrelated).toEqual('A Unrelated');
      expect(DATA.array[0].data.aa).toBeDefined();
      expect(DATA.array[0].data[`aa${FieldsUtils.LABEL_SUFFIX}`]).toBeUndefined();

      expect(DATA.array[1].id).toEqual('2');
      expect(DATA.array[1].data).toBeDefined();
      expect(DATA.array[1].data.b).toBeDefined();
      expect(DATA.array[1].data.b[`bb${FieldsUtils.LABEL_SUFFIX}`]).toBeUndefined();
      expect(DATA.array[1].data.b.c).toBeDefined();
      expect(DATA.array[1].data.b.c.length).toEqual(1);
      expect(DATA.array[1].data.b.c[0].id).toEqual('3');
      expect(DATA.array[1].data.b.c[0].data.cUnrelated).toEqual('C Unrelated');
      expect(DATA.array[1].data.b.c[0].data[`cc${FieldsUtils.LABEL_SUFFIX}`]).toBeUndefined();
    });
  });
});
