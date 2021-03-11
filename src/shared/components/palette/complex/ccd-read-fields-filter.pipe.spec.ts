import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';
import { CaseField } from '../../../domain/definition';

describe('ReadFieldsFilterPipe', () => {

  const caseBuilder = (fields: CaseField[], value?: any): CaseField => {
    return <CaseField>({
      id: 'Applicant',
      label: 'Applicant',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'ApplicantType',
        type: 'Complex',
        complex_fields: fields
      },
      value: value
    });
  }
  const pipe = new ReadFieldsFilterPipe();

  it('should set the hidden property to false', () => {
    const COMPLEX_WITH_CHILDREN: CaseField[] = [
      <CaseField>({
        id: 'Person',
        label: 'Person',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Person',
          type: 'Complex',
          complex_fields: [
            <CaseField>({
              id: 'PersonFirstName',
              label: 'First name',
              display_context: 'OPTIONAL',
              field_type: {
                id: 'Text',
                type: 'Text'
              },
              value: 'John'
            })
          ]
        }
      }),
    ];
    const caseFields: CaseField[] = pipe.transform(caseBuilder(COMPLEX_WITH_CHILDREN), false, undefined, true);
    expect(caseFields[0].hidden).toEqual(false)
  })

  it('should set the hidden property to true when the case field has a show_condition ', () => {

    const TEXT_CASEFIELDS_WITH_SHOW_CONDITION: CaseField[] = [
      <CaseField>({
        id: 'Person',
        label: 'Person',
        hidden: false,
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text',
        },
        value: 'Kuda'
      }),
      <CaseField>({
        id: 'Gender',
        label: 'Gender',
        hidden: false,
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text',
          complex_fields: [],
        },
        value: 'male',
        show_condition: 'Person="John"'
      }),
    ];
    const caseFields: CaseField[] = pipe.transform(caseBuilder(TEXT_CASEFIELDS_WITH_SHOW_CONDITION), false, undefined, true);
    expect(caseFields[0].hidden).toEqual(false)
    expect(caseFields[1].hidden).toEqual(true)
  })
});
