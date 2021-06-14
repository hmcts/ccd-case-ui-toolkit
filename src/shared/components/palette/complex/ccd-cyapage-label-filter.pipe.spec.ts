import { CcdCYAPageLabelFilterPipe } from './ccd-cyapage-label-filter.pipe';
import { CaseField } from '../../../domain';

describe('CcdCYAPageLabelFilterPipe', () => {

  const LABEL_CASE_FIELD = {
    display_context: 'READONLY',
    field_type: {
      complex_fields: [],
      id: 'Label',
      type: 'Label'
    },
    label: 'You can save and return to this page at any time. Questions marked with a * need to be completed before you can send your' +
      ' application.',
    show_condition: null,
  }

  const COMPLEX_CASE_FIELD = {
    display_context: 'COMPLEX',
    field_type: {
      complex_fields: [
        {
          display_context: 'OPTIONAL',
          field_type: {
            complex_fields: [],
            id: 'TextArea',
            type: 'TextArea',
          },
          hidden: false,
          id: 'otherOrder',
          label: '*Which order do you need?',
          show_condition: 'orders.orderTypeCONTAINS="OTHER"',
          value: null,
        },
        {
          display_context: 'OPTIONAL',
          field_type: {
            complex_fields: [],
            id: 'Label',
            type: 'Label',
          },
          hidden: false,
          id: 'otherOrder',
          label: 'Relationship to the child',
        }
      ],
      id: 'Orders',
      type: 'Complex'
    },
    label: 'Orders and directions needed',
    show_condition: null,
  }
  const CASE_FIELDS: CaseField[] = [
    LABEL_CASE_FIELD,
    COMPLEX_CASE_FIELD,
  ] as CaseField[];

  const CASE_FIELDS_2: CaseField[] = [
    LABEL_CASE_FIELD,
  ] as CaseField[];

  it('should filter out all the complex labels', () => {
    const pipe = new CcdCYAPageLabelFilterPipe();

    const RESULT = pipe.transform(CASE_FIELDS);
    expect(RESULT.length).toBe(2);
    expect(RESULT[1].field_type.complex_fields.length).toBe(1);
    expect(RESULT[1].field_type.complex_fields[0].id).toBe('otherOrder');
    expect(RESULT[1].field_type.complex_fields[0].field_type.id).toBe('TextArea');
  });

  it('should not filter out the label', () => {
    const pipe = new CcdCYAPageLabelFilterPipe();
    const RESULT = pipe.transform(CASE_FIELDS_2);
    expect(RESULT.length).toBe(1);
    expect(RESULT[0].field_type.complex_fields.length).toBe(0);
    expect(RESULT[0].field_type.id).toBe('Label');
  });
});
