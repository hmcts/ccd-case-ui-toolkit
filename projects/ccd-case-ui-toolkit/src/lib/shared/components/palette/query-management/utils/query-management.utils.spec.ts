import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Document, FormDocument } from '../../../../domain';
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
        subject: 'Review attached document',
        name: 'Stuart Smith',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: 'true',
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
        isHearingRelated: 'true',
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
        subject: 'Review attached document',
        name: 'Stuart Smith',
        body: 'Please review attached document and advise if hearing should proceed?',
        attachments: [],
        isHearingRelated: 'true',
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
});
