import createSpyObj = jasmine.createSpyObj;
import { HttpHeaders } from '@angular/common/http';
import { waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { CaseField, DocumentData, FieldType } from '../../domain';
import { HttpService } from '../http';
import { DocumentManagementService } from './document-management.service';
import { CaseNotifier } from '../../components/case-editor/services/case.notifier';
import { JurisdictionService } from '../jurisdiction';

describe('DocumentManagementService', () => {
  const DOCUMENT_MANAGEMENT_URL = 'https://www.example.com/binary';
  const REMOTE_DOCUMENT_MANAGEMENT_URL = 'http://docmanagement.ccd.reform/documents';
  const HRS_URL = 'https://manage-case.hmcts.reform.net/hearing-recording';
  const REMOTE_HRS_URL = 'https://em-hrs-api.hmcts.reform.net/hearing-recordings';

  let appConfig: any;
  let httpService: any;
  let caseNotifier: any;
  let jurisdictionService: any;
  let documentManagementService: DocumentManagementService;

  beforeEach(waitForAsync(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', [
      'getDocumentManagementUrl', 'getRemoteDocumentManagementUrl',
      'getHrsUrl', 'getRemoteHrsUrl',
      'getAnnotationApiUrl', 'getDocumentSecureMode', 'getCdamExclusionList', 'getDocumentManagementUrlV2'
    ]);
    appConfig.getRemoteDocumentManagementUrl.and.returnValue(REMOTE_DOCUMENT_MANAGEMENT_URL);
    appConfig.getDocumentManagementUrl.and.returnValue(DOCUMENT_MANAGEMENT_URL);
    appConfig.getRemoteHrsUrl.and.returnValue(REMOTE_HRS_URL);
    appConfig.getHrsUrl.and.returnValue(HRS_URL);
    appConfig.getDocumentSecureMode.and.returnValue(false);
    appConfig.getCdamExclusionList.and.returnValue('');
    caseNotifier = createSpyObj<CaseNotifier>('caseNotifier', ['caseView']);
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['getSelectedJurisdiction']);
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of({ id: 'test-jurisdiction' }));
    httpService = createSpyObj<HttpService>('httpService', ['post']);
    caseNotifier.caseView = of({ case_type: { id: 'test' } });
    documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
  }));

  describe('uploadFile', () => {
    const RESPONSE: DocumentData = {
      _embedded: {
        documents: [{
          originalDocumentName: 'something.pdf',
          _links: {
            self: {
              href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123`
            },
            binary: {
              href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123/binary`
            }
          }
        }]
      },
      documents: [{
        originalDocumentName: 'something.pdf',
        _links: {
          self: {
            href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123`
          },
          binary: {
            href: `${DOCUMENT_MANAGEMENT_URL}/abcd0123/binary`
          }
        }
      }]
    };

    beforeEach(waitForAsync(() => {
      httpService.post.and.returnValue(of(RESPONSE));
    }));

    xit('should use HttpService.post with the correct URL', waitForAsync(() => {
      documentManagementService.uploadFile(new FormData())
        .subscribe(() => {
          expect(httpService.post).toHaveBeenCalledWith(DOCUMENT_MANAGEMENT_URL, jasmine.any(FormData), {
          headers: new HttpHeaders(),
          observe: 'body'
          });
        });
    }));

    it('should return document metadata', waitForAsync(() => {
      documentManagementService.uploadFile(new FormData())
        .subscribe(documentMetadata => {
          expect(documentMetadata).toEqual(RESPONSE);
        });
    }));
  });

  describe('getDocStoreUrl', () => {
    const CASE_TYPE_ID = 'caseType1';
    const NO_EXCLUDED_CASE_TYPE_ID = '';
    const EXCLUDED_CASE_TYPE_ID = 'excludedCaseType';
    const EXCLUDED_CASE_TYPE_ID_MULTIPLE_TYPES = 'excludedCaseType,excludedCaseType2';
    const DOCUMENT_MANAGEMENT_URL = 'https://www.example.com/documents';
    const DOCUMENT_MANAGEMENT_URL_V2 = 'https://www.example.com/documents/v2';

    beforeEach(() => {
      caseNotifier = createSpyObj<CaseNotifier>('caseNotifier', ['caseView']);
      appConfig.getDocumentManagementUrl.and.returnValue(DOCUMENT_MANAGEMENT_URL);
      appConfig.getDocumentManagementUrlV2.and.returnValue(DOCUMENT_MANAGEMENT_URL_V2);
    });

    it('should return DocumentManagementUrlV2 when document secure mode is enabled and case type is not in exclusion list', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(EXCLUDED_CASE_TYPE_ID);
      caseNotifier.caseView = of({ case_type: { id: CASE_TYPE_ID } });
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL_V2);
    });

    it('should return DocumentManagementUrl when document secure mode is enabled and case type is in exclusion list', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(EXCLUDED_CASE_TYPE_ID);
      caseNotifier.caseView = of({ case_type: { id: EXCLUDED_CASE_TYPE_ID } });
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL);
    });

    it('should return DocumentManagementUrl when document secure mode is disabled', () => {
      appConfig.getDocumentSecureMode.and.returnValue(false);
      appConfig.getCdamExclusionList.and.returnValue(EXCLUDED_CASE_TYPE_ID);
      caseNotifier.caseView = of({ case_type: { id: CASE_TYPE_ID } });
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL);
    });

    it('should return DocumentManagementUrlV2 when exclusions contains multiple values and file is not excluded', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(EXCLUDED_CASE_TYPE_ID_MULTIPLE_TYPES);
      caseNotifier.caseView = of({ case_type: { id: 'excludedCaseType3' } });
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL_V2);
    });

    it('should return DocumentManagementUrl when exclusions contains multiple values and file is excluded', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(EXCLUDED_CASE_TYPE_ID_MULTIPLE_TYPES);
      caseNotifier.caseView = of({ case_type: { id: 'excludedCaseType2' } });
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
     const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL);
    });

    it('should handle when there is no files in exclusion list', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(NO_EXCLUDED_CASE_TYPE_ID);
      caseNotifier.caseView = of({ case_type: { id: 'caseType2' } });
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL_V2);
    });

    it('should handle when there is no case in case_notifier', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(NO_EXCLUDED_CASE_TYPE_ID);
      caseNotifier.caseView = of(undefined);
      jurisdictionService.getSelectedJurisdiction.and.returnValue(of({ currentCaseType: { id: 'caseType2' } }));
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      const url = documentManagementService['getDocStoreUrl']();
      expect(url).toBe(DOCUMENT_MANAGEMENT_URL_V2);
    });

    it('should handle when there is no case in case_notifier', () => {
      appConfig.getDocumentSecureMode.and.returnValue(true);
      appConfig.getCdamExclusionList.and.returnValue(NO_EXCLUDED_CASE_TYPE_ID);
      caseNotifier.caseView = of(undefined);
      jurisdictionService.getSelectedJurisdiction.and.returnValue(of(undefined));
      window.history.pushState({}, '', '/case/case-create/test1/test2');
      documentManagementService = new DocumentManagementService(httpService, appConfig, caseNotifier, jurisdictionService);
      expect((documentManagementService as any)['caseTypeId']).toBe('test2');
    });
  });

  describe('Media viewer', () => {
    const FIELD_TYPE: FieldType = {
      id: 'Collection',
      type: 'Collection',
    };
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      field_type: FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: [],
      hidden: false
    }) as CaseField;
    const MEDIA_VIEWER_PDF = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.pdf',
      content_type: 'pdf'
    };
    const MEDIA_VIEWER_IMAGE_JPEG = {
        document_binary_url: 'https://www.example.com/binary',
        document_filename: 'sample.jpeg',
        content_type: 'image'
    };
    const MEDIA_VIEWER_IMAGE_GIF = {
        document_binary_url: 'https://www.example.com/binary',
        document_filename: 'sample.gif',
        content_type: 'image'
    };
    const MEDIA_VIEWER_IMAGE_PNG = {
        document_binary_url: 'https://www.example.com/binary',
        document_filename: 'sample.png',
        content_type: 'image'
    };
    const MEDIA_VIEWER_DOC = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.doc',
      content_type: 'word'
    };
    const MEDIA_VIEWER_DOCX = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.docx',
      content_type: 'word'
    };
    const MEDIA_VIEWER_TXT = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.txt',
      content_type: 'txt'
    };
    const MEDIA_VIEWER_RTF = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.rtf',
      content_type: 'rtf'
    };
    const MEDIA_VIEWER_XLS = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.xls',
      content_type: 'excel'
    };
    const MEDIA_VIEWER_XLSX = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.xlsx',
      content_type: 'excel'
    };
    const MEDIA_VIEWER_NONE = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.',
      content_type: ''
    };
    const MEDIA_VIEWER_UNKNOWN = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample.<tbc>',
      content_type: '<tbc>'
    };
    const MEDIA_VIEWER_NULL = {
      document_binary_url: 'https://www.example.com/binary',
      document_filename: 'sample',
      content_type: '<unknown>'
    };

    it('should return contentType as pdf for the PDF document', () => {
      CASE_FIELD.value.document_filename = 'media.pdf';
      expect(documentManagementService.getContentType(CASE_FIELD.value)).toBe('pdf');
    });

    it('should return media viewer data for PDF contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.pdf';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_PDF));
    });

    it('should return contentType as image for the non-PDF', () => {
      CASE_FIELD.value.document_filename = 'media.jpeg';
      expect(documentManagementService.getContentType(CASE_FIELD.value)).toBe('image');
    });

    it('should return media viewer data for jpeg contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.jpeg';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_IMAGE_JPEG));
    });

    it('should return media viewer data for gif contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.gif';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_IMAGE_GIF));
    });

    it('should return media viewer data for png contentType', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.png';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_IMAGE_PNG));
    });

    it('should return contentType as word for the non-PDF', () => {
      CASE_FIELD.value.document_filename = 'media.doc';
      expect(documentManagementService.getContentType(CASE_FIELD.value)).toBe('word');
    });

    it('should return contentType as docx for the word document', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.docx';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_DOCX));
    });

    it('should return contentType as doc for the word document', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.doc';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_DOC));
    });

    it('should return contentType as xls for the excel document', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.xls';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_XLS));
    });

    it('should return contentType as xlsx for the excel document', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.xlsx';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_XLSX));
    });

    it('should return contentType as txt for the non-PDF document', () => {
      CASE_FIELD.value.document_filename = 'media.txt';
      expect(documentManagementService.getContentType(CASE_FIELD.value)).toBe('txt');
    });

    it('should return contentType as txt for the txt document', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.txt';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_TXT));
    });

    it('should return contentType as rtf for the non-PDF document', () => {
      CASE_FIELD.value.document_filename = 'media.rtf';
      expect(documentManagementService.getContentType(CASE_FIELD.value)).toBe('rtf');
    });

    it('should return contentType as rtf for the rtf document', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.rtf';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_RTF));
    });

    it('should return media viewer data for other content types', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';
      CASE_FIELD.value.document_filename = 'sample.';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_NONE));
      CASE_FIELD.value.document_filename = 'sample';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_NULL));
    });

    it('should return media viewer data for tif content types', () => {
      CASE_FIELD.value.document_binary_url = 'https://www.example.com/binary';

      CASE_FIELD.value.document_filename = 'sample.tif';
      MEDIA_VIEWER_UNKNOWN.document_filename = 'sample.tif';
      MEDIA_VIEWER_UNKNOWN.content_type = 'tif';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_UNKNOWN));

      CASE_FIELD.value.document_filename = 'sample.TiF';
      MEDIA_VIEWER_UNKNOWN.document_filename = 'sample.TiF';
      MEDIA_VIEWER_UNKNOWN.content_type = 'TiF';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_UNKNOWN));

      CASE_FIELD.value.document_filename = 'sample.TFF';
      MEDIA_VIEWER_UNKNOWN.document_filename = 'sample.TFF';
      MEDIA_VIEWER_UNKNOWN.content_type = 'TFF';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_UNKNOWN));

      CASE_FIELD.value.document_filename = 'sample.tiff';
      MEDIA_VIEWER_UNKNOWN.document_filename = 'sample.tiff';
      MEDIA_VIEWER_UNKNOWN.content_type = 'tiff';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_UNKNOWN));

      CASE_FIELD.value.document_filename = 'sample.TiFf';
      MEDIA_VIEWER_UNKNOWN.document_filename = 'sample.TiFf';
      MEDIA_VIEWER_UNKNOWN.content_type = 'TiFf';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_UNKNOWN));

      CASE_FIELD.value.document_filename = 'sample.TIFF';
      MEDIA_VIEWER_UNKNOWN.document_filename = 'sample.TIFF';
      MEDIA_VIEWER_UNKNOWN.content_type = 'TIFF';
      expect(documentManagementService.getMediaViewerInfo(CASE_FIELD.value)).toBe(JSON.stringify(MEDIA_VIEWER_UNKNOWN));
    });
  });
});
