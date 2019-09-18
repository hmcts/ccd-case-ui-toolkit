import { DocumentManagementService } from './document-management.service';
import createSpyObj = jasmine.createSpyObj;
import { of } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { CaseField, DocumentData, FieldType } from '../../domain';

describe('DocumentManagementService', () => {
  const DOCUMENT_MANAGEMENT_URL = 'https://www.example.com/binary';
  const REMOTE_DOCUMENT_MANAGEMENT_URL = 'http://docmanagement.ccd.reform/documents';

  let appConfig: any;
  let httpService: any;

  let documentManagementService: DocumentManagementService;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', [
      'getDocumentManagementUrl', 'getRemoteDocumentManagementUrl', 'getAnnotationApiUrl']);
    appConfig.getRemoteDocumentManagementUrl.and.returnValue(REMOTE_DOCUMENT_MANAGEMENT_URL);
    appConfig.getDocumentManagementUrl.and.returnValue(DOCUMENT_MANAGEMENT_URL);

    httpService = createSpyObj<HttpService>('httpService', ['post']);
    documentManagementService = new DocumentManagementService(httpService, appConfig);
  });

  describe('uploadFile', () => {
    const RESPONSE: DocumentData = {
      _embedded: {
        documents: [{
          originalDocumentName: 'something.pdf',
          _links: {
            self: {
              href: DOCUMENT_MANAGEMENT_URL + '/abcd0123'
            },
            binary: {
              href: DOCUMENT_MANAGEMENT_URL + '/abcd0123/binary'
            }
          }
        }]
      }
    };

    beforeEach(() => {
      httpService.post.and.returnValue(of(new Response(new ResponseOptions({
        body: JSON.stringify(RESPONSE)
      }))));
    });

    it('should use HttpService.post with the correct URL', () => {
      documentManagementService.uploadFile(new FormData()).subscribe();

      expect(httpService.post).toHaveBeenCalledWith(DOCUMENT_MANAGEMENT_URL, jasmine.any(FormData), jasmine.any(Object));
    });

    it('should set Content-Type header to null', () => {
      documentManagementService.uploadFile(new FormData()).subscribe();
      let headers = httpService.post.calls.mostRecent().args[2].headers;

      expect(headers.get('Content-Type')).toBe(null);
    });

    it('should return document metadata', () => {
      documentManagementService.uploadFile(new FormData())
        .subscribe(documentMetadata => expect(documentMetadata).toEqual(RESPONSE));
    });
  });

  describe('Media viewer', () => {
    const FIELD_TYPE: FieldType = {
      id: 'Collection',
      type: 'Collection',
    };
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      field_type: FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: [],
      hidden: false
    });
    const MEDIA_VIEWER_PDF = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.pdf',
      content_type: 'pdf'
      };
    const MEDIA_VIEWER_IMAGE = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.jpeg',
      content_type: 'image'
    };
    const MEDIA_VIEWER_OTHER = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.doc',
      content_type: null
    };

    it('should return contentType as pdf for the PDF document', () => {
      CASE_FIELD.value.document_filename = 'media.pdf';
      expect(documentManagementService.getContentType(CASE_FIELD)).toBe('pdf');
    });

    it('should return contentType as image for the non-PDF', () => {
      CASE_FIELD.value.document_filename = 'media.jpeg';
      expect(documentManagementService.getContentType(CASE_FIELD)).toBe('image');
    });

    it('should return media viewer data for image contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.jpeg';
      expect(documentManagementService.createMediaViewer(CASE_FIELD)).toBe(JSON.stringify(MEDIA_VIEWER_IMAGE));
    });

    it('should return media viewer data for PDF contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.pdf';
      expect(documentManagementService.createMediaViewer(CASE_FIELD)).toBe(JSON.stringify(MEDIA_VIEWER_PDF));
    });

    it('should return media viewer data for other contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.doc';
      expect(documentManagementService.createMediaViewer(CASE_FIELD)).toBe(JSON.stringify(MEDIA_VIEWER_OTHER));
    });
  });
});
