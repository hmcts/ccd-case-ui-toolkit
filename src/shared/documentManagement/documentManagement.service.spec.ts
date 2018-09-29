import { DocumentManagementService } from './documentManagement.service';
import createSpyObj = jasmine.createSpyObj;
import { AppConfig } from '../app.config';
import { HttpService } from '../http/http.service';
import { DocumentData } from '../../shared/domain/document/document-data.model';
import { of } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';

describe('DocumentManagementService', () => {
  const DOCUMENT_MANAGEMENT_URL = 'http://docmanagement.ccd.reform/documents';

  let appConfig: any;
  let httpService: any;

  let documentManagementService: DocumentManagementService;

  beforeEach(() => {
    appConfig = createSpyObj<AppConfig>('appConfig', ['getDocumentManagementUrl']);
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
});
