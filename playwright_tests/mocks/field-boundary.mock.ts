import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const read = (id: string, type: string, value: unknown, properties = {}) => Object.assign(new CaseField(), {
  id, label: id, display_context: 'READONLY', field_type: { id: type, type }, ...properties, value
});
const options = [{ code: 'one', label: 'First choice' }, { code: 'two', label: 'Second choice' }];

export const fieldBoundaryFields = [
  read('money-positive', 'MoneyGBP', '123456'),
  read('money-zero', 'MoneyGBP', '0'),
  read('money-negative', 'MoneyGBP', '-123'),
  read('money-invalid', 'MoneyGBP', 'not-money'),
  read('money-empty', 'MoneyGBP', null),
  read('date-read', 'Date', '2024-02-29'),
  read('date-time-read', 'DateTime', '2024-06-15T13:05:09'),
  read('date-empty', 'Date', null),
  read('dynamic-read', 'DynamicList', 'two', { list_items: options }),
  read('dynamic-persisted', 'DynamicList', { list_items: options, value: { code: 'one', label: 'Stale label' } }),
  read('dynamic-unknown', 'DynamicList', 'missing', { list_items: options }),
  read('dynamic-multi-read', 'DynamicMultiSelectList', [{ code: 'two', label: 'Stale label' }], { list_items: options }),
  read('dynamic-multi-formatted', 'DynamicMultiSelectList', null, { list_items: options, formatted_value: { list_items: options, value: [{ code: 'one', label: 'Stale label' }] } }),
  read('rich-read', 'RichTextArea', '<h2>Formatted heading</h2><p data-indent="2"><strong>Important</strong> <em>detail</em></p><ol start="3" type="a"><li>Third item</li></ol>'),
  read('rich-unsafe', 'RichTextArea', '<p onclick="window.richTextExecuted=true" style="color:red" data-indent="99">Safe remainder</p><script>window.richTextExecuted=true</script><iframe srcdoc="unsafe"></iframe><a href="javascript:window.richTextExecuted=true">Link text</a>'),
  read('text-escaped', 'Text', '<strong>Literal content</strong>'),
  read('textarea-lines', 'TextArea', 'First line\nSecond line')
];
