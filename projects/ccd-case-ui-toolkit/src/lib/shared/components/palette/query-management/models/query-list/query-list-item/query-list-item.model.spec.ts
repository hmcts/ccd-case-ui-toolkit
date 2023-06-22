import { QueryListItem } from './query-list-item.model';
import { CaseField, FieldType } from '../../../../../../domain';

describe('QueryListItem', () => {
  let queryListItem: QueryListItem;
  let lastSubmittedBy: QueryListItem;

  beforeEach(() => {
    const items = [
      {
        id: '222-222',
        subject: '',
        name: 'Name 2',
        body: 'Body 2',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-02-01'),
        createdBy: 'Person A',
        parentId: '111-111',
        children: []
      },
      {
        id: '333-333',
        subject: '',
        name: 'Name 3',
        body: 'Body 3',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-03-01'),
        createdBy: 'Person B',
        parentId: '111-111',
        children: []
      },
      {
        id: '444-444',
        subject: '',
        name: 'Name 4',
        body: 'Body 4',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2020-03-01'),
        createdBy: 'Person C',
        parentId: '222-222'
      },
      // lastSubmittedBy
      {
        id: '555-555',
        subject: '',
        name: 'Name 5',
        body: 'Body 5',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2023-06-01'),
        createdBy: 'Person D',
        parentId: '444-444',
      }
    ];

    const childrenItems = items.map(item => {
      const listItem = new QueryListItem();
      Object.assign(listItem, item);
      return listItem;
    });

    queryListItem = new QueryListItem();
    Object.assign(queryListItem, {
      id: '111-111',
      subject: 'Subject 1',
      name: 'Name 1',
      body: 'Body 1',
      attachments: [
        {
          _links: {
            self: {
              href: 'https://hmcts.internal/documents/111-111'
            },
            binary: {
              href: 'https://hmcts.internal/documents/111-111/binary'
            }
          },
          originalDocumentName: 'Document 1'
        }
      ],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2021-01-01'),
      createdBy: 'Person A',
      children: [
        childrenItems[0],
        childrenItems[1],
        {
          ...childrenItems[2],
          children: [
            // lastSubmittedBy
            childrenItems[3]
          ]
        }
      ]
    });

    lastSubmittedBy = childrenItems[3];
  });

  describe('lastSubmittedMessage', () => {
    it('should return the last submitted message', () => {
      expect(queryListItem.lastSubmittedMessage).toEqual(lastSubmittedBy);
    });

    it('should return the message itself if there are no children', () => {
      queryListItem.children = [];
      expect(queryListItem.lastSubmittedMessage).toBe(queryListItem);
    });
  });

  describe('lastSubmittedBy', () => {
    it('should return the name of the person of the lastSubmittedMessage', () => {
      expect(queryListItem.lastSubmittedBy).toEqual(lastSubmittedBy.name);
    });
  });

  describe('lastSubmittedDate', () => {
    it('should return the date of the lastSubmittedMessage', () => {
      expect(queryListItem.lastSubmittedDate).toEqual(lastSubmittedBy.createdOn);
    });
  });

  describe('lastResponseBy', () => {
    it('should return the name of the person of the lastSubmittedMessage when it has children', () => {
      expect(queryListItem.children.length).toBeGreaterThan(0);
      expect(queryListItem.lastResponseBy).toEqual(lastSubmittedBy.name);
    });

    it('should return empty string when it has no children', () => {
      queryListItem.children = [];
      expect(queryListItem.children).toEqual([]);
      expect(queryListItem.lastResponseBy).toEqual('');
    });
  });

  describe('lastResponseDate', () => {
    it('should return the date of the lastSubmittedMessage when it has children', () => {
      expect(queryListItem.children.length).toBeGreaterThan(0);
      expect(queryListItem.lastResponseDate).toEqual(lastSubmittedBy.createdOn);
    });

    it('should return empty string when it has no children', () => {
      queryListItem.children = [];
      expect(queryListItem.children).toEqual([]);
      expect(queryListItem.lastResponseDate).toEqual(null);
    });
  });

  describe('attachmentsForMockCaseField', () => {
    it('should return the right value', () => {
      const mockCaseField = Object.assign(new CaseField(), {
        id: '',
        label: '',
        hint_text: '',
        field_type: Object.assign(new FieldType(), {
          id: '111-111',
          type: 'QueryDocuments',
          min: null,
          max: null,
          regular_expression: null,
          fixed_list_items: [],
          complex_fields: [],
          collection_field_type: Object.assign(new FieldType(), {
            id: 'Document',
            type: 'Document',
            min: null,
            max: null,
            regular_expression: null,
            fixed_list_items: [],
            complex_fields: [],
            collection_field_type: null
          })
        }),
        display_context_parameter: '#COLLECTION(allowInsert,allowUpdate)',
        value: [
          {
            id: '',
            value: {
              document_url: 'https://hmcts.internal/documents/111-111',
              document_filename: 'Document 1',
              document_binary_url: 'https://hmcts.internal/documents/111-111/binary'
            }
          }
        ]
      });

      expect(queryListItem.attachmentsForMockCaseField).toEqual(mockCaseField);
    });
  });
});
