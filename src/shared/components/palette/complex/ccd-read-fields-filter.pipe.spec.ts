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

});
