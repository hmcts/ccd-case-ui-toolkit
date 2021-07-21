import { DocumentUrlPipe } from './document-url.pipe';
import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../app.config';

describe('DocumentUrlPipe', () => {
  const DOCUMENT_MANAGEMENT_URL = 'http://localhost:1234/documents';
  const REMOTE_DOCUMENT_MANAGEMENT_PATTERN = '^https://external\\.dm\\.reform/documents';
  const MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL = 'https://external.dm.reform/documents';
  const NON_MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL = 'https://external.evidence.reform/documents';
  const HRS_URL = 'http://localhost:1234/hearing-recordings';
  const REMOTE_HRS_PATTERN = '^https://external\\.dm\\.reform/hearing-recordings';
  const MATCHING_REMOTE_HRS_URL = 'https://external.dm.reform/hearing-recordings';
  const NON_MATCHING_REMOTE_HRS_URL = 'https://external.evidence.reform/hearing-recordings';
  let documentUrlPipe: DocumentUrlPipe;
  let appConfig: any;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', [
      'getDocumentManagementUrl', 'getRemoteDocumentManagementUrl', 'getHrsUrl', 'getRemoteHrsUrl'
    ]);
    appConfig.getDocumentManagementUrl.and.returnValue(DOCUMENT_MANAGEMENT_URL);
    appConfig.getRemoteDocumentManagementUrl.and.returnValue(REMOTE_DOCUMENT_MANAGEMENT_PATTERN);
    appConfig.getHrsUrl.and.returnValue(HRS_URL);
    appConfig.getRemoteHrsUrl.and.returnValue(REMOTE_HRS_PATTERN);
    documentUrlPipe = new DocumentUrlPipe(appConfig);
  });

  describe('given the Document Management URL is the one in the app config', () => {
    it('should be replaced with the Document Management endpoint URL of the API Gateway', () => {
      let url = documentUrlPipe.transform(MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL);
      expect(url).toEqual(DOCUMENT_MANAGEMENT_URL);
    });
  });

  describe('given a document URL matching the remote HRS api', () => {
    it('should be replaced with a relative HRS URL', () => {
      let url = documentUrlPipe.transform(MATCHING_REMOTE_HRS_URL);
      expect(url).toEqual(HRS_URL);
    });
  });

  describe('given the Document Management URL is NOT the one in the app config', () => {
    it('should be left unchanged', () => {
      let url = documentUrlPipe.transform(NON_MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL);
      expect(url).toEqual(NON_MATCHING_REMOTE_DOCUMENT_MANAGEMENT_URL);
    });
  });

  describe('given a document URL not matching the remote HRS api', () => {
    it('should be left unchanged', () => {
      let url = documentUrlPipe.transform(NON_MATCHING_REMOTE_HRS_URL);
      expect(url).toEqual(NON_MATCHING_REMOTE_HRS_URL);
    });
  });
});
