import { CaseQueriesCollection, QueryMessage } from '../../case-queries-collection.model';
import { QueryListData } from './query-list-data.model';

describe('QueryListData', () => {
  let caseMessages: QueryMessage[];
  let caseQueriesCollections: CaseQueriesCollection;
  let queryListData: QueryListData;

  beforeEach(() => {
    caseMessages = [
      {
        id: 'ccd-case-message-id-001',
        value: {
          id: '111-111',
          subject: 'Subject 1',
          name: 'Name 1',
          body: 'Body 1',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date(),
          createdBy: 'Person A'
        }
      },
      {
        id: 'ccd-case-message-id-002',
        value: {
          id: '222-222',
          subject: 'Subject 2',
          name: 'Name 2',
          body: 'Body 2',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date(),
          createdBy: 'Person B',
          parentId: '111-111'
        }
      },
      {
        id: 'ccd-case-message-id-003',
        value: {
          id: '333-333',
          subject: 'Subject 3',
          name: 'Name 3',
          body: 'Body 3',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date(),
          createdBy: 'Person B',
          parentId: '222-222'
        }
      },
      {
        id: 'ccd-case-message-id-004',
        value: {
          id: '444-444',
          subject: 'Subject 4',
          name: 'Name 4',
          body: 'Body 4',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date(),
          createdBy: 'Person B',
          parentId: '333-333'
        }
      },
      {
        id: 'ccd-case-message-id-005',
        value: {
          id: '555-555',
          subject: 'Subject 5',
          name: 'Name 5',
          body: 'Body 5',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date(),
          createdBy: 'Person B',
          parentId: '444-444'
        }
      }
    ];

    caseQueriesCollections = {
      partyName: 'partyName',
      roleOnCase: 'roleOnCase',
      caseMessages
    };

    queryListData = new QueryListData(caseQueriesCollections);
  });


  it('should create an instance with the appropriate fields', () => {
    expect(queryListData.queries.length).toEqual(1);
    expect(queryListData.partyName).toEqual(caseQueriesCollections.partyName);
    expect(queryListData.roleOnCase).toEqual(caseQueriesCollections.roleOnCase);
  });

  it('should set children queries appropriately', () => {
    expect(queryListData.queries[0].children.length).toEqual(1);
    expect(queryListData.queries[0].children[0].id).toEqual('222-222');
  });
});
