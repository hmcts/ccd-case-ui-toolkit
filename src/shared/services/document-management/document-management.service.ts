import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { DocumentData } from '../../domain/document/document-data.model';
import { HttpService } from '../http';

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

  constructor(private http: HttpService, private appConfig: AbstractAppConfig) {}

  public uploadFile(formData: FormData): Observable<DocumentData> {
    const url = this.getDocStoreUrl();
    // Do not set any headers, such as "Accept" or "Content-Type", with null values; this is not permitted with the
    // Angular HttpClient in @angular/common/http. Just create and pass a new HttpHeaders object. Angular will add the
    // correct headers and values automatically
    const headers = new HttpHeaders();
    return timer(DocumentManagementService.RESPONSE_DELAY).pipe(
      switchMap(() => this.http.post(url, formData, {headers, observe: 'body'}))
    );
  }

  public getMediaViewerInfo(documentFieldValue: any): string {
    let mediaViewerInfo = {
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
      let position = documentFieldValue.document_filename.lastIndexOf('.');
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

  private transformDocumentUrl(documentBinaryUrl: string): string {
    const remoteHrsPattern = new RegExp(this.appConfig.getRemoteHrsUrl());
    documentBinaryUrl = documentBinaryUrl.replace(remoteHrsPattern, this.appConfig.getHrsUrl());
    const remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return documentBinaryUrl.replace(remoteDocumentManagementPattern, this.getDocStoreUrl());
  }

  private getDocStoreUrl(): string {
    return this.appConfig.getDocumentSecureMode() ? this.appConfig.getDocumentManagementUrlV2() : this.appConfig.getDocumentManagementUrl();
  }
}
