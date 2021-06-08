import { CcdCollectionTableCaseFieldsFilterPipe } from './ccd-collection-table-value-case-fields.pipe';
import { KeyValue } from '@angular/common/src/pipes';
import { CaseField } from '../../../domain';

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
    id: '',
    label: '',
    hidden: false,
    field_type: {
      complex_fields: [],
      id: 'Hearing',
      type: 'Complex'
    },
    display_context_parameter: '#TABLE(Hearing_type,Hearing_venue)'
  }
  it('to create complex case field with a single case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform(CASE_FIELDS, CASE_FIELD as unknown as CaseField, {})
    expect(RESULT.field_type.complex_fields.length).toBe(1);
  });
});
