import { FlagDetail, FlagsWithFormGroupPath } from '../../components';
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
      string1: '     x     ',
      string2: '     y      '
    });
    expect(value).toEqual({
      string1: 'x',
      string2: 'y'
    } as object);
  });

  it('should trim spaces from strings recursively', () => {
    const value = formValueService.sanitise({
      object: {
        string1: '    x     '
      },
      string2: '     y      '
    });

    expect(value).toEqual({
      object: {
        string1: 'x'
      },
      string2: 'y'
    } as object);
  });

  it('should trim spaces from strings in collection', () => {
    const value = formValueService.sanitise({
      collection: [
        {
          value: '      x        '
        }
      ]
    });

    expect(value).toEqual({
      collection: [
        {
          value: 'x'
        }
      ]
    } as object);
  });

  it('should convert numbers to strings', () => {
    const value = formValueService.sanitise({
      number: 42
    });

    expect(value).toEqual({
      number: '42'
    } as object);
  });

  it('should filter current page fields and process DynamicList values back to JSON', () => {
    const formFields = { data: { dynamicList: 'L2', thatTimeOfTheDay: {} } };
    const caseField = new CaseField();
    const fieldType = new FieldType();
    fieldType.type = 'DynamicList';
    caseField.id = 'dynamicList';
    caseField.field_type = fieldType;
    caseField.value = {
      value: { code: 'L1', label: 'List 1' },
      list_items: [{ code: 'L1', label: 'List 1' }, { code: 'L2', label: 'List 2' }]
    };
    const caseFields = [caseField];
    formValueService.sanitiseDynamicLists(caseFields, formFields);
    const actual = '{"value":{"code":"L2","label":"List 2"},"list_items":[{"code":"L1","label":"List 1"},{"code":"L2","label":"List 2"}]}';
    expect(JSON.stringify(formFields.data.dynamicList))
      .toEqual(actual);
  });

  it('should sanitise case reference', () => {
    expect(formValueService.sanitiseCaseReference('1111-2222-3333-4444')).toEqual('1111222233334444');
    expect(formValueService.sanitiseCaseReference('Invalid CaseReference')).toEqual('');
  });

  it('should populate flag details from case fields', () => {
    const flagsData = [
      {
        flags: {
          partyName: 'Rose Bank',
          details: [
            {
              id: '1234',
              name: 'Flag 1',
              flagComment: 'First flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active'
            },
            {
              id: '2345',
              name: 'Flag 2',
              flagComment: 'Rose\'s second flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL2',
              status: 'Inactive'
            }
          ] as FlagDetail[],
          flagsCaseFieldId: 'CaseFlag1'
        },
        pathToFlagsFormGroup: '',
        caseField: {
          id: 'CaseFlag1',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          }
        } as CaseField
      },
      {
        flags: {
          partyName: 'Tom Atin',
          details: [
            {
              id: '3456',
              name: 'Flag 3',
              flagComment: 'First flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active'
            }
          ] as FlagDetail[],
          flagsCaseFieldId: 'CaseFlag2'
        },
        pathToFlagsFormGroup: '',
        caseField: {
          id: 'CaseFlag2',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          }
        } as CaseField
      },
      {
        flags: {
          partyName: '',
          details: [
            {
              id: '4567',
              name: 'Flag 4',
              flagComment: 'Fourth flag',
              dateTimeCreated: new Date(),
              path: [
                { id: null, value: 'Level 1' },
                { id: null, value: 'Level 2' }
              ],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active'
            }
          ] as FlagDetail[],
          flagsCaseFieldId: 'CaseFlag3'
        },
        pathToFlagsFormGroup: 'caseFlags',
        caseField: {
          id: 'CaseFlag3',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          }
        } as CaseField
      },
      {
        flags: {
          partyName: '',
          details: [
            {
              id: '5678',
              name: 'Flag 5',
              flagComment: 'Fifth flag',
              dateTimeCreated: new Date(),
              path: [
                { id: null, value: 'Level 1' }
              ],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active',
              subTypeKey: 'Dummy subtype key',
              subTypeValue: 'Dummy subtype value'
            }
          ] as FlagDetail[],
          flagsCaseFieldId: 'CaseFlag3'
        },
        pathToFlagsFormGroup: 'caseFlags',
        caseField: {
          id: 'CaseFlag3',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          }
        } as CaseField
      }
    ] as FlagsWithFormGroupPath[];
    const caseField = [
      {
        id: 'CaseFlag1',
        field_type: {
          id: 'Flags',
          type: 'Flags'
        },
        value: []
      },
      {
        id: 'CaseFlag2',
        field_type: {
          id: 'Flags',
          type: 'Flags'
        },
        value: []
      }
    ] as CaseField[];
    spyOn(FieldsUtils, 'isFlagLauncherCaseField').and.returnValue(true);
    expect(formValueService.repopulateFormDataFromCaseFieldValues(flagsData, caseField)).not.toBeDefined();
  });

  describe('component launcher linked cases', () => {
    const data = [
      {
        id: 'caseLinks'
      },
      {
        id: 'ComponentLauncher'
      }
    ];
    const caseFields = [
      {
        id: 'caseLinks',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: []
      },
      {
        id: 'ComponentLauncher',
        field_type: {
          id: 'ComponentLauncher',
          type: 'ComponentLauncher'
        },
        value: []
      }
    ] as CaseField[];

    it('should remove component launcher field', () => {
      spyOn(FieldsUtils, 'isComponentLauncherCaseField').and.returnValue(true);
      expect(formValueService.removeCaseFieldsOfType(data, caseFields, ['ComponentLauncher'])).not.toBeDefined();
    });

    it('should populate linked cases details from case fields', () => {
      spyOn(FieldsUtils, 'isComponentLauncherCaseField').and.returnValue(true);
      expect(formValueService.populateLinkedCasesDetailsFromCaseFields(data, caseFields)).not.toBeDefined();
    });
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
      };
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
      };
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
      };
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
      caseField.value = { label: 'Text Field 0', default_value: 'test text' };
      const caseFields = [caseField];
      formValueService.removeNullLabels(data, caseFields);
      const actual = '{"type":"Label","label":"Text Field 0"}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

  });

  describe('get field value', () => {
    describe('simple types', () => {
      it('should return value if form is a simple object', () => {
        const pageFormFields = { PersonFirstName: 'John' };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('John');
      });

      it('should return value if form is a simple object recursive', () => {
        const pageFormFields = { PersonFirstName: 'John' };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('John');
      });

      it('should return value if form is a collection with simple object referenced by exact key reference', () => {
        const pageFormFields = [{ value: { PersonFirstName: 'John' } }];
        const fieldIdToSubstitute = '0.value.PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('John');
      });

      it('should return value if form is a complex item with nonempty object', () => {
        const pageFormFields = { _1: { field: 'value' }, _2: 'two', _3: 'three' };
        const fieldIdToSubstitute = '_1.field';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('value');
      });

      it('should return value if form is a complex item with nonempty object recursive', () => {
        const pageFormFields = { _1: { field: 'value' }, _2: 'two', _3: 'three' };
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
        const pageFormFields = { PersonFirstName: null };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeNull();
      });

      it('should return empty value if form is a simple item with empty value', () => {
        const pageFormFields = { PersonFirstName: '' };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('');
      });

      it('should return empty object if form is a simple item with empty object value', () => {
        const pageFormFields = { PersonFirstName: {} };
        const fieldIdToSubstitute = 'PersonFirstName';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toEqual({});
      });

      it('should return undefined referenced key is not in the form', () => {
        const pageFormFields = { _1: 'one' };
        const fieldIdToSubstitute = '_2';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return label value if form is an object with a collection that is multivalue list', () => {
        const pageFormFields = { _1_one: ['code1', 'code2'], '_1_one---LABEL': ['label1', 'label2'] };
        const fieldIdToSubstitute = '_1_one';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toEqual('label1, label2');
      });
    });

    describe('complex types', () => {

      it('should return leaf value', () => {
        const pageFormFields = {
          complex: {
            nested: 'nested value', nested2: 'nested value2', nested3: { doubleNested: 'double nested' }
          }
        };
        const fieldIdToSubstitute = 'complex.nested3.doubleNested';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBe('double nested');
      });

      it('should return undefined if complex leaf value', () => {
        const pageFormFields = {
          complex: {
            nested: 'nested value', nested2: 'nested value2', nested3: { doubleNested: 'double nested' }
          }
        };
        const fieldIdToSubstitute = 'complex.nested3';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return undefined if reference key has trailing delimiter', () => {
        const pageFormFields = {
          complex: {
            nested: 'nested value', nested2: 'nested value2'
            , nested3: { doubleNested: 'double nested' }
          }
        };
        const fieldIdToSubstitute = 'complex.nested3.';
        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);
        expect(actual).toBeUndefined();
      });

      it('should return undefined if reference key not matched', () => {
        const pageFormFields = {
          complex: {
            nested: 'nested value', nested2: 'nested value2'
            , nested3: { doubleNested: 'double nested' }
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
          topComplex: {
            field: 'value',
            collection: [
              { value: {
                complex: { nested: 'nested value1', nested2: { doubleNested: { trippleNested: 'tripple nested7' } } } }
              },
              { value: {
                complex: { nested: 'nested value2', nested2: { doubleNested: { trippleNested: 'tripple nested8' } } } }
              },
              { value: {
                complex: { nested: 'nested value3', nested2: { doubleNested: { trippleNested: 'tripple nested9' } } } }
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
          topComplex: {
            field: 'value',
            collection: [
              { value: {
                complex: { nested: 'nested value1', nested2: { doubleNested: { trippleNested: 'tripple nested7' } } } }
              },
              { value: {
                complex: { nested2: { doubleNested: { trippleNested: 'tripple nested8' } } } }
              },
              { value: {
                complex: { nested: 'nested value3', nested2: { doubleNested: { trippleNested: 'tripple nested9' } } } }
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
          topComplex: {
            collection: [
              { value: {
                complex: { nested: 'nested value1', nested2: { doubleNested: { trippleNested: 'tripple nested7' } } } }
              },
              { value: {
                complex: { nested: 'nested value2', nested2: { doubleNested: { trippleNested: 'tripple nested8' } } } }
              },
              { value: {
                complex: { nested: 'nested value3', nested2: { doubleNested: { trippleNested: 'tripple nested9' } } } }
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
        const pageFormFields = { _1_one: [{ value: 'value1' }, { value: 'value2' }], _3_three: 'simpleValue' };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('value1, value2');
      });

      it('should return simple number collection item by index', () => {
        const pageFormFields = { _1_one: [{ value: 35 }, { value: 45 }], _3_three: 'simpleValue' };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('35, 45');
      });

      it('should return undefined if collection item is complex leaf value', () => {
        const pageFormFields = {
          _1_one: [{ value: { id: 'complex1' } }, { value: { id: 'complex2' } }],
          _3_three: 'simpleValue'
        };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is another collection', () => {
        const pageFormFields = {
          _1_one: [{ value: [{ value: { id: 'complex1' } }] }, { value: [{ value: { id: 'complex2' } }] }],
          _3_three: 'simpleValue'
        };
        const fieldIdToSubstitute = '_1_one';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });
    });

    describe('collection of complex types', () => {

      it('should return simple text collection item by index', () => {
        const pageFormFields = {
          collection: [
            { value: {
              complex: { nested: 'nested value1', nested2: { doubleNested: { trippleNested: 'tripple nested7' } } } }
            },
            { value: {
              complex: { nested: 'nested value2', nested2: { doubleNested: { trippleNested: 'tripple nested8' } } } }
            },
            { value: {
              complex: { nested: 'nested value3', nested2: { doubleNested: { trippleNested: 'tripple nested9' } } } }
            }
          ]
        };
        const fieldIdToSubstitute = 'collection.complex.nested2.doubleNested.trippleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 2);

        expect(actual).toBe('tripple nested9');
      });

      it('should return undefined if collection item absent for given index', () => {
        const pageFormFields = {
          collection: [
            { value: {
              complex: { nested: 'nested value1', nested2: { doubleNested: { trippleNested: 'tripple nested7' } } } }
            },
            { value: {
              complex: { nested: 'nested value1' } }
            },
            { value: {
              complex: { nested: 'nested value3', nested2: { doubleNested: { trippleNested: 'tripple nested9' } } } }
            }
          ]
        };
        const fieldIdToSubstitute = 'collection.complex.nested2.doubleNested.trippleNested';

        const actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is a complex leaf value', () => {
        const pageFormFields = {
          collection: [
            { value: {
              complex: { nested: 'nested value1', nested2: { doubleNested: { trippleNested: 'tripple nested7' } } } }
            },
            { value: {
              complex: { nested: 'nested value2', nested2: { doubleNested: { trippleNested: 'tripple nested8' } } } }
            },
            { value: {
              complex: { nested: 'nested value3', nested2: { doubleNested: { trippleNested: 'tripple nested9' } } } }
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

  describe('removeUnnecessaryFields', () => {
    it('should empty the collection field if it contains only id', () => {
      const data = {collection1: [{id: '123'}]};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Complex';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';

      formValueService.removeUnnecessaryFields(data, [caseField]);
      const actual = {collection1: [{id: '123'}]};
      expect(JSON.stringify(data)).toEqual(JSON.stringify(actual));
    });
    it('should keep the field if it contains only id', () => {
      const data = {
        applicationType :  'jointApplication',
        typeOfDocumentAttached : 'D10'
      };
      const caseField1 = new CaseField();
      const fieldType1 = new FieldType();
      fieldType1.id = 'FixedRadioList-ApplicationType';
      fieldType1.min = null;
      fieldType1.type = 'FixedRadioList';
      caseField1.field_type = fieldType1;
      caseField1.id = 'applicationType';
      caseField1.hidden = true;
      caseField1.display_context = 'MANDATORY';
      caseField1.retain_hidden_value = null;

      const caseField2 = new CaseField();
      const fieldType2 = new FieldType();
      fieldType2.id = 'FixedRadioList-OfflineDocumentReceived';
      fieldType2.min = null;
      fieldType2.type = 'FixedRadioList';
      caseField2.field_type = fieldType2;
      caseField2.id = 'typeOfDocumentAttached';
      caseField2.hidden = false;
      caseField2.display_context = 'MANDATORY';
      caseField2.retain_hidden_value = false;

      formValueService.removeUnnecessaryFields(data, [caseField1, caseField2]);
      const actual = {
        typeOfDocumentAttached : 'D10'
      };
      expect(JSON.stringify(data)).toEqual(JSON.stringify(actual));
    });
  });
  describe('removeInvalidCollectionData', () => {
    it('should empty the collection field if it contains only id', () => {
      const data = {collection1: [{id: '123'}]};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeInvalidCollectionData(data, caseField);
      const actual = '{"collection1":[]}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

    it('should not alter the collection field if it contains valid data', () => {
      const data = {collection1: [{id: '123', value: 'test'}]};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeInvalidCollectionData(data, caseField);
      const actual = '{"collection1":[{"id":"123","value":"test"}]}';
      expect(JSON.stringify(data)).toEqual(actual);
    });

    it('should empty the collection field if it contains id as null', () => {
      const data = {collection1: [{id: null}], collection2: [{id: '123'}]};
      const caseField = new CaseField();
      const fieldType = new FieldType();
      fieldType.id = 'collection1_1';
      fieldType.min = 1;
      fieldType.type = 'Collection';
      caseField.field_type = fieldType;
      caseField.id = 'collection1';
      formValueService.removeInvalidCollectionData(data, caseField);
      const actual = '{"collection1":[],"collection2":[{"id":"123"}]}';
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

  describe('removeCaseFieldsOfType', () => {
    it('should remove case fields from the data', () => {
      const data = {
        flagLauncher1: {},
        flagLauncher2: {},
        componentLauncher1: {},
        componentLauncher2: {},
        textField1: {}
      };
      const caseFields = [
        {
          id: 'flagLauncher1',
          field_type: {
            id: 'FlagLauncher',
            type: 'FlagLauncher'
          } as FieldType
        },
        {
          id: 'flagLauncher2',
          field_type: {
            id: 'FlagLauncher',
            type: 'FlagLauncher'
          } as FieldType
        },
        {
          id: 'componentLauncher1',
          field_type: {
            id: 'ComponentLauncher',
            type: 'ComponentLauncher'
          } as FieldType
        },
        {
          id: 'componentLauncher2',
          field_type: {
            id: 'ComponentLauncher',
            type: 'ComponentLauncher'
          } as FieldType
        },
        {
          id: 'textField1',
          field_type: {
            id: 'Text',
            type: 'Text'
          } as FieldType
        },
      ] as CaseField[];
      formValueService.removeCaseFieldsOfType(data, caseFields, ['ComponentLauncher', 'FlagLauncher']);
      expect(Object.keys(data)).toEqual(['textField1']);
    });
  });

  describe('repopulateFormDataFromCaseFieldValues', () => {
    it('should re-populate the data object containing the form data correctly', () => {
      const data = {
        letters: {
          a: 'A',
          b: 'B',
          c: 'C'
        },
        numbers: {
          one: '1',
          two: '2',
          three: '3'
        },
        currency: null
      };
      const caseFields = [
        {
          id: 'letters',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          } as FieldType,
          value: {
            a: 'Aa',
            b: 'Bb',
            d: 'Dd'
          }
        } as CaseField,
        {
          id: 'numbers',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          } as FieldType,
          value: null
        } as CaseField,
        {
          id: 'punctuation',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          } as FieldType,
          value: {
            comma: ',',
            hyphen: '-'
          }
        } as CaseField,
        {
          id: 'currency',
          field_type: {
            id: 'Flags',
            type: 'Flags'
          } as FieldType,
          value: {
            dollar: '$'
          }
        } as CaseField,
        {
          id: 'flagLauncher1',
          field_type: {
            id: 'FlagLauncher',
            type: 'FlagLauncher'
          } as FieldType,
          value: null
        } as CaseField
      ];
      formValueService.repopulateFormDataFromCaseFieldValues(data, caseFields);
      expect(data.letters).toEqual({
        a: 'Aa',
        b: 'Bb',
        c: 'C'
      });
      expect(data.numbers).toEqual({
        one: '1',
        two: '2',
        three: '3'
      });
      expect(data.hasOwnProperty('punctuation')).toBe(false);
      expect(data.currency).toEqual({
        dollar: '$'
      });
    });

    describe('removeHiddenField', () => {
      let formControls: any;
      let caseFields: CaseField[];
      let data: any;

      beforeEach(() => {
        formControls = {};
        caseFields = [];
        data = {};
      });

      it('should set field to null if hidden and not retain_hidden_value', () => {
        data = { field1: 'value1', field2: 'value2' };
        caseFields = [
          { id: 'field1', display_context: 'MANDATORY', hidden: false, retain_hidden_value: false, field_type: { type: 'Text' } } as any,
          { id: 'field2', display_context: 'MANDATORY', hidden: false, retain_hidden_value: false, field_type: { type: 'Text' } } as any
        ];
        formControls = {
          field1: { caseField: { hidden: true } },
          field2: { caseField: { hidden: false } }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.field1).toBeNull();
        expect(data.field2).toBe('value2');
      });

      it('should not set field to null if retain_hidden_value is true', () => {
        data = { field1: 'value1' };
        caseFields = [
          { id: 'field1', display_context: 'MANDATORY', hidden: false, retain_hidden_value: true, field_type: { type: 'Text' } } as any
        ];
        formControls = {
          field1: { caseField: { hidden: true } }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.field1).toBe('value1');
      });

      it('should not touch readonly fields', () => {
        spyOn(FormValueService as any, 'isReadOnly').and.returnValue(true);
        data = { field1: 'value1' };
        caseFields = [
          { id: 'field1', display_context: 'READONLY', hidden: false, field_type: { type: 'Text' } } as any
        ];
        formControls = {
          field1: { caseField: { hidden: true } }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.field1).toBe('value1');
      });

      it('should skip if formControls[field.id] is undefined', () => {
        data = { field1: 'value1' };
        caseFields = [
          { id: 'field1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } } as any
        ];
        formControls = {};
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.field1).toBe('value1');
      });

      it('should skip if field is hidden', () => {
        data = { field1: 'value1' };
        caseFields = [
          { id: 'field1', display_context: 'MANDATORY', hidden: true, field_type: { type: 'Text' } } as any
        ];
        formControls = {
          field1: { caseField: { hidden: true } }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.field1).toBe('value1');
      });

      it('should recurse into complex fields', () => {
        data = {
          complex1: {
            sub1: 'val1',
            sub2: 'val2'
          }
        };
        caseFields = [
          {
            id: 'complex1',
            display_context: 'MANDATORY',
            hidden: false,
            field_type: {
              type: 'Complex',
              complex_fields: [
                { id: 'sub1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } },
                { id: 'sub2', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } }
              ]
            }
          } as any
        ];
        formControls = {
          complex1: {
            caseField: { hidden: false },
            controls: {
              sub1: { caseField: { hidden: true } },
              sub2: { caseField: { hidden: false } }
            }
          }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.complex1.sub1).toBeNull();
        expect(data.complex1.sub2).toBe('val2');
      });

      it('should recurse into collection of complex fields', () => {
        data = {
          collection1: [
            { value: { sub1: 'a', sub2: 'b' } },
            { value: { sub1: 'c', sub2: 'd' } }
          ]
        };
        caseFields = [
          {
            id: 'collection1',
            display_context: 'MANDATORY',
            hidden: false,
            field_type: {
              type: 'Collection',
              collection_field_type: {
                type: 'Complex',
                complex_fields: [
                  { id: 'sub1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } },
                  { id: 'sub2', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } }
                ]
              }
            }
          } as any
        ];
        formControls = {
          collection1: {
            caseField: { hidden: false },
            controls: [
              {
                controls: {
                  value: {
                    caseField: {
                      field_type: {
                        complex_fields: [
                          { id: 'sub1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } },
                          { id: 'sub2', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } }
                        ]
                      }
                    },
                    controls: {
                      sub1: { caseField: { hidden: true } },
                      sub2: { caseField: { hidden: false } }
                    }
                  }
                }
              },
              {
                controls: {
                  value: {
                    caseField: {
                      field_type: {
                        complex_fields: [
                          { id: 'sub1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } },
                          { id: 'sub2', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } }
                        ]
                      }
                    },
                    controls: {
                      sub1: { caseField: { hidden: false } },
                      sub2: { caseField: { hidden: true } }
                    }
                  }
                }
              }
            ]
          }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.collection1[0].value.sub1).toBeNull();
        expect(data.collection1[0].value.sub2).toBe('b');
        expect(data.collection1[1].value.sub1).toBe('c');
        expect(data.collection1[1].value.sub2).toBeNull();
      });

      it('should do nothing if clearNonCase is false', () => {
        data = { field1: 'value1' };
        caseFields = [
          { id: 'field1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } } as any
        ];
        formControls = {
          field1: { caseField: { hidden: true } }
        };
        formValueService.removeHiddenField(data, caseFields, false, formControls);
        expect(data.field1).toBe('value1');
      });

      it('should skip if data is null', () => {
        data = null;
        caseFields = [
          { id: 'field1', display_context: 'MANDATORY', hidden: false, field_type: { type: 'Text' } } as any
        ];
        formControls = {
          field1: { caseField: { hidden: true } }
        };
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data).toBeNull();
      });

      it('should skip if caseFields is empty', () => {
        data = { field1: 'value1' };
        caseFields = [];
        formControls = {};
        formValueService.removeHiddenField(data, caseFields, true, formControls);
        expect(data.field1).toBe('value1');
      });
    });
  });
});