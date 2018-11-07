import { FieldLabelPipe } from './field-label.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';

describe('FieldLabelPipe', () => {

  let fieldLabelPipe: FieldLabelPipe = new FieldLabelPipe();

  it('should return empty string for null values', () => {
    expect(fieldLabelPipe.transform(null))
      .toBe('');
  });

  it('should return empty string for undefined label', () => {
    expect(fieldLabelPipe.transform({} as CaseField))
      .toBe('');
  });

  it('should return label for undefined display_context', () => {
    expect(fieldLabelPipe.transform({ label: 'label'} as CaseField))
      .toBe('label');
  });

  it('should add OPTIONAL label if display_context field is OPTIONAL', () => {
    expect(fieldLabelPipe.transform({ label: 'label', display_context: 'OPTIONAL' } as CaseField))
      .toBe('label (Optional)');
  });

  it('should return label if display_context field is NOT OPTIONAL', () => {
    expect(fieldLabelPipe.transform({ label: 'label', display_context: 'ANYTHING ELSE' } as CaseField))
      .toBe('label');
  });
});
