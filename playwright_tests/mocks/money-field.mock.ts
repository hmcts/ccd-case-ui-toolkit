import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

export const moneyField = Object.assign(new CaseField(), {
  id: 'money-amount',
  label: 'Money amount',
  display_context: 'MANDATORY',
  field_type: { id: 'MoneyGBP', type: 'MoneyGBP' },
  value: null
});
