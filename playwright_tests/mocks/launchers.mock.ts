import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const launcher = (id: string, argument: string) => Object.assign(new CaseField(), {
  id,
  label: id,
  display_context: 'OPTIONAL',
  display_context_parameter: `#ARGUMENT(${argument})`,
  field_type: { id: 'ComponentLauncher', type: 'ComponentLauncher' },
  value: null,
  acls: []
});

export const caseFileLauncher = launcher('case-file-launcher', 'CaseFileView');
export const waysToPayField = Object.assign(new CaseField(), {
  id: 'ways-to-pay',
  label: 'Ways to pay',
  display_context: 'READONLY',
  field_type: { id: 'WaysToPay', type: 'WaysToPay' },
  value: null
});
export const unsupportedLauncher = launcher('unsupported-launcher', 'UnknownMiniApp');
