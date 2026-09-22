import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const field = (id: string, label: string, type: string, value: unknown = null, extra = {}) =>
  Object.assign(new CaseField(), {
    id,
    label,
    display_context: 'MANDATORY',
    field_type: { id: type, type, ...extra },
    value
  });

export const mandatoryFields = {
  text: field('mandatory-text', 'Text field', 'Text'),
  number: field('mandatory-number', 'Number field', 'Number'),
  email: field('mandatory-email', 'Email field', 'Email'),
  phone: field('mandatory-phone', 'Phone field', 'PhoneUK'),
  textArea: field('mandatory-text-area', 'Text area field', 'TextArea'),
  yesNo: field('mandatory-yes-no', 'Yes or no field', 'YesOrNo'),
  fixedList: field('mandatory-fixed-list', 'Fixed list field', 'FixedList', null, {
    fixed_list_items: [
      { code: 'one', label: 'One', order: 1 },
      { code: 'two', label: 'Two', order: 2 }
    ]
  }),
  fixedRadio: field('mandatory-fixed-radio', 'Fixed radio field', 'FixedRadioList', null, {
    fixed_list_items: [
      { code: 'alpha', label: 'Alpha', order: 1 },
      { code: 'beta', label: 'Beta', order: 2 }
    ]
  }),
  multiSelect: field('mandatory-multi-select', 'Multi select field', 'MultiSelectList', null, {
    fixed_list_items: [
      { code: 'red', label: 'Red', order: 1 },
      { code: 'blue', label: 'Blue', order: 2 }
    ]
  })
};
