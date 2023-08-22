import { FormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { CaseField, FieldType, FixedListItem } from '../../domain';
import { aCaseField, createCaseField, createMultiSelectListFieldType } from '../../fixture/shared.test.fixture';
import { FieldsPurger } from './fields.purger';
import { FieldsUtils } from './fields.utils';

describe('deleteFieldValue() tests', () => {
  const fieldsPurger = new FieldsPurger(new FieldsUtils());

  const ADDRESS_DETAILS_FIELD_TYPE: FieldType = {
    id: 'AddressDetails',
    type: 'Complex',
    complex_fields: [
      {
        id: 'AddressLine1',
        label: 'Address line 1',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        display_context: 'READONLY'
      } as CaseField,
      {
        id: 'Postcode',
        label: 'Postcode',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        display_context: 'READONLY',
        retain_hidden_value: true
      } as CaseField
    ]
  };

  const ADDRESS_FIELD_COMPLEX: CaseField = ({
    id: 'Address',
    label: 'Address',
    field_type: ADDRESS_DETAILS_FIELD_TYPE,
    display_context: 'READONLY'
  }) as CaseField;

  const ADDRESS_FIELD_COMPLEX_RETAIN_HIDDEN: CaseField = ({
    id: 'Address',
    label: 'Address',
    field_type: ADDRESS_DETAILS_FIELD_TYPE,
    display_context: 'READONLY',
    retain_hidden_value: true
  }) as CaseField;

  const ADDRESS_FIELD_COLLECTION: CaseField = ({
    id: 'AddressCollection',
    label: 'Address (collection)',
    field_type: {
      id: 'AddressDetailsCollection',
      type: 'Collection',
      collection_field_type: ADDRESS_DETAILS_FIELD_TYPE
    },
    display_context: 'READONLY'
  }) as CaseField;

  const DUMMY_DOCUMENT_FIELD_TYPE: FieldType = {
    id: 'DummyDocument',
    type: 'Document'
  };

  const DUMMY_DOCUMENT_FIELD_COLLECTION: CaseField = ({
    id: 'DocumentCollection',
    label: 'Document (collection)',
    field_type: {
      id: 'DummyDocumentCollection',
      type: 'Collection',
      collection_field_type: DUMMY_DOCUMENT_FIELD_TYPE
    },
    display_context: 'READONLY'
  }) as CaseField;

  const COUNTRIES: FixedListItem[] = [{ code: 'UK', label: 'United Kingdom' }, { code: 'US', label: 'United States' }];
  const COUNTRY_MULTI_SELECT_FIELD_TYPE: FieldType = createMultiSelectListFieldType('countryCodes', COUNTRIES);
  const COUNTRY_MULTI_SELECT_FIELD: CaseField = createCaseField('CountrySelection', 'Country selection', '',
    COUNTRY_MULTI_SELECT_FIELD_TYPE, 'OPTIONAL', 1, null, null);

  const DOCUMENT_FIELD: CaseField = aCaseField('Document', 'Dummy document', 'Document', 'OPTIONAL', 1, null, null);
  const TEXT_FIELD: CaseField = aCaseField('Colour', 'Colour', 'Text', 'OPTIONAL', 1, null, null);

  const COURTS_DYNAMIC_LIST_FIELD_TYPE: FieldType = {
    id: 'CourtDynamicList',
    type: 'DynamicList'
  };

  const COURT_LIST = [
    { code: '305', label: 'Reading County Court' },
    { code: '474', label: 'Guildford Crown Court' },
    { code: '2732', label: 'Croydon Magistrates\' Court' }
  ];

  const COURT_SELECTION_FIELD: CaseField = ({
    id: 'CourtSelection',
    label: 'Choose preferred court',
    field_type: COURTS_DYNAMIC_LIST_FIELD_TYPE,
    display_context: 'READONLY',
    list_items: COURT_LIST
  }) as CaseField;

  it('should delete fields of a Complex type', () => {
    const formGroup = new UntypedFormGroup({
      Address: new UntypedFormGroup({
        AddressLine1: new FormControl('Street'),
        Postcode: new FormControl('AB12 3CD')
      })
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, ADDRESS_FIELD_COMPLEX);
    expect(formGroup.get('Address.AddressLine1').value).toBeNull();
    // Postcode expected to be null - even though retain_hidden_value is true - because retain_hidden_value is false
    // on the parent Complex field
    expect(formGroup.get('Address.Postcode').value).toBeNull();
  });

  it('should delete only those fields not set to be retained of a Complex type, if the Complex type itself is to be retained', () => {
    const formGroup = new UntypedFormGroup({
      Address: new UntypedFormGroup({
        AddressLine1: new FormControl('Street'),
        Postcode: new FormControl('AB12 3CD')
      })
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, ADDRESS_FIELD_COMPLEX_RETAIN_HIDDEN);
    expect(formGroup.get('Address.AddressLine1').value).toBeNull();
    // Postcode expected not to be null because retain_hidden_value is also true on the parent Complex field
    expect(formGroup.get('Address.Postcode').value).not.toBeNull();
  });

  it('should delete fields of a collection of Complex types', () => {
    const formGroup = new UntypedFormGroup({
      AddressCollection: new FormArray([
        new UntypedFormGroup({
          value: new UntypedFormGroup({
            AddressLine1: new FormControl('Street'),
            Postcode: new FormControl('AB12 3CD')
          })
        }),
        new UntypedFormGroup({
          value: new UntypedFormGroup({
            AddressLine1: new FormControl('Another street'),
            Postcode: new FormControl('AB12 3CD')
          })
        }),
      ])
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, ADDRESS_FIELD_COLLECTION);
    expect((formGroup.get('AddressCollection') as FormArray).at(0).get('value.AddressLine1').value).toBeNull();
    expect((formGroup.get('AddressCollection') as FormArray).at(0).get('value.Postcode').value).toBeNull();
    expect((formGroup.get('AddressCollection') as FormArray).at(1).get('value.AddressLine1').value).toBeNull();
    expect((formGroup.get('AddressCollection') as FormArray).at(1).get('value.Postcode').value).toBeNull();
  });

  it('should delete fields of a collection of Document types', () => {
    const formGroup = new UntypedFormGroup({
      DocumentCollection: new FormArray([
        new UntypedFormGroup({
          value: new UntypedFormGroup({
            document_binary_url: new FormControl('http://document_binary.url'),
            document_filename: new FormControl('document.dummy'),
            document_url: new FormControl('http://document.url')
          })
        }),
        new UntypedFormGroup({
          value: new UntypedFormGroup({
            document_binary_url: new FormControl('http://document_binary.url'),
            document_filename: new FormControl('document.dummy'),
            document_url: new FormControl('http://document.url')
          })
        }),
      ])
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, DUMMY_DOCUMENT_FIELD_COLLECTION);
    expect((formGroup.get('DocumentCollection') as FormArray).at(0).get('value.document_binary_url').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(0).get('value.document_filename').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(0).get('value.document_url').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(1).get('value.document_binary_url').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(1).get('value.document_filename').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(1).get('value.document_url').value).toBeNull();
  });

  it('should delete fields of a MultiSelectList type', () => {
    const formGroup = new UntypedFormGroup({
      CountrySelection: new FormArray([
        new FormControl({ value: 'UK', disabled: true }),
        new FormControl({ value: 'US', disabled: true })
      ])
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, COUNTRY_MULTI_SELECT_FIELD);
    expect((formGroup.get('CountrySelection') as FormArray).at(0).value).toBeNull();
    expect((formGroup.get('CountrySelection') as FormArray).at(1).value).toBeNull();
  });

  it('should delete fields of a Document type', () => {
    const formGroup = new UntypedFormGroup({
      Document: new UntypedFormGroup({
        document_binary_url: new FormControl('http://document_binary.url'),
        document_filename: new FormControl('document.dummy'),
        document_url: new FormControl('http://document.url')
      })
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, DOCUMENT_FIELD);
    expect(formGroup.get('Document.document_binary_url').value).toBeNull();
    expect(formGroup.get('Document.document_filename').value).toBeNull();
    expect(formGroup.get('Document.document_url').value).toBeNull();
  });

  it('should delete the field of a Text type', () => {
    const formGroup = new UntypedFormGroup({
      Colour: new FormControl('Red')
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, TEXT_FIELD);
    expect(formGroup.get('Colour').value).toBeNull();
  });

  it('should delete the field of a DynamicList type', () => {
    const formGroup = new UntypedFormGroup({
      CourtSelection: new FormControl({
        value: {
          list_items: COURT_LIST,
          value: { code: '305', label: 'Reading County Court' }
        }
      })
    });

    fieldsPurger.deleteFieldValue(UntypedFormGroup, COURT_SELECTION_FIELD);
    expect(formGroup.get('CourtSelection').value).toBeNull();
  });

  it('should map array values to null, retaining any keys for object values', () => {
    const array = [
      {
        id: '0',
        value: 'Test'
      },
      'Test'
    ];
    expect(fieldsPurger.mapArrayValuesToNull(array)).toEqual([
      {
        id: null,
        value: null
      },
      null
    ]);
  });
});
