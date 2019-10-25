import { Observable } from 'rxjs';
import { DocumentData } from '../../domain/document/document-data.model';
import { Injectable } from '@angular/core';
import { HttpService } from '../http';
import { Headers } from '@angular/http';
import { AbstractAppConfig } from '../../../app.config';
import { map } from 'rxjs/operators';
import { delay } from 'rxjs/internal/operators';

@Injectable()
export class DocumentManagementService {
  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';
  private static readonly PDF = 'pdf';
  private static readonly IMAGE = 'image';
  // This delay has been added to give enough time to the user on the UI to see the info messages on the document upload
  // field for cases when uploads are very fast.
  private static readonly RESPONSE_DELAY = 2000;

  imagesList: string[] = [ 'GIF', 'JPG', 'JPEG', 'PNG'];

  constructor(private http: HttpService, private appConfig: AbstractAppConfig) {}

  uploadFile(formData: FormData): Observable<DocumentData> {
    const url = this.appConfig.getDocumentManagementUrl();
    let headers = new Headers();
    headers.append(DocumentManagementService.HEADER_ACCEPT, null);
    // Content-Type header value needs to be null; HttpService will delete it, so that Angular can set it automatically
    // with the correct boundary
    headers.append(DocumentManagementService.HEADER_CONTENT_TYPE, null);
    return this.http
      .post(url, formData, { headers })
      .pipe(delay( DocumentManagementService.RESPONSE_DELAY ))
      .pipe(
        map(response => {
          return response.json();
        })
      );
  }

  getMediaViewerInfo(documentFieldValue: any): string {
    let mediaViewerInfo = {
        document_binary_url: this.transformDocumentUrl(documentFieldValue.document_binary_url),
        document_filename: documentFieldValue.document_filename,
        content_type: this.getContentType(documentFieldValue),
        annotation_api_url: this.appConfig.getAnnotationApiUrl()
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
