import { FieldTypeSanitiser } from './field-type-sanitiser';
import { CaseField } from '../../domain/definition';

describe('FieldTypeSanitiser', () => {

  const VALUE_DYNAMIC_LIST = JSON.parse('{\n' +
    '            "value": {\n' +
    '              "code": "F",\n' +
    '              "label": "Female"\n' +
    '            },\n' +
    '            "list_items": [\n' +
    '              {\n' +
    '                "code": "F",\n' +
    '                "label": "Female"\n' +
    '              },\n' +
    '              {\n' +
    '                "code": "M",\n' +
    '                "label": "Male"\n' +
    '              }' +
    '            ]\n' +
    '          }');

  const EXPECTED_VALUE_DYNAMIC_LIST = JSON.parse('{\n' +
    '            "value": {\n' +
    '              "code": "M",\n' +
    '              "label": "Male"\n' +
    '            },\n' +
    '            "list_items": [\n' +
    '              {\n' +
    '                "code": "F",\n' +
    '                "label": "Female"\n' +
    '              },\n' +
    '              {\n' +
    '                "code": "M",\n' +
    '                "label": "Male"\n' +
    '              }' +
    '            ]\n' +
    '          }');

  const editForm = {
    data: {
      dynamicList: 'M'
    }
  }


  const caseFields: CaseField[] = [
    Object.assign(new CaseField(), {
      id: '[CASE_REFERENCE]',
      label: 'Case Reference',
      value: 1533032330714079,
      hint_text: null,
      field_type: {
        id: 'Number',
        type: 'Number',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[CASE_TYPE]',
      label: 'Case Type',
      value: 'DIVORCE',
      hint_text: null,
      field_type: {
        id: 'Text',
        type: 'Text',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: 'dynamicList',
      label: 'DynamicList',
      value: VALUE_DYNAMIC_LIST,
      hint_text: null,
      field_type: {
        id: 'dynamicList',
        type: 'DynamicList',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    })
  ];

  it('should enrich dynamiclist casefields values with correct format ', () => {
    expect(editForm.data.dynamicList).toEqual('M');
    new FieldTypeSanitiser().sanitiseLists(caseFields, editForm);
    expect(editForm.data.dynamicList).toEqual(EXPECTED_VALUE_DYNAMIC_LIST);
  });

});
