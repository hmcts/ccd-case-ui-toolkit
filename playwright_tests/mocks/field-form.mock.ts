import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const textField = (id: string, label: string, displayContext: string, value: string | null = null): CaseField => Object.assign(new CaseField(), {
  id,
  label,
  display_context: displayContext,
  field_type: { id: 'Text', type: 'Text' },
  value
});

export const fieldFormFields = {
  required: textField('field-form-required', 'Field form required', 'MANDATORY'),
  optional: textField('field-form-optional', 'Field form optional', 'OPTIONAL'),
  readOnly: textField('field-form-read-only', 'Field form read-only', 'READONLY', 'Read-only value')
};
