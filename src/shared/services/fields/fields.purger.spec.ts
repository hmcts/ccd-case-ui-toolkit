import { FormArray, FormControl, FormGroup } from '@angular/forms';
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
      } as CaseField
    ]
  }

  const ADDRESS_FIELD_COMPLEX: CaseField = <CaseField>({
    id: 'Address',
    label: 'Address',
    field_type: ADDRESS_DETAILS_FIELD_TYPE,
    display_context: 'READONLY'
  });

  const ADDRESS_FIELD_COLLECTION: CaseField = <CaseField>({
    id: 'AddressCollection',
    label: 'Address (collection)',
    field_type: {
      id: 'AddressDetailsCollection',
      type: 'Collection',
      collection_field_type: ADDRESS_DETAILS_FIELD_TYPE
    },
    display_context: 'READONLY',
    value: [
      {
        id: '0',
        value: {
          AddressLine1: 'Street'
        }
      },
      {
        id: '1',
        value: {
          AddressLine1: 'Another street'
        }
      }
    ]
  });

  const DUMMY_DOCUMENT_FIELD_TYPE: FieldType = {
    id: 'DummyDocument',
    type: 'Document'
  }

  const DUMMY_DOCUMENT_FIELD_COLLECTION: CaseField = <CaseField>({
    id: 'DocumentCollection',
    label: 'Document (collection)',
    field_type: {
      id: 'DummyDocumentCollection',
      type: 'Collection',
      collection_field_type: DUMMY_DOCUMENT_FIELD_TYPE
    },
    display_context: 'READONLY',
    value: [
      {
        id: '0',
        value: {
          document_binary_url: 'http://document_binary.url',
          document_filename: 'document.dummy',
          document_url: 'http://document.url'
        }
      },
      {
        id: '1',
        value: {
          document_binary_url: 'http://document_binary.url',
          document_filename: 'document.dummy',
          document_url: 'http://document.url'
        }
      }
    ]
  });

  const COUNTRIES: FixedListItem[] = [{code: 'UK', label: 'United Kingdom'}, {code: 'US', label: 'United States'}];
  const COUNTRY_MULTI_SELECT_FIELD_TYPE: FieldType = createMultiSelectListFieldType('countryCodes', COUNTRIES);
  const COUNTRY_MULTI_SELECT_FIELD: CaseField = createCaseField('CountrySelection', 'Country selection', '',
    COUNTRY_MULTI_SELECT_FIELD_TYPE, 'OPTIONAL', 1, null, null);

  const DOCUMENT_FIELD: CaseField = aCaseField('Document', 'Dummy document', 'Document', 'OPTIONAL', 1, null, null);
  const TEXT_FIELD: CaseField = aCaseField('Colour', 'Colour', 'Text', 'OPTIONAL', 1, null, null);

  it('should delete fields of a Complex type', () => {
    const formGroup = new FormGroup({
      Address: new FormGroup({AddressLine1: new FormControl('Street')})
    });

    fieldsPurger.deleteFieldValue(formGroup, ADDRESS_FIELD_COMPLEX);
    expect(formGroup.get('Address.AddressLine1').value).toBeNull();
  });

  it('should delete fields of a collection of Complex types', () => {
    const formGroup = new FormGroup({
      AddressCollection: new FormArray([
        new FormGroup({
          value: new FormGroup({AddressLine1: new FormControl('Street')})
        }),
        new FormGroup({
          value: new FormGroup({AddressLine1: new FormControl('Another street')})
        }),
      ])
    });

    fieldsPurger.deleteFieldValue(formGroup, ADDRESS_FIELD_COLLECTION);
    expect((formGroup.get('AddressCollection') as FormArray).at(0).get('value.AddressLine1').value).toBeNull();
    expect((formGroup.get('AddressCollection') as FormArray).at(1).get('value.AddressLine1').value).toBeNull();
  });

  it('should delete fields of a collection of Document types', () => {
    const formGroup = new FormGroup({
      DocumentCollection: new FormArray([
        new FormGroup({
          value: new FormGroup({
            document_binary_url: new FormControl('http://document_binary.url'),
            document_filename: new FormControl('document.dummy'),
            document_url: new FormControl('http://document.url')
          })
        }),
        new FormGroup({
          value: new FormGroup({
            document_binary_url: new FormControl('http://document_binary.url'),
            document_filename: new FormControl('document.dummy'),
            document_url: new FormControl('http://document.url')
          })
        }),
      ])
    });

    fieldsPurger.deleteFieldValue(formGroup, DUMMY_DOCUMENT_FIELD_COLLECTION);
    expect((formGroup.get('DocumentCollection') as FormArray).at(0).get('value.document_binary_url').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(0).get('value.document_filename').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(0).get('value.document_url').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(1).get('value.document_binary_url').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(1).get('value.document_filename').value).toBeNull();
    expect((formGroup.get('DocumentCollection') as FormArray).at(1).get('value.document_url').value).toBeNull();
  });

  it('should delete fields of a MultiSelectList type', () => {
    const formGroup = new FormGroup({
      CountrySelection: new FormArray([
        new FormControl({ value: 'UK', disabled: true }),
        new FormControl({ value: 'US', disabled: true })
      ])
    });

    fieldsPurger.deleteFieldValue(formGroup, COUNTRY_MULTI_SELECT_FIELD);
    expect((formGroup.get('CountrySelection') as FormArray).at(0).value).toBeNull();
    expect((formGroup.get('CountrySelection') as FormArray).at(1).value).toBeNull();
  });

  it('should delete fields of a Document type', () => {
    const formGroup = new FormGroup({
      Document: new FormGroup({
        document_binary_url: new FormControl('http://document_binary.url'),
        document_filename: new FormControl('document.dummy'),
        document_url: new FormControl('http://document.url')
      })
    });

    fieldsPurger.deleteFieldValue(formGroup, DOCUMENT_FIELD);
    expect(formGroup.get('Document.document_binary_url').value).toBeNull();
    expect(formGroup.get('Document.document_filename').value).toBeNull();
    expect(formGroup.get('Document.document_url').value).toBeNull();
  });

  it('should delete the field of a Text type', () => {
    const formGroup = new FormGroup({
      Colour: new FormControl('Red')
    });

    fieldsPurger.deleteFieldValue(formGroup, TEXT_FIELD);
    expect(formGroup.get('Colour').value).toBeNull();
  });
});
