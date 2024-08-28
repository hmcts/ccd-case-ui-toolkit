import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseField, Document, FieldType, FormDocument } from '../../../../domain';
import { QueryListItem } from '../models';
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
        attachments: new FormControl([])
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
      const caseMessageResult = QueryManagementUtils.getNewQueryData(formGroup, currentUserDetails);
      expect(caseMessageResult.subject).toEqual(caseMessage.subject);
      expect(caseMessageResult.body).toEqual(caseMessage.body);
      expect(caseMessageResult.isHearingRelated).toEqual(caseMessage.isHearingRelated);
      expect(caseMessageResult.hearingDate).toEqual(caseMessage.hearingDate);
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
        attachments: new FormControl([])
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
      const caseMessageResult = QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, currentUserDetails);
      expect(caseMessageResult.subject).toEqual(caseMessage.subject);
      expect(caseMessageResult.body).toEqual(caseMessage.body);
      expect(caseMessageResult.isHearingRelated).toEqual(caseMessage.isHearingRelated);
      expect(caseMessageResult.hearingDate).toEqual(caseMessage.hearingDate);
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
      const result = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField, caseField.id);
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

      const result = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField, caseField.id);
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
      const result = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField, caseField.id);
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
});
