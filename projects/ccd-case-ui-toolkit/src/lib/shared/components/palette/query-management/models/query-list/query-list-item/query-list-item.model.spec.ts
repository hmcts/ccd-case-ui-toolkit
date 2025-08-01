import { QueryCreateContext } from '../../..';
import { QueryItemResponseStatus } from '../../../enums';
import { QueryListItem } from './query-list-item.model';

describe('QueryListItem', () => {
  let queryListItem: QueryListItem;
  let lastSubmittedBy: QueryListItem;

  const YES = 'Yes';
  const NO = 'No';

  beforeEach(() => {
    const items = [
      {
        id: '38cfd628-755a-4ce9-9dfd-271a0498504b',
        subject: 'aaA',
        name: 'dsf dsfa',
        body: 'aaa',
        attachments: [],
        isHearingRelated: 'No',
        hearingDate: '',
        createdOn: new Date('2025-05-15T07:24:12Z'),
        createdBy: 'd7fac049-ca0c-42f4-b44e-c63982c98214',
        parentId: 'a6406906-0eb8-493c-af4d-a2a199252023',
        children: []
      },
      {
        id: '5f28f918-e263-4076-996e-fa2b5a80faf6',
        subject: 'tie',
        name: 'dsf dsfa',
        body: 'tie',
        attachments: [],
        isHearingRelated: 'No',
        hearingDate: '',
        createdOn: new Date('2025-05-14T15:46:08Z'),
        createdBy: 'd7fac049-ca0c-42f4-b44e-c63982c98214',
        parentId: 'a6406906-0eb8-493c-af4d-a2a199252023',
        children: []
      },
      {
        id: '85fad5eb-f60a-4a0e-b080-83bd7672e245',
        subject: 'test',
        name: 'CTSCAdminNationalGA WaUpload',
        body: 'test',
        attachments: [],
        isHearingRelated: 'No',
        hearingDate: '',
        createdOn: new Date('2025-04-02T10:02:44Z'),
        createdBy: 'ce6d172b-7c7d-4e2d-b1d7-b7d343dfb6b0',
        parentId: 'a6406906-0eb8-493c-af4d-a2a199252023',
        children: []
      },
      {
        id: 'latest-message',
        subject: 'Final response',
        name: 'dsf dsfa',
        body: 'Final body',
        attachments: [],
        isHearingRelated: 'No',
        hearingDate: '',
        createdOn: new Date('2025-06-01T10:00:00'),
        createdBy: 'd7fac049-ca0c-42f4-b44e-c63982c98214',
        parentId: 'a6406906-0eb8-493c-af4d-a2a199252023',
        children: []
      }
    ];

    const childrenItems = items.map((item, index) => {
      const listItem = new QueryListItem();
      Object.assign(listItem, item);
      listItem.messageIndexInParent = index;
      return listItem;
    });

    queryListItem = new QueryListItem();
    Object.assign(queryListItem, {
      id: 'a6406906-0eb8-493c-af4d-a2a199252023',
      subject: 'test',
      name: 'dsf dsfa',
      body: 'test',
      attachments: [],
      isHearingRelated: 'No',
      hearingDate: '',
      createdOn: new Date('2025-04-02T10:01:26Z'),
      createdBy: 'd7fac049-ca0c-42f4-b44e-c63982c98214',
      children: childrenItems
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
      const index = 1;

      expect(queryListItem.lastSubmittedBy).toEqual(queryListItem.children[index].name);
    });
  });

  describe('lastSubmittedDate', () => {
    it('should return the date of the lastSubmittedMessage', () => {
      expect(queryListItem.lastSubmittedDate).toEqual(lastSubmittedBy.createdOn);
    });

    it('should return lastSubmittedMessage.createdOn when only one child and no messageType', () => {
      const child = new QueryListItem();
      child.createdOn = new Date('2025-07-01T10:00:00Z');
      // No messageType defined

      queryListItem.children = [child];

      expect(queryListItem.lastSubmittedDate).toEqual(queryListItem.lastSubmittedMessage.createdOn);
    });

    it('should return lastChild.createdOn when all children are FOLLOWUP and no RESPOND exists', () => {
      const child1 = new QueryListItem();
      child1.messageType = QueryCreateContext.FOLLOWUP;
      child1.createdOn = new Date('2025-07-05T10:00:00Z');

      const child2 = new QueryListItem();
      child2.messageType = QueryCreateContext.FOLLOWUP;
      child2.createdOn = new Date('2025-07-10T10:00:00Z');

      queryListItem.children = [child1, child2];

      expect(queryListItem.lastSubmittedDate).toEqual(child2.createdOn);
    });

    it('should return lastChild.createdOn when last is FOLLOWUP and a RESPOND exists', () => {
      const respond = new QueryListItem();
      respond.messageType = QueryCreateContext.RESPOND;
      respond.createdOn = new Date('2025-07-01T10:00:00Z');

      const followUp = new QueryListItem();
      followUp.messageType = QueryCreateContext.FOLLOWUP;
      followUp.createdOn = new Date('2025-07-12T10:00:00Z');

      queryListItem.children = [respond, followUp];

      expect(queryListItem.lastSubmittedDate).toEqual(followUp.createdOn);
    });

    it('should return last FOLLOWUP when types are mixed but no RESPOND', () => {
      const child1 = new QueryListItem();
      child1.messageType = QueryCreateContext.FOLLOWUP;
      child1.createdOn = new Date('2025-07-01T10:00:00Z');

      const child2 = new QueryListItem();
      child2.messageType = 'OTHER';
      child2.createdOn = new Date('2025-07-03T10:00:00Z');

      const child3 = new QueryListItem();
      child3.messageType = 'OTHER';
      child3.createdOn = new Date('2025-07-05T10:00:00Z');

      queryListItem.children = [child1, child2, child3];


      expect(queryListItem.lastSubmittedDate).toEqual(child1.createdOn);
    });

    it('should return the last FOLLOWUP when RESPOND and FOLLOWUP are mixed and last is FOLLOWUP', () => {
      const child1 = new QueryListItem();
      child1.messageType = QueryCreateContext.RESPOND;
      child1.createdOn = new Date('2025-07-01T10:00:00Z');

      const child2 = new QueryListItem();
      child2.messageType = QueryCreateContext.FOLLOWUP;
      child2.createdOn = new Date('2025-07-05T10:00:00Z');

      const child3 = new QueryListItem();
      child3.messageType = QueryCreateContext.FOLLOWUP;
      child3.createdOn = new Date('2025-07-09T10:00:00Z');

      const child4 = new QueryListItem();
      child4.messageType = QueryCreateContext.RESPOND;
      child4.createdOn = new Date('2025-07-10T10:00:00Z');

      queryListItem.children = [child1, child2, child3, child4];

      // Should return last FOLLOWUP date (2025-07-09)
      expect(queryListItem.lastSubmittedDate).toEqual(child3.createdOn);
    });

    it('should use parity index when all children lack messageType', () => {
      const child1 = new QueryListItem();
      child1.createdOn = new Date('2025-07-01T10:00:00Z');

      const child2 = new QueryListItem();
      child2.createdOn = new Date('2025-07-03T10:00:00Z');

      const child3 = new QueryListItem();
      child3.createdOn = new Date('2025-07-05T10:00:00Z');

      queryListItem.children = [child1, child2, child3];

      // Odd length = 3 → index = 1 → child2
      expect(queryListItem.lastSubmittedDate).toEqual(child2.createdOn);
    });

    it('should fallback to lastSubmittedMessage when RESPOND exists but no FOLLOWUP', () => {
      const child1 = new QueryListItem();
      child1.messageType = QueryCreateContext.RESPOND;
      child1.createdOn = new Date('2025-07-01T10:00:00Z');

      const child2 = new QueryListItem();
      child2.messageType = QueryCreateContext.RESPOND;
      child2.createdOn = new Date('2025-07-08T10:00:00Z');

      queryListItem.children = [child1, child2];

      expect(queryListItem.lastSubmittedDate).toEqual(queryListItem.lastSubmittedMessage.createdOn);
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
      expect(queryListItem.lastResponseDate).toEqual(new Date('2025-04-02T10:02:44Z'));
    });

    it('should return empty string when it has no children', () => {
      queryListItem.children = [];
      expect(queryListItem.children).toEqual([]);
      expect(queryListItem.lastResponseDate).toEqual(null);
    });
  });

  describe('responseStatus', () => {
    it('should return "AWAITING RESPONSE" when it has children', () => {
      expect(queryListItem.children.length).toBeGreaterThan(0);
      expect(queryListItem.responseStatus).toEqual(QueryItemResponseStatus.AWAITING);
    });

    it('should return "No response required" when it has no children', () => {
      queryListItem.children = [];
      expect(queryListItem.children).toEqual([]);
      expect(queryListItem.responseStatus).toEqual(QueryItemResponseStatus.AWAITING);
    });

    it('should return "Awaiting Response" when it has children and is for Follow up question', () => {
      // Create additional child items
      const additionalChildren = [
        new QueryListItem(),
        new QueryListItem(),
        new QueryListItem(),
        new QueryListItem()
      ].map((child, index) => {
        Object.assign(child, {
          id: `child-${index + 1}`,
          subject: `Subject ${index + 2}`,
          name: `Name ${index + 2}`,
          body: `Body ${index + 2}`,
          attachments: [],
          isHearingRelated: false,
          hearingDate: '',
          createdOn: new Date(`2021-0${index + 2}-01`),
          createdBy: `Person ${String.fromCharCode(65 + index + 1)}`,
          parentId: queryListItem.id,
          children: []
        });
        return child;
      });

      // Assign these new children to queryListItem
      queryListItem.children = additionalChildren;
      expect(queryListItem.children.length).toEqual(4);
      expect(queryListItem.responseStatus).toEqual(QueryItemResponseStatus.AWAITING);
    });

    it('should calculate responseStatus for child based on messageIndexInParent', () => {
      const child1 = new QueryListItem();
      child1.messageIndexInParent = 0;
      expect(child1.responseStatus).toEqual(QueryItemResponseStatus.RESPONDED);

      const child2 = new QueryListItem();
      child2.messageIndexInParent = 1;
      expect(child2.responseStatus).toEqual(QueryItemResponseStatus.AWAITING);
    });

    it('should return CLOSED if the item is closed', () => {
      queryListItem.isClosed = YES;
      expect(queryListItem.responseStatus).toBe(QueryItemResponseStatus.CLOSED);
    });

    it('should return CLOSED if any child is closed', () => {
      queryListItem.isClosed = NO;
      queryListItem.children[2].isClosed = YES;
      expect(queryListItem.responseStatus).toBe(QueryItemResponseStatus.CLOSED);
    });

    it('should return RESPONDED if the last messageType is RESPOND', () => {
      queryListItem.isClosed = NO;
      queryListItem.children[queryListItem.children.length - 1].messageType = QueryCreateContext.RESPOND;
      expect(queryListItem.responseStatus).toBe(QueryItemResponseStatus.RESPONDED);
    });

    it('should return AWAITING if the last messageType is FOLLOWUP', () => {
      queryListItem.isClosed = NO;
      queryListItem.children[queryListItem.children.length - 1].messageType = QueryCreateContext.FOLLOWUP;
      expect(queryListItem.responseStatus).toBe(QueryItemResponseStatus.AWAITING);
    });

    it('should return undefined if no children and item is not closed', () => {
      queryListItem.isClosed = NO;
      queryListItem.children = [];
      expect(queryListItem.responseStatus).toBe(QueryItemResponseStatus.AWAITING);
    });

    it('should return CLOSED if deeply nested child is closed', () => {
      const deepChild = new QueryListItem();
      deepChild.isClosed = YES;

      const intermediate = new QueryListItem();
      intermediate.isClosed = NO;
      intermediate.children = [deepChild];

      queryListItem.children = [intermediate];
      queryListItem.isClosed = NO;

      expect(queryListItem.responseStatus).toBe(QueryItemResponseStatus.CLOSED);
    });
  });
});
