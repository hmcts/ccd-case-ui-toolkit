import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { DocumentData } from '../../domain/document/document-data.model';
import { HttpService } from '../http';
import { SessionStorageService } from '../session';

@Injectable()
export class DocumentManagementService {
  private static readonly PDF = 'pdf';
  private static readonly IMAGE = 'image';
  private static readonly WORD = 'word';
  private static readonly EXCEL = 'excel';
  private static readonly POWERPOINT = 'powerpoint';
  private static readonly TXT = 'txt';
  private static readonly RTF = 'rtf';

  // This delay has been added to give enough time to the user on the UI to see the info messages on the document upload
  // field for cases when uploads are very fast.
  private static readonly RESPONSE_DELAY = 1000;

  private static readonly imagesList: string[] = ['GIF', 'JPG', 'JPEG', 'PNG', 'gif', 'jpg', 'jpeg', 'png'];
  private static readonly wordList: string[] = ['DOC', 'DOCX', 'doc', 'docx'];
  private static readonly excelList: string[] = ['XLS', 'XLSX', 'xls', 'xlsx'];
  private static readonly powerpointList: string[] = ['PPT', 'PPTX', 'ppt', 'pptx'];

  private caseTypeId: string;
  private caseId?: string;

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public uploadFile(formData: FormData): Observable<DocumentData> {
    this.setCaseInfo();
    const url = this.getDocStoreUrl();
    // Do not set any headers, such as "Accept" or "Content-Type", with null values; this is not permitted with the
    // Angular HttpClient in @angular/common/http. Just create and pass a new HttpHeaders object. Angular will add the
    // correct headers and values automatically
    this.appConfig.logMessage(`DMS:: Uploading document for case type: ${this.caseTypeId}, with url: ${url}, and case id: ${this.caseId}`);
    const headers = new HttpHeaders();
    return this.http
      .post(url, formData, { headers, observe: 'body' })
      .pipe(delay(DocumentManagementService.RESPONSE_DELAY));
  }

  public setCaseInfo(): void {
    const caseInfo = this.parseCaseInfo(this.sessionStorageService.getItem('caseInfo'));
    const currUrl = this.getCurrentPathname();
    this.caseTypeId = this.resolveCaseTypeId(caseInfo, currUrl);
  }

  public getMediaViewerInfo(documentFieldValue: any): string {
    const mediaViewerInfo = {
      document_binary_url: this.transformDocumentUrl(documentFieldValue.document_binary_url),
      document_filename: documentFieldValue.document_filename,
      content_type: this.getContentType(documentFieldValue),
      annotation_api_url: this.appConfig.getAnnotationApiUrl(),
      case_id: documentFieldValue.id,
      case_jurisdiction: documentFieldValue.jurisdiction
    };
    return JSON.stringify(mediaViewerInfo);
  }

  public getContentType(documentFieldValue: any): string {
    let fileExtension = '<unknown>';
    if (documentFieldValue.document_filename) {
      const position = documentFieldValue.document_filename.lastIndexOf('.');
      if (position === documentFieldValue.document_filename.length) {
        fileExtension = '';
      } else if (position >= 0) {
        fileExtension = documentFieldValue.document_filename.slice(position + 1);
      }
    }
    if (this.isImage(fileExtension)) {
      return DocumentManagementService.IMAGE;
    } else if (this.isWord(fileExtension)) {
      return DocumentManagementService.WORD;
    } else if (this.isExcel(fileExtension)) {
      return DocumentManagementService.EXCEL;
    } else if (this.isPowerpoint(fileExtension)) {
      return DocumentManagementService.POWERPOINT;
    } else if (fileExtension.toLowerCase() === 'txt') {
      return DocumentManagementService.TXT;
    } else if (fileExtension.toLowerCase() === 'rtf') {
      return DocumentManagementService.RTF;
    } else if (fileExtension.toLowerCase() === 'pdf') {
      return DocumentManagementService.PDF;
    } else {
      return fileExtension;
    }
  }

  public isImage(imageType: string): boolean {
    return DocumentManagementService.imagesList.find(e => e === imageType) !== undefined;
  }

  public isWord(wordType: string): boolean {
    return DocumentManagementService.wordList.find(e => e === wordType) !== undefined;
  }

  public isExcel(excelType: string): boolean {
    return DocumentManagementService.excelList.find(e => e === excelType) !== undefined;
  }

  public isPowerpoint(powerpointType: string): boolean {
    return DocumentManagementService.powerpointList.find(e => e === powerpointType) !== undefined;
  }

  public parseCaseInfo(caseInfo: string | null): { caseType?: string, caseId?: string } | null {
    if (!caseInfo) {
      return null;
    }
    try {
      return JSON.parse(caseInfo);
    } catch (error) {
      this.appConfig.logMessage('Failed to parse caseInfo from session storage');
      return null;
    }
  }

  private getCurrentPathname(): string {
    if (typeof window === 'undefined' || !window.location) {
      return '';
    }
    return window.location.pathname || '';
  }

  private resolveCaseTypeId(
    caseInfo: { caseType?: string, caseId?: string } | null,
    currUrl: string
  ): string {
    const caseTypeIdFromSession = caseInfo?.caseType;
    let caseType = '';
    if (caseTypeIdFromSession) {
      this.caseId = caseInfo?.caseId;
      caseType = caseTypeIdFromSession;
    }
    const parts = currUrl.split('/');
    if ((currUrl.includes('/case-details/') && parts.length > 4) && caseType === '') {
      caseType = parts[4];
    }
    const caseCreateIndex = parts.indexOf('case-create');
    if (currUrl.includes('/case-create/') && caseCreateIndex > -1 && parts.length > caseCreateIndex + 2) {
      caseType = parts[caseCreateIndex + 2];
    }

    return caseType;
  }

  private transformDocumentUrl(documentBinaryUrl: string): string {
    const remoteHrsPattern = new RegExp(this.appConfig.getRemoteHrsUrl());
    documentBinaryUrl = documentBinaryUrl.replace(remoteHrsPattern, this.appConfig.getHrsUrl());
    const remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return documentBinaryUrl.replace(remoteDocumentManagementPattern, this.getDocStoreUrl());
  }

  private getDocStoreUrl(): string {
    this.setCaseInfo();
    if (this.isDocumentSecureModeEnabled()) {
      return this.appConfig.getDocumentManagementUrlV2();
    }
    return this.appConfig.getDocumentManagementUrl();
  }

  // return false == document should not use CDAM
  // return true == document should use CDAM
  public isDocumentSecureModeEnabled(): boolean {
    this.setCaseInfo();
    const documentSecureModeCaseTypeExclusions = this.appConfig.getCdamExclusionList()?.split(',');
    const isDocumentOnExclusionList = documentSecureModeCaseTypeExclusions?.includes(this.caseTypeId);
    if (!isDocumentOnExclusionList){
      return true;
    }
    // if documentSecureModeEnabled is true, and case is in the exclusion list, return false
    return false;
  }
}
