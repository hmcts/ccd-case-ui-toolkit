import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldLabelPipe } from './field-label.pipe';

describe('FieldLabelPipe', () => {
  let translationPipeMock;
  let fieldLabelPipe: FieldLabelPipe;

  beforeEach(() => {
    translationPipeMock = jasmine.createSpyObj('RpxTranslatePipe', ['transform']);
    translationPipeMock.transform.and.callFake((someString: string) => someString);
    fieldLabelPipe = new FieldLabelPipe(translationPipeMock);
  });

  it('should return empty string for null values', () => {
    expect(fieldLabelPipe.transform(null))
      .toBe('');
    expect(translationPipeMock.transform).not.toHaveBeenCalled();
  });

  it('should return empty string for undefined label', () => {
    expect(fieldLabelPipe.transform({} as CaseField))
      .toBe('');
    expect(translationPipeMock.transform).not.toHaveBeenCalled();
  });

  it('should return label for undefined display_context', () => {
    expect(fieldLabelPipe.transform({ label: 'label' } as CaseField))
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
    translationPipeMock.transform.and.returnValue('Welsh label');
    const field = { label: 'label', isTranslated: false } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('Welsh label');
    expect(translationPipeMock.transform).toHaveBeenCalledOnceWith('label');
  });

  it('should return original label for already translated field', () => {
    const field = { label: 'translatedLabel', isTranslated: true } as CaseField;
    expect(fieldLabelPipe.transform(field)).toBe('translatedLabel');
    expect(translationPipeMock.transform).not.toHaveBeenCalled();
  });

  it('should render locally handled English fallback and Welsh results without another lookup', () => {
    const field = Object.assign(new CaseField(), {
      label: 'English fallback PRIVATE_NAME',
      translationHandledLocally: true
    });

    expect(fieldLabelPipe.transform(field)).toBe('English fallback PRIVATE_NAME');
    expect(field.isTranslated).toBe(false);

    field.label = 'Welsh result PRIVATE_NAME';
    field.isTranslated = true;

    expect(fieldLabelPipe.transform(field)).toBe('Welsh result PRIVATE_NAME');
    expect(translationPipeMock.transform).not.toHaveBeenCalled();
  });

  (['isTranslated', 'translationHandledLocally'] as const).forEach((flag) => {
    ['OPTIONAL', 'optional'].forEach((displayContext) => {
      it(`should translate only Optional when ${flag} is true and display_context is ${displayContext}`, () => {
        const field = Object.assign(new CaseField(), {
          label: 'Resolved PRIVATE_NAME',
          display_context: displayContext,
          [flag]: true
        });
        translationPipeMock.transform.and.returnValue('Dewisol');

        expect(fieldLabelPipe.transform(field)).toBe('Resolved PRIVATE_NAME (Dewisol)');
        expect(translationPipeMock.transform).toHaveBeenCalledOnceWith('Optional');
      });
    });
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
