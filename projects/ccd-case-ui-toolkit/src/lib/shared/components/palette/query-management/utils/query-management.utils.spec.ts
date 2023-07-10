import { Document, FormDocument } from '../../../../domain';
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
});
