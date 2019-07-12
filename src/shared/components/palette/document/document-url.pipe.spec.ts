import { DocumentUrlPipe } from './document-url.pipe';
import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../app.config';

describe('DocumentUrlPipe', () => {
  const DOCUMENT_MANAGEMENT_URL = 'http://localhost:1234/documents';
  const REMOTE_DOCUMENT_MANAGEMENT_PATTERN = '^https://external\\.dm\\.reform/documents';
  const MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL = 'https://external.dm.reform/documents';
  const NON_MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL = 'https://external.evidence.reform/documents';
  let documentUrlPipe: DocumentUrlPipe;
  let appConfig: any;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getDocumentManagementUrl', 'getRemoteDocumentManagementUrl']);
    appConfig.getDocumentManagementUrl.and.returnValue(DOCUMENT_MANAGEMENT_URL);
    appConfig.getRemoteDocumentManagementUrl.and.returnValue(REMOTE_DOCUMENT_MANAGEMENT_PATTERN);
    documentUrlPipe = new DocumentUrlPipe(appConfig);
  });

  describe('given the Document Management URL is the one in the app config', () => {
/*  This test will be uncommented once the hardcoded URLs in transform method is removed
    it('should be replaced with the Document Management endpoint URL of the API Gateway', () => {
      let url = documentUrlPipe.transform(MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL);
      expect(url).toEqual(DOCUMENT_MANAGEMENT_URL);
    });
*/
  });

  describe('given the Document Management URL is NOT the one in the app config', () => {
    it('should be left unchanged', () => {
      let url = documentUrlPipe.transform(NON_MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL);
      expect(url).toEqual(NON_MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL);
    });
  });
});
