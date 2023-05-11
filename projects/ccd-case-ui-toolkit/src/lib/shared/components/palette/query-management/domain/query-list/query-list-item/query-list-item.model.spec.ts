import { PartyMessage } from '../../party-messages/party-message.model';
import { QueryListResponseStatus } from '../query-list-response-status.enum';
import { QueryListItem } from './query-list-item.model';

describe('QueryListItem', () => {
  let queryListItem: QueryListItem;
  let children: PartyMessage[];

  beforeEach(() => {
    children = [
      {
        id: '222-222',
        subject: '',
        name: 'Name 2',
        body: 'Body 2',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-02-01'),
        createdBy: 'Person B',
        parentId: '111-111',
      },
      {
        id: '333-333',
        subject: '',
        name: 'Name 3',
        body: 'Body 2',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-03-01'),
        createdBy: 'Person B',
        parentId: '111-111',
      }
    ];

    queryListItem = new QueryListItem();
    Object.assign(queryListItem, {
      id: '111-111',
      subject: 'Subject 1',
      name: 'Name 1',
      body: 'Body 1',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2021-01-01'),
      createdBy: 'Person A',
      children
    });
  });

  describe('lastSubmittedMessage', () => {
    it('should return the last submitted message', () => {
      // @ts-expect-error - private property
      expect(queryListItem.lastSubmittedMessage).toEqual(children[1]);
    });

    it('should return the message itself if there are no children', () => {
      queryListItem.children = [];
      // @ts-expect-error - private property
      expect(queryListItem.lastSubmittedMessage).toBe(queryListItem);
    });
  });

  describe('lastSubmittedBy', () => {
    it('should return the name of the person of the lastSubmittedMessage', () => {
      expect(queryListItem.lastSubmittedBy).toEqual(children[1].name);
    });
  });

  describe('lastSubmittedDate', () => {
    it('should return the date of the lastSubmittedMessage', () => {
      expect(queryListItem.lastSubmittedDate).toEqual(children[1].createdOn);
    });
  });

  describe('lastResponseBy', () => {
    it('should return the name of the person of the lastSubmittedMessage when it has children', () => {
      expect(queryListItem.children.length).toBeGreaterThan(0);
      expect(queryListItem.lastResponseBy).toEqual(children[1].name);
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
      expect(queryListItem.lastResponseDate).toEqual(children[1].createdOn);
    });

    it('should return empty string when it has no children', () => {
      queryListItem.children = [];
      expect(queryListItem.children).toEqual([]);
      expect(queryListItem.lastResponseDate).toEqual(null);
    });
  });

  describe('responseStatus', () => {
    it('should return "Responded" when it has children', () => {
      expect(queryListItem.children.length).toBeGreaterThan(0);
      expect(queryListItem.responseStatus).toEqual(QueryListResponseStatus.RESPONDED);
    });

    it('should return "No response required" when it has no children', () => {
      queryListItem.children = [];
      expect(queryListItem.children).toEqual([]);
      expect(queryListItem.responseStatus).toEqual(QueryListResponseStatus.NEW);
    });
  });
});
