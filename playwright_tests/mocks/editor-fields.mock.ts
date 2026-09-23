import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const textField = (id: string, label: string, displayContext: string): CaseField => Object.assign(new CaseField(), {
  id,
  label,
  display_context: displayContext,
  field_type: { id: 'Text', type: 'Text' },
  value: null
});

export const editorFields = [
  textField('editor-required', 'Required field', 'MANDATORY'),
  textField('editor-optional', 'Optional field', 'OPTIONAL')
];
