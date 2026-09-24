import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const options = [
  { code: 'one', label: 'One' },
  { code: 'two', label: 'Two' }
];

const dynamic = (id: string, type: string) => Object.assign(new CaseField(), {
  id, label: id, display_context: 'MANDATORY',
  field_type: { id: type, type, fixed_list_items: options }, value: null
});

export const advancedFields = {
  postcode: Object.assign(new CaseField(), { id: 'advanced-postcode', label: 'Postcode', display_context: 'MANDATORY', field_type: { id: 'Postcode', type: 'Postcode' }, value: null }),
  richText: Object.assign(new CaseField(), { id: 'advanced-rich-text', label: 'Rich text', display_context: 'OPTIONAL', field_type: { id: 'RichTextArea', type: 'RichTextArea' }, value: null }),
  dynamicList: dynamic('Dynamic list', 'DynamicList'),
  dynamicRadio: dynamic('Dynamic radio', 'DynamicRadioList'),
  dynamicMulti: dynamic('Dynamic multi', 'DynamicMultiSelectList')
};
