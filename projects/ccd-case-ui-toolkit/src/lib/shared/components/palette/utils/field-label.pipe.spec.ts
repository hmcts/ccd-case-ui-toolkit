import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldLabelPipe } from './field-label.pipe';

describe('FieldLabelPipe', () => {
  let translationPipeMock = jasmine.createSpyObj('RpxTranslatePipe', ['transform']);
  translationPipeMock.transform.and.callFake((someString: string) => someString);
  const fieldLabelPipe: FieldLabelPipe = new FieldLabelPipe(translationPipeMock);

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

  it('should return translated label for non-translated field', () => {
    const field = { label: 'label', isTranslated: false } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('label');
  });

  it('should return original label for already translated field', () => {
    const field = { label: 'translatedLabel', isTranslated: true } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('translatedLabel');
  });

  it('should handle null display_context gracefully', () => {
    const field = { label: 'label', display_context: null } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('label');
  });

  it('should handle empty display_context gracefully', () => {
    const field = { label: 'label', display_context: '' } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('label');
  });

  it('should handle undefined display_context gracefully', () => {
    const field = { label: 'label', display_context: undefined } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('label');
  });
});
