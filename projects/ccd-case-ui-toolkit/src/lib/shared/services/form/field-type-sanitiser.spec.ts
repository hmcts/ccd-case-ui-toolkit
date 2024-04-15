import { CaseField } from '../../domain/definition';
import { FieldTypeSanitiser } from './field-type-sanitiser';

describe('FieldTypeSanitiser', () => {
  const VALUE_DYNAMIC_LIST = JSON.parse(`{
            "value": {
              "code": "F",
              "label": "Female"
            },
            "list_items": [
              {
                "code": "F",
                "label": "Female"
              },
              {
                "code": "M",
                "label": "Male"
              }            ]
          }`);

  const EXPECTED_VALUE_DYNAMIC_LIST = JSON.parse(`{
            "value": {
              "code": "M",
              "label": "Male"
            },
            "list_items": [
              {
                "code": "F",
                "label": "Female"
              },
              {
                "code": "M",
                "label": "Male"
              }            ]
          }`);

  const editForm = {
    data: {
      dynamicList: 'M'
    }
  };

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
    }),
    Object.assign(new CaseField(), {
      id: 'dynamicList',
      label: 'DynamicMultiSelectList',
      value: VALUE_DYNAMIC_LIST,
      hint_text: null,
      field_type: {
        id: 'dynamicList',
        type: 'DynamicMultiSelectList',
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
    new FieldTypeSanitiser().sanitiseLists(caseFields, editForm.data);
    expect(editForm.data.dynamicList).toEqual(EXPECTED_VALUE_DYNAMIC_LIST);
  });

  describe('ensureDynamicMultiSelectListPopulated', () => {
    let fieldTypeSanitiser: FieldTypeSanitiser;
    let mockCaseFields: CaseField[];

    beforeEach(() => {
      fieldTypeSanitiser = new FieldTypeSanitiser();
      mockCaseFields = [
        {
          id: 'sendingMessagesHint',
          label: 'Send a message.',
          field_type: {
            id: 'Label',
            type: 'Label',
            min: null,
            max: null,
            regular_expression: null,
            fixed_list_items: [],
            complex_fields: [],
            collection_field_type: null
          },
          security_label: 'PUBLIC',
          order: 2,
          formatted_value: null,
          display_context: 'READONLY',
          wizardProps: {
            case_field_id: 'sendingMessagesHint',
            order: 2,
            page_column_no: null,
            complex_field_overrides: []
          },
          hiddenCannotChange: true
        },
        {
          id: 'sendMessageObject',
          _value: {
            externalMessageWhoToSendTo: {
              value: null,
              list_items: [
                { code: '123', label: 'John Doe' },
                { code: '456', label: 'Jane Doe' },
                { code: '789', label: 'Peter Piper' },
                { code: '192', label: 'Peter Pan' }
              ]
            }
          },
          field_type: {
            id: 'Message',
            type: 'Complex',
            complex_fields: [{
              id: 'externalMessageWhoToSendTo',
              field_type: {
                id: 'DynamicMultiSelectList',
                type: 'DynamicMultiSelectList'
              },
              display_context: 'MANDATORY'
            },
            {
              id: 'internalOrExternalMessage',
              label: 'internalMessage',
              field_type: {
                id: 'FixedRadioList-InternalExternalMessageEnum',
                type: 'FixedRadioList',
                fixed_list_items: [
                  {
                    code: 'INTERNAL',
                    label: 'Internal message',
                    order: '1'
                  },
                  {
                    code: 'EXTERNAL',
                    label: 'External message',
                    order: '2'
                  }
                ],
                complex_fields: []
              },
              display_context: 'MANDATORY'
            }]
          }
        }
      ] as unknown as CaseField[];
    });

    it('should populate list_items for DynamicMultiSelectList within complex fields', () => {
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      const updatedField = result.find((field) => field.id === 'sendMessageObject');
      const complexField = updatedField.field_type.complex_fields.find((field) => field.id === 'externalMessageWhoToSendTo');

      expect(complexField.list_items).toEqual([
        { code: '123', label: 'John Doe' },
        { code: '456', label: 'Jane Doe' },
        { code: '789', label: 'Peter Piper' },
        { code: '192', label: 'Peter Pan' }
      ]);
    });
  });
});
