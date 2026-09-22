import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

export const dateField = Object.assign(new CaseField(), {
  id: 'test-date',
  label: 'Example date',
  display_context: 'MANDATORY',
  field_type: { id: 'Date', type: 'Date' },
  value: '2021-04-09'
});
