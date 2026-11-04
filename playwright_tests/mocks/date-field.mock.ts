import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

export const dateField = Object.assign(new CaseField(), {
  id: 'test-date',
  label: 'Example date',
  display_context: 'MANDATORY',
  field_type: { id: 'Date', type: 'Date' },
  value: '2021-04-09'
});

export const dateTimeField = Object.assign(new CaseField(), {
  id: 'test-date-time',
  label: 'Example date and time',
  display_context: 'MANDATORY',
  display_context_parameter: '#DATETIMEENTRY(dd-MM-yyyy HH:mm)',
  field_type: { id: 'DateTime', type: 'DateTime' },
  value: '2021-04-09T10:30:00.000'
});
