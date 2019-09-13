import { FieldTypeSanitiser } from './field-type-sanitiser';
import { CaseField } from '../../domain/definition';

describe('FieldTypeSanitiser', () => {

  let getDynamicListJsonValue = (code, label) => {
    return JSON.parse(`{
                "value": {
                  "code": "${code}",
                  "label": "${label}"
                },
                "list_items": [
                  {
                    "code": "F",
                    "label": "Female"
                  },
                  {"code": "M",
                    "label": "Male"
                  }
                ]
              }`);
  }

  const FEMALE_VALUE_DYNAMIC_LIST = getDynamicListJsonValue('F', 'Female');
  const MALE_VALUE_DYNAMIC_LIST = getDynamicListJsonValue('M', 'Male');

  const editForm = {
    data: {
      dynamicList: 'M',
      dynamicList2: 'F'
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
      value: FEMALE_VALUE_DYNAMIC_LIST,
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
    }),
    Object.assign(new CaseField(), {
      id: 'dynamicList2',
      label: 'DynamicList2',
      value: MALE_VALUE_DYNAMIC_LIST,
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
    new FieldTypeSanitiser().sanitiseDynamicLists(caseFields, editForm);
    expect(editForm.data.dynamicList).toEqual(MALE_VALUE_DYNAMIC_LIST);
    expect(editForm.data.dynamicList2).toEqual(FEMALE_VALUE_DYNAMIC_LIST);
  });

});
