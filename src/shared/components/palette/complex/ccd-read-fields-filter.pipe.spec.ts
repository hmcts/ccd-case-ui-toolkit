import { CaseField } from './../../../domain/definition/case-field.model';
import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';

function buildCaseField(id: string, properties: object, value?: any): CaseField {
  return <CaseField>({
    id,
    ...properties,
    value
  });
}
function getComplexField(id: string, complex_fields: CaseField[], value?: any): CaseField {
  return buildCaseField(id, {
    field_type: { id: 'Complex', type: 'Complex', complex_fields }
  }, value);
}

describe('ReadFieldsFilterPipe', () => {
  const TEXT_FIELD: CaseField = buildCaseField('text', {
    field_type: { id: 'Text', type: 'Text' }
  }, null);
  const CASE_PAYMENT_HISTORY_VIEWER: CaseField = buildCaseField('payments', {
    field_type: { id: 'CasePaymentHistoryViewer', type: 'CasePaymentHistoryViewer' }
  }, null);
  const LABEL_FIELD: CaseField = buildCaseField('label', {
    field_type: { id: 'Label', type: 'Label' }, label: 'Label'
  }, null);

  let pipe: ReadFieldsFilterPipe;

  beforeEach(() => {
    pipe = new ReadFieldsFilterPipe();
  });

  it('filters out null Text fields when keepEmpty is false', () => {
    const CF: CaseField = getComplexField('complex', [ TEXT_FIELD ], { text: null } );
    const RESULT: CaseField[] = pipe.transform(CF, false);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(0);
  });

  it('retains null Text fields when keepEmpty is true', () => {
    const CF: CaseField = getComplexField('complex', [ TEXT_FIELD ], { text: null } );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(TEXT_FIELD.id);
  });

  it('retains null CasePaymentHistoryViewer fields when keepEmpty is true', () => {
    const CF: CaseField = getComplexField('complex', [ CASE_PAYMENT_HISTORY_VIEWER ], { payments: null } );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(CASE_PAYMENT_HISTORY_VIEWER.id);
  });

  it('retains null CasePaymentHistoryViewer fields even when keepEmpty is false', () => {
    const CF: CaseField = getComplexField('complex', [ CASE_PAYMENT_HISTORY_VIEWER ], { payments: null } );
    const RESULT: CaseField[] = pipe.transform(CF, false);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(CASE_PAYMENT_HISTORY_VIEWER.id);
  });

  it('retains Label fields with a label when keepEmpty is true', () => {
    const CF: CaseField = getComplexField('complex', [ LABEL_FIELD ], {} );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(LABEL_FIELD.id);
  });

  it('retains Label fields without a label when keepEmpty is true', () => {
    const NO_LABEL_FIELD: CaseField = buildCaseField('label', {
      field_type: { id: 'Label', type: 'Label' }
    }, null);
    const CF: CaseField = getComplexField('complex', [ NO_LABEL_FIELD ], {} );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(NO_LABEL_FIELD.id);
  });

  it('filters out Label fields without a label when keepEmpty is false', () => {
    const NO_LABEL_FIELD: CaseField = buildCaseField('label', {
      field_type: { id: 'Label', type: 'Label' }
    }, null);
    const CF: CaseField = getComplexField('complex', [ NO_LABEL_FIELD ], {} );
    const RESULT: CaseField[] = pipe.transform(CF, false);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(0);
  });

  it('hides the parent if children are not defined', () => {

    const caseField: CaseField = buildCaseField('ViewApplicationTab', {
      field_type: {
        id: 'ViewApplicationTab',
        type: 'Complex',
        complex_fields: [
          {
            id: 'factorsParenting',
            label: 'Factors affecting parenting',
            field_type: {
              id: 'FactorsParenting',
              type: 'Complex',
              complex_fields: [
                {
                  id: 'pageHeader',
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'Label',
                    max: null,
                    min: null,
                    type: 'Label'
                  },
                  label: 'Is there any evidence of any of the following affecting ability to parent?',
                  show_condition: null,
                  retain_hidden_value: null,
                  security_classification: 'PUBLIC'
                },
                {
                  id: 'alcoholDrugAbuse',
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'YesOrNo',
                    max: null,
                    min: null,
                    type: 'YesOrNo'
                  },
                  label: 'Alcohol or drug abuse',
                  show_condition: null,
                  retain_hidden_value: null,
                  security_classification: 'PUBLIC'
                }
              ]
            }
          }
        ],
      },
      label: 'View application',
      value: {
        factorsParenting: {
          alcoholDrugAbuse: null,
          alcoholDrugAbuseReason: null,
          anythingElse: null,
          anythingElseReason: null,
          domesticViolence: null,
          domesticViolenceReason: null,
        }
      }
    }, null);
    const RESULT: CaseField[] = pipe.transform(caseField, false, undefined, true);
    expect(RESULT.length).toEqual(0);
  });

});
