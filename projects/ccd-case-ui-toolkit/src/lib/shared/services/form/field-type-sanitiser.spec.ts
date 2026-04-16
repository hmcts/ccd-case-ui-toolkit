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

  it('should preserve collection recipient DynamicMultiSelectList selections for each row during sanitisation', () => {
    const orderListItems = [
      { code: 'order-1', label: 'Blank order or directions (C21) - 15 Apr 2026' },
      { code: 'order-2', label: 'Parental responsibility order (C45A) - 15 Apr 2026' }
    ];
    const collectionCaseFields = [{
      id: 'stmtOfServiceAddRecipient',
      value: [
        {
          id: 'recipient-1',
          value: {
            orderList: {
              list_items: orderListItems,
              value: [orderListItems[0]]
            }
          }
        }
      ],
      field_type: {
        id: 'StmtOfServiceAddRecipient',
        type: 'Collection',
        collection_field_type: {
          id: 'StmtOfServiceAddRecipient',
          type: 'Complex',
          complex_fields: [
            {
              id: 'orderList',
              field_type: {
                id: 'DynamicMultiSelectList',
                type: 'DynamicMultiSelectList'
              },
              display_context: 'OPTIONAL'
            }
          ]
        }
      }
    }] as unknown as CaseField[];
    const formData = {
      stmtOfServiceAddRecipient: [
        {
          id: 'recipient-1',
          value: {
            orderList: [orderListItems[0]]
          }
        },
        {
          id: 'recipient-2',
          value: {
            orderList: [orderListItems[1]]
          }
        }
      ]
    };

    new FieldTypeSanitiser().sanitiseLists(collectionCaseFields, formData);

    expect(formData.stmtOfServiceAddRecipient[0].value.orderList as any).toEqual({
      value: [orderListItems[0]],
      list_items: orderListItems
    });
    expect(formData.stmtOfServiceAddRecipient[1].value.orderList as any).toEqual({
      value: [orderListItems[1]],
      list_items: orderListItems
    });
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

    it('should populate list_items for DynamicMultiSelectList within collection complex fields', () => {
      mockCaseFields.push({
        id: 'stmtOfServiceAddRecipient',
        value: [
          {
            id: 'recipient-1',
            value: {
              orderList: {
                list_items: [
                  { code: 'order-1', label: 'Order 1' },
                  { code: 'order-2', label: 'Order 2' }
                ]
              }
            }
          }
        ],
        field_type: {
          id: 'StmtOfServiceAddRecipient',
          type: 'Collection',
          collection_field_type: {
            id: 'StmtOfServiceAddRecipient',
            type: 'Complex',
            complex_fields: [{
              id: 'orderList',
              field_type: {
                id: 'DynamicMultiSelectList',
                type: 'DynamicMultiSelectList'
              },
              display_context: 'OPTIONAL'
            }]
          }
        }
      } as unknown as CaseField);

      const result = fieldTypeSanitiser.ensureDynamicMultiSelectListPopulated(mockCaseFields);
      const collectionField = result.find((field) => field.id === 'stmtOfServiceAddRecipient');
      const complexField = collectionField.field_type.collection_field_type.complex_fields.find((field) => field.id === 'orderList');

      expect(complexField.list_items).toEqual([
        { code: 'order-1', label: 'Order 1' },
        { code: 'order-2', label: 'Order 2' }
      ]);
    });
  });
});
