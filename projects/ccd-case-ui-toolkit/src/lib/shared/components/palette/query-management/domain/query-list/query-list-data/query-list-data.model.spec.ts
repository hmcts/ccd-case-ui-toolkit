import { PartyMessage } from '../../party-messages/party-message.model';
import { PartyMessagesGroup } from '../../party-messages/party-messages-group.model';
import { QueryListData } from './query-list-data.model';
describe('QueryListData', () => {
  let partyMessages: PartyMessage[];
  let partyMessagesGroups: PartyMessagesGroup;
  let queryListData: QueryListData;

  beforeEach(() => {
    partyMessages = [
      {
        id: '111-111',
        subject: 'Subject 1',
        name: 'Name 1',
        body: 'Body 1',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date(),
        createdBy: 'Person A',
      },
      {
        id: '222-222',
        subject: 'Subject 2',
        name: 'Name 2',
        body: 'Body 2',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date(),
        createdBy: 'Person B',
        parentId: '111-111',
      },
      {
        id: '333-333',
        subject: 'Subject 3',
        name: 'Name 3',
        body: 'Body 3',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date(),
        createdBy: 'Person B',
        parentId: '111-111',
      },
    ];
    partyMessagesGroups = {
      partyName: 'partyName',
      roleOnCase: 'roleOnCase',
      partyMessages
    };

    queryListData = new QueryListData(partyMessagesGroups);
  });


  it('should create an instance with the appropriate fields', () => {
    expect(queryListData.partyName).toEqual(partyMessagesGroups.partyName);
    expect(queryListData.roleOnCase).toEqual(partyMessagesGroups.roleOnCase);
  });

  it('should set children partyMessages appropriately', () => {
    expect(queryListData.partyMessages.length).toEqual(1);
    expect(queryListData.partyMessages[0].children.length).toEqual(2);
    expect(queryListData.partyMessages[0].children[0].id).toEqual('222-222');
  });
});
