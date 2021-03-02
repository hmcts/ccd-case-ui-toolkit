import { Observable } from 'rxjs';
import { DocumentData } from '../../domain/document/document-data.model';
import { Injectable } from '@angular/core';
import { HttpService } from '../http';
import { AbstractAppConfig } from '../../../app.config';
import { map } from 'rxjs/operators';
import { delay } from 'rxjs/internal/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class DocumentManagementService {
  private static readonly PDF = 'pdf';
  private static readonly IMAGE = 'image';
  // This delay has been added to give enough time to the user on the UI to see the info messages on the document upload
  // field for cases when uploads are very fast.
  private static readonly RESPONSE_DELAY = 1000;

  imagesList: string[] = ['GIF', 'JPG', 'JPEG', 'PNG'];

  constructor(private http: HttpService, private appConfig: AbstractAppConfig) {}

  uploadFile(formData: FormData): Observable<DocumentData> {
    const url = this.appConfig.getDocumentManagementUrl();
    // Do not set any headers, such as "Accept" or "Content-Type", with null values; this is not permitted with the
    // Angular HttpClient in @angular/common/http. Just create and pass a new HttpHeaders object. Angular will add the
    // correct headers and values automatically
    const headers = new HttpHeaders();
    return this.http
      .post(url, formData, {headers, observe: 'body'})
      .pipe(delay(DocumentManagementService.RESPONSE_DELAY))
      .pipe();
  }

  secureUploadFile(formData: FormData): Observable<DocumentData> {
    const url = this.appConfig.getDocumentManagementUrlV2();

    const headers = new HttpHeaders();
    return this.http
      .post(url, formData, {headers, observe: 'body'})
      .pipe(delay( DocumentManagementService.RESPONSE_DELAY ))
      .pipe();
  }

  getMediaViewerInfo(documentFieldValue: any): string {
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

  getContentType(documentFieldValue: any): string {
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
    } else if (fileExtension.toLowerCase() === 'pdf') {
      return DocumentManagementService.PDF;
    } else {
      console.warn(`Unknown content type with the file extension: ${fileExtension}`);
      return fileExtension;
    }
  }

  isImage(imageType: string) {
    return this.imagesList.find(e => e === imageType.toUpperCase()) !== undefined;
  }

  transformDocumentUrl(documentBinaryUrl: string): string {
    let remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return documentBinaryUrl.replace(remoteDocumentManagementPattern, this.appConfig.getDocumentManagementUrl());
  }
}
