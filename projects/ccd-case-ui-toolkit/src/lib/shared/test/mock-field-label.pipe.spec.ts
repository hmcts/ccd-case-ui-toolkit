
import { CaseField } from '../domain';
import { MockFieldLabelPipe } from './mock-field-label.pipe';

describe('MockFieldLabelPipe', () => {
  const fieldLabelPipe: MockFieldLabelPipe = new MockFieldLabelPipe();
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
