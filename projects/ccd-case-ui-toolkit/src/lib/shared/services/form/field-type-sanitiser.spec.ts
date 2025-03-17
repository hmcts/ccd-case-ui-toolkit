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
        },
        {
          id: 'field1',
          field_type: {
            type: 'Complex',
            complex_fields: [
              {
                id: 'subfield1',
                field_type: {
                  type: 'Complex',
                  complex_fields: [
                    {
                      id: 'subsubfield1',
                      field_type: {
                        type: 'DynamicMultiSelectList',
                      },
                      display_context: 'MANDATORY',
                    },
                  ],
                },
              },
            ],
          },
          _value: {
            subfield1: {
              subsubfield1: {
                list_items: ['nestedItem1', 'nestedItem2'],
              },
            },
          },
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

    it('should update list_items with empty list_items in _value', () => {
      mockCaseFields[1]._value.externalMessageWhoToSendTo.list_items = [];
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      const updatedField = result.find((field) => field.id === 'sendMessageObject');
      const complexField = updatedField.field_type.complex_fields.find((field) => field.id === 'externalMessageWhoToSendTo');

      expect(complexField.list_items).toEqual([]);
    });

    it('should handle no DynamicMultiSelectList fields in object', () => {
      mockCaseFields[1].field_type.complex_fields = mockCaseFields[1].field_type.complex_fields.filter((field) => field.id !== 'externalMessageWhoToSendTo');
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      const updatedField = result.find((field) => field.id === 'sendMessageObject');

      expect(updatedField).not.toBeNull();
      expect(updatedField.field_type.complex_fields).not.toContain(jasmine.objectContaining({ id: 'externalMessageWhoToSendTo' }));
    });

    it('should not ammend list items if display_context is HIDDEN', () => {
      mockCaseFields[1].field_type.complex_fields[0].display_context = 'HIDDEN';
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      console.log(JSON.stringify(result));
      expect(result[1].field_type.complex_fields[0].list_items).toBeUndefined();
    });

    it('should only add list_items to type DynamicMultiSelectList', () => {
      mockCaseFields[1].field_type.complex_fields[0].field_type.type = 'MultiSelectList';
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      expect(result[1].field_type.complex_fields[0].list_items).toBeUndefined();
    });

    it('should replace list_items if list_items is null', () => {
      mockCaseFields[1].field_type.complex_fields[0].list_items = null;
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      expect(result[1].field_type.complex_fields[0].list_items).toEqual([
        { code: '123', label: 'John Doe' },
        { code: '456', label: 'Jane Doe' },
        { code: '789', label: 'Peter Piper' },
        { code: '192', label: 'Peter Pan' }
      ]);
    });

    it('should add list_items to type DynamicMultiSelectList in deeply nested field', () => {
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      expect(result[2].field_type.complex_fields[0].field_type.complex_fields[0].list_items).toEqual(['nestedItem1', 'nestedItem2']);
    });

    it('should add list_items to type DynamicRadioButtonList in deeply nested field', () => {
      mockCaseFields[2].field_type.complex_fields[0].field_type.complex_fields[0].field_type.type = 'DynamicRadioList';
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      expect(result[2].field_type.complex_fields[0].field_type.complex_fields[0].list_items).toEqual(['nestedItem1', 'nestedItem2']);
    });

    it('should add list_items to type DynamicList in deeply nested field', () => {
      mockCaseFields[2].field_type.complex_fields[0].field_type.complex_fields[0].field_type.type = 'DynamicList';
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      expect(result[2].field_type.complex_fields[0].field_type.complex_fields[0].list_items).toEqual(['nestedItem1', 'nestedItem2']);
    });

    it('should add list_items to type FixedList in deeply nested field', () => {
      mockCaseFields[2].field_type.complex_fields[0].field_type.complex_fields[0].field_type.type = 'FixedList';
      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      expect(result[2].field_type.complex_fields[0].field_type.complex_fields[0].list_items).toBeUndefined();
    });

    it('should call updateFieldValues when matching id is found', () => {
      const caseField = {
        id: 'ordersToShareCollection',
        field_type: {
          id: 'ordersToShareCollection-5792b908-6173-4288-b2e2-d639c67c2b95',
          type: 'Collection',
          collection_field_type: {
            id: 'FR_orderToShare',
            type: 'Complex',
            complex_fields: [
              {
                id: 'documentToShare',
                field_type: {
                  id: 'DynamicMultiSelectList',
                  type: 'DynamicMultiSelectList'
                }
              },
              {
                id: 'hasSupportingDocuments',
                field_type: {
                  id: 'YesOrNo',
                  type: 'YesOrNo'
                }
              },
              {
                id: 'includeSupportingDocument',
                field_type: {
                  id: 'YesOrNo',
                  type: 'YesOrNo'
                }
              },
              {
                id: 'attachmentsToShare',
                field_type: {
                  id: 'DynamicMultiSelectList',
                  type: 'DynamicMultiSelectList'
                }
              }
            ]
          }
        },
        _value: [
          {
            id: '42110b76-c3ca-4407-ba65-5b4e6c74c3de',
            value: {
              documentToShare: {
                value: null,
                list_items: [
                  {
                    code: '479fccd3-f860-470b-abda-20b0fdd8b2d3',
                    label: 'Approved order - Applicant Draft Order 1.docx'
                  }
                ]
              },
              hasSupportingDocuments: 'Yes',
              attachmentsToShare: {
                value: null,
                list_items: [
                  {
                    code: 'be0bd159-fa9e-439f-ab74-8ef222641c80',
                    label: 'A.pdf'
                  }
                ]
              }
            }
          }
        ]
      } as CaseField;
      const data = {
        sendOrderQuestion: null,
        ordersToShareCollection: [
          {
            value: {
              documentToShare: [
                {
                  code: '479fccd3-f860-470b-abda-20b0fdd8b2d3',
                  label: 'Approved order - Applicant Draft Order 1.docx'
                }
              ],
              hasSupportingDocuments: 'Yes',
              includeSupportingDocument: 'No',
              attachmentsToShare: []
            },
            id: '42110b76-c3ca-4407-ba65-5b4e6c74c3de'
          }
        ]
      };
      fieldTypeSanitiser.checkValuesSetInCollection(caseField, data);
      expect(caseField._value[0].value.documentToShare.value).toEqual(data.ordersToShareCollection[0].value.documentToShare);
    });
  });
});
