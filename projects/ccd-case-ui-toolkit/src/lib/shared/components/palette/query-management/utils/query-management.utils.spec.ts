import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseField, Document, FieldType, FormDocument } from '../../../../domain';
import { QueryCreateContext, QueryListItem } from '../models';
import { QueryManagementUtils } from './query-management.utils';

describe('QueryManagementUtils', () => {
  describe('documentToCollectionFormDocument', () => {
    it('should return a FormDocument', () => {
      const document: Document = {
        _links: {
          self: {
            href: 'http://testurl.hmcts/test.pdf'
          },
          binary: {
            href: 'http://testurl.hmcts/test.pdf/binary'
          }
        },
        originalDocumentName: 'test.pdf'
      };

      const formDocument: { id: string; value: FormDocument } = QueryManagementUtils.documentToCollectionFormDocument(document);

      expect(formDocument).toEqual({
        id: null,
        value: {
          document_filename: 'test.pdf',
          document_url: 'http://testurl.hmcts/test.pdf',
          document_binary_url: 'http://testurl.hmcts/test.pdf/binary'
        }
      });
    });
  });

  describe('CaseMessage', () => {
    const currentUserDetails = {
      uid: '1111-2222-3333-4444',
      name: 'Stuart Smith'
    };

    it('should return case message data for new query', () => {
      const formGroup = new FormGroup({
        subject: new FormControl('Review attached document', Validators.required),
        body: new FormControl('Please review attached document and advise if hearing should proceed?', Validators.required),
        isHearingRelated: new FormControl('true', Validators.required),
        hearingDate: new FormControl('2023-10-23'),
        attachments: new FormControl([]),
        closeQuery: new FormControl(false)
      });
      const isHmctsStaff = 'No';

      const caseMessage = {
        id: 'test',
        subject: 'Review attached document',
        name: 'Stuart Smith',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: 'Yes',
        hearingDate: '2023-10-23',
        createdOn: new Date(),
        createdBy: '1111-2222-3333-4444'
      };
      const caseMessageResult = QueryManagementUtils.getNewQueryData(formGroup, currentUserDetails, isHmctsStaff);
      expect(caseMessageResult.subject).toEqual(caseMessage.subject);
      expect(caseMessageResult.body).toEqual(caseMessage.body);
      expect(caseMessageResult.isHearingRelated).toEqual(caseMessage.isHearingRelated);
      expect(caseMessageResult.hearingDate).toEqual(caseMessage.hearingDate);
    });

    it('should return case message data for new query for HMCTS staff', () => {
      const formGroup = new FormGroup({
        subject: new FormControl('Review attached document', Validators.required),
        body: new FormControl('Please review attached document and advise if hearing should proceed?', Validators.required),
        isHearingRelated: new FormControl('true', Validators.required),
        hearingDate: new FormControl('2023-10-23'),
        attachments: new FormControl([]),
        closeQuery: new FormControl(false)
      });
      const isHmctsStaff = 'Yes';

      const caseMessage = {
        id: 'test',
        subject: 'Review attached document',
        name: 'Stuart Smith',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: 'Yes',
        hearingDate: '2023-10-23',
        createdOn: new Date(),
        createdBy: '1111-2222-3333-4444'
      };
      const caseMessageResult = QueryManagementUtils.getNewQueryData(formGroup, currentUserDetails, isHmctsStaff);
      expect(caseMessageResult.subject).toEqual(caseMessage.subject);
      expect(caseMessageResult.body).toEqual(caseMessage.body);
      expect(caseMessageResult.isHearingRelated).toEqual(caseMessage.isHearingRelated);
      expect(caseMessageResult.hearingDate).toEqual(caseMessage.hearingDate);
      expect(caseMessageResult.isHmctsStaff).toEqual('Yes');
    });

    it('should return case message data for respond or followup query', () => {
      const queryItem: QueryListItem = {
        id: '1234-1234-1234',
        subject: 'Review attached document',
        name: 'Stuart Smith',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: 'Yes',
        hearingDate: '2023-10-23',
        createdOn: new Date(),
        createdBy: '1111-2222-3333-4444',
        children: [],
        lastSubmittedMessage: new QueryListItem(),
        lastSubmittedBy: '',
        lastSubmittedDate: undefined,
        lastResponseBy: '',
        lastResponseDate: undefined,
        responseStatus: null
      };
      const formGroup = new FormGroup({
        body: new FormControl('Please review attached document and advise if hearing should proceed?', Validators.required),
        attachments: new FormControl([]),
        closeQuery: new FormControl(false)
      });
      const caseMessage = {
        id: 'test',
        subject: 'Review attached document',
        name: 'Stuart Smith',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: 'Yes',
        hearingDate: '2023-10-23',
        createdOn: new Date(),
        createdBy: '1111-2222-3333-4444'
      };
      const caseMessageResult = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, currentUserDetails, undefined, 'No');
      expect(caseMessageResult.subject).toEqual(caseMessage.subject);
      expect(caseMessageResult.body).toEqual(caseMessage.body);
      expect(caseMessageResult.isHearingRelated).toEqual(caseMessage.isHearingRelated);
      expect(caseMessageResult.hearingDate).toEqual(caseMessage.hearingDate);
    });

    it('should return "Yes" for isClosed when closeQuery is true', () => {
      const queryItem: QueryListItem = {
        id: '1234-1234-1234',
        subject: 'Follow up',
        name: 'Stuart Smith',
        body: 'Body',
        attachments: [],
        isHearingRelated: 'Yes',
        hearingDate: '2023-10-23',
        createdOn: new Date(),
        createdBy: '1111-2222-3333-4444',
        children: [],
        lastSubmittedMessage: new QueryListItem(),
        lastSubmittedBy: '',
        lastSubmittedDate: undefined,
        lastResponseBy: '',
        lastResponseDate: undefined,
        responseStatus: null
      };

      const formGroup = new FormGroup({
        body: new FormControl('Follow-up body'),
        attachments: new FormControl([]),
        closeQuery: new FormControl(true)
      });

      const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, currentUserDetails, QueryCreateContext.RESPOND, 'Yes');
      expect(result.isClosed).toBe('Yes');
    });

    it('should fallback to "id" if uid is not present', () => {
      const userWithIdOnly = { id: 'fallback-user-id', name: 'Alt Name' };

      const formGroup = new FormGroup({
        subject: new FormControl('Test Subject'),
        body: new FormControl('Test Body'),
        isHearingRelated: new FormControl(false),
        hearingDate: new FormControl(null),
        attachments: new FormControl([]),
        closeQuery: new FormControl(false)
      });
      const isHmctsStaff = 'No';

      const result = QueryManagementUtils.getNewQueryData(formGroup, userWithIdOnly, isHmctsStaff);
      expect(result.createdBy).toBe('fallback-user-id');
      expect(result.name).toBe('Alt Name');
    });

    it('should fallback to forename + surname if name is not provided', () => {
      const userWithNames = {
        uid: 'uid-xyz',
        forename: 'Lisa',
        surname: 'Brown'
      };

      const formGroup = new FormGroup({
        subject: new FormControl('Another Subject'),
        body: new FormControl('Another Body'),
        isHearingRelated: new FormControl(false),
        hearingDate: new FormControl(null),
        attachments: new FormControl([]),
        closeQuery: new FormControl(false)
      });
      const isHmctsStaff = 'No';
      const result = QueryManagementUtils.getNewQueryData(formGroup, userWithNames, isHmctsStaff);
      expect(result.name).toBe('Lisa Brown');
      expect(result.createdBy).toBe('uid-xyz');
    });
  });

  describe('extractCaseQueriesFromCaseField', () => {
    it('should return value for Complex type field when id matches caseLevelCaseFieldId', () => {
      const caseField = {
        id: 'qmCaseQueriesCollection',
        field_type: {
          id: 'CaseQueriesCollection',
          type: QueryManagementUtils.FIELD_TYPE_COMPLEX
        } as FieldType,
        value: {
          caseMessages: [{
            id: '42ea7fd3-178c-4584-b48b-f1275bf1804f',
            value: {
              attachments: [],
              body: 'testing by olu',
              createdBy: '120b3665-0b8a-4e80-ace0-01d8d63c1005',
              createdOn: '2024-08-27T15:44:50.700Z',
              hearingDate: '2023-01-10',
              id: null,
              isHearingRelated: 'Yes',
              name: 'Piran Sam',
              parentId: 'ca',
              subject: 'Review attached document'
            }
          }],
          partyName: '',
          roleOnCase: ''
        }
      } as CaseField;
      const result = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
      expect(result).toEqual(caseField.value);
    });

    it('should return value for Complex type field when value is a non-empty object', () => {
      const caseField = {
        id: 'qmCaseQueriesCollection',
        field_type: {
          id: 'CaseQueriesCollection',
          type: QueryManagementUtils.FIELD_TYPE_COMPLEX
        } as FieldType,
        value: null
      } as CaseField;

      const result = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
      expect(result).toEqual(caseField.value);
    });

    it('should return null for Collection type field', () => {
      const caseField = {
        id: 'qmCaseQueriesCollection',
        field_type: {
          id: 'CaseQueriesCollection',
          type: QueryManagementUtils.FIELD_TYPE_COMPLEX
        } as FieldType,
        value: null
      } as CaseField;
      const result = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
      expect(result).toEqual(null);
    });
  });

  describe('isNonEmptyObject', () => {
    it('should return true for non-empty object', () => {
      const obj = { key: 'value' };
      const result = QueryManagementUtils.isNonEmptyObject(obj);
      expect(result).toBeTruthy();
    });

    it('should return false for empty object', () => {
      const obj = {};
      const result = QueryManagementUtils.isNonEmptyObject(obj);
      expect(result).toBeFalsy();
    });

    it('should return false for non-object types', () => {
      expect(QueryManagementUtils.isNonEmptyObject(null)).toBeFalsy();
      expect(QueryManagementUtils.isNonEmptyObject(undefined)).toBeFalsy();
      expect(QueryManagementUtils.isNonEmptyObject('string')).toBeFalsy();
      expect(QueryManagementUtils.isNonEmptyObject(123)).toBeFalsy();
      expect(QueryManagementUtils.isNonEmptyObject([])).toBeFalsy();
    });
  });

  describe('QueryManagementUtils methods', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      formGroup = new FormGroup({
        body: new FormControl('Test body'),
        subject: new FormControl('Test subject'),
        attachments: new FormControl([]),
        isHearingRelated: new FormControl(false),
        hearingDate: new FormControl(null),
        closeQuery: new FormControl(false)
      });
    });

    describe('getNewQueryData', () => {
      it('should use uid and name if available', () => {
        const user = { uid: 'user-123', name: 'Alice Smith' };
        const isHmctsStaff = 'No';
        const result = QueryManagementUtils.getNewQueryData(formGroup, user, isHmctsStaff);
        expect(result.createdBy).toBe('user-123');
        expect(result.name).toBe('Alice Smith');
      });

      it('should fallback to id and forename + surname', () => {
        const user = { id: 'user-456', forename: 'Bob', surname: 'Jones' };
        const isHmctsStaff = 'No';
        const result = QueryManagementUtils.getNewQueryData(formGroup, user, isHmctsStaff);
        expect(result.createdBy).toBe('user-456');
        expect(result.name).toBe('Bob Jones');
      });
    });

    describe('getRespondOrFollowupQueryData', () => {
      const queryItem = new QueryListItem();
      queryItem.subject = 'Follow up';
      queryItem.id = 'query-001';
      queryItem.isHearingRelated = 'Yes';
      queryItem.hearingDate = '2025-07-01';

      const hmctsStaff = 'Yes';
      const nonHmctsStaff = 'No';

      it('should set isClosed to Yes when closeQuery is true', () => {
        formGroup.get('closeQuery').setValue(true);
        const user = { uid: 'x', name: 'Y' };
        const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, user, QueryCreateContext.RESPOND, hmctsStaff);
        expect(result.isClosed).toBe('Yes');
      });

      it('should set isClosed to No when closeQuery is false', () => {
        formGroup.get('closeQuery').setValue(false);
        const user = { uid: 'x', name: 'Y' };
        const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, user, QueryCreateContext.RESPOND, hmctsStaff);
        expect(result.isClosed).toBe('No');
      });

      it('should fallback to forename + surname when name is missing', () => {
        const user = { uid: 'u9', forename: 'Charlie', surname: 'Doe' };
        const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, user, QueryCreateContext.RESPOND, hmctsStaff);
        expect(result.name).toBe('Charlie Doe');
      });
      it('should set messageType as RESPOND if passed as RESPOND', () => {
        const queryItem = new QueryListItem();
        queryItem.subject = 'Sub';
        queryItem.id = 'q1';
        queryItem.isHearingRelated = 'No';
        queryItem.hearingDate = '';

        const user = { uid: 'abc123', name: 'Test User' };
        const formGroup = new FormGroup({
          body: new FormControl('Response body'),
          attachments: new FormControl([]),
          closeQuery: new FormControl(false)
        });

        const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, user, QueryCreateContext.RESPOND, hmctsStaff);
        expect(result.messageType).toBe(QueryCreateContext.RESPOND);
      });

      it('should set messageType as FOLLOWUP if passed as FOLLOWUP', () => {
        const queryItem = new QueryListItem();
        queryItem.subject = 'Sub';
        queryItem.id = 'q1';
        queryItem.isHearingRelated = 'No';
        queryItem.hearingDate = '';

        const user = { uid: 'abc123', name: 'Test User' };
        const formGroup = new FormGroup({
          body: new FormControl('Follow-up body'),
          attachments: new FormControl([]),
          closeQuery: new FormControl(false)
        });

        const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, user, QueryCreateContext.FOLLOWUP, nonHmctsStaff);
        expect(result.messageType).toBe(QueryCreateContext.FOLLOWUP);
      });

      it('should set messageType as undefined if invalid type is passed', () => {
        const queryItem = new QueryListItem();
        queryItem.subject = 'Sub';
        queryItem.id = 'q1';
        queryItem.isHearingRelated = 'No';
        queryItem.hearingDate = '';

        const user = { uid: 'abc123', name: 'Test User' };
        const formGroup = new FormGroup({
          body: new FormControl('Some body'),
          attachments: new FormControl([]),
          closeQuery: new FormControl(false)
        });

        const result = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, user, 'INVALID_TYPE', nonHmctsStaff);
        expect(result.messageType).toBeUndefined();
      });
    });
  });
});
