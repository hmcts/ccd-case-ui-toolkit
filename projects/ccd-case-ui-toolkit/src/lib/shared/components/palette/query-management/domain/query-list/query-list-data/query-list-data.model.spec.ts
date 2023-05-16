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
      {
        id: '444-444',
        subject: 'Subject 4',
        name: 'Name 4',
        body: 'Body 4',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date(),
        createdBy: 'Person B',
        parentId: '333-333',
      },
      {
        id: '555-555',
        subject: 'Subject 5',
        name: 'Name 5',
        body: 'Body 5',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date(),
        createdBy: 'Person B',
        parentId: '444-444',
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
    expect(queryListData.partyMessages.length).toEqual(1);
    expect(queryListData.partyName).toEqual(partyMessagesGroups.partyName);
    expect(queryListData.roleOnCase).toEqual(partyMessagesGroups.roleOnCase);
  });

  it('should set children partyMessages appropriately', () => {
    expect(queryListData.partyMessages[0].children.length).toEqual(2);
    expect(queryListData.partyMessages[0].children[0].id).toEqual('222-222');
  });

  it('should set children of children partyMessages appropriately', () => {
    const secondChildrenOfTheFirstParentMessage = queryListData.partyMessages[0].children[1];
    expect(secondChildrenOfTheFirstParentMessage.children.length).toEqual(1);
    expect(secondChildrenOfTheFirstParentMessage.children[0].id).toEqual('444-444');

    const firstChildrenOfTheSecondChildrenOfTheFirstParentMessage = secondChildrenOfTheFirstParentMessage.children[0];
    expect(firstChildrenOfTheSecondChildrenOfTheFirstParentMessage.children.length).toEqual(1);
    expect(firstChildrenOfTheSecondChildrenOfTheFirstParentMessage.children[0].id).toEqual('555-555');
  });
});
