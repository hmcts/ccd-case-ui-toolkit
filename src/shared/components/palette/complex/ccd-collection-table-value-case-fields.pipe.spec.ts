import { CcdCollectionTableCaseFieldsFilterPipe } from './ccd-collection-table-value-case-fields.pipe';
import { KeyValue } from '@angular/common/src/pipes';
import { CaseField } from '../../../domain';
import { newCaseField, textFieldType } from '../../../fixture';

describe('CcdCollectionTableCaseFieldsFilterPipe', () => {
  const CASE_FIELDS: KeyValue<string, any>[] = [
    {
      key: 'hearingShowDetails',
      value: {
        caseField: {
          id: 'hearingShowDetails',
          label: 'Show Hearing Details',
          field_type: {
            id: 'YesOrNo',
            type: 'YesOrNo',
          }
        },
        label: 'Show Hearing Details',
        type: {
          type: 'YesOrNo',
        }
      }
    }
  ]

  const CASE_FIELD = {
    id: 'Hearing',
    label: '',
    hidden: false,
    field_type: {
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine5', 'Line 2', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine4', 'Line 3', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine3', 'Line 2', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine2', 'Line 3', null, textFieldType(), 'OPTIONAL').build()
      ],
      id: 'Hearing',
      type: 'Complex'
    },
    display_context_parameter: '#TABLE(Hearing_type,Hearing_venue)'
  }
  it('to create complex case field with a single case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform(CASE_FIELDS, CASE_FIELD as CaseField, {})
    expect(RESULT.field_type.complex_fields.length).toBe(1);
    expect(RESULT.field_type.complex_fields[0].id).toBe('hearingShowDetails');
    expect(RESULT.id).toBe('Hearing')
    expect(RESULT.field_type.type).toBe('Complex');
  });

  it('should create a complex case field without a single case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform([], CASE_FIELD as CaseField, {})
    expect(RESULT.field_type.complex_fields.length).toBe(0);
    expect(RESULT.id).toBe('Hearing')
    expect(RESULT.field_type.type).toBe('Complex');
  });

  it('should create a case field with appropriate values', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform(CASE_FIELDS, CASE_FIELD as CaseField, {
        AddressLine1: 'AAFlat 10',
        AddressLine2: 111,
        AddressLine3: 444,
        AddressLine4: 666
      }
    )
    expect(RESULT.field_type.complex_fields.length).toBe(1);
    expect(RESULT.id).toBe('Hearing')
    expect(RESULT.value.AddressLine1).toBe('AAFlat 10');
    expect(RESULT.value.AddressLine2).toBe(111);
    expect(RESULT.value.AddressLine3).toBe(444);
    expect(RESULT.value.AddressLine4).toBe(666);
  })

  it('should create a plain case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform([], null, {})
    expect(RESULT.field_type.complex_fields.length).toBe(0);
    expect(RESULT.id).toBe('')
    expect(RESULT.label).toBe('')
  })
});
