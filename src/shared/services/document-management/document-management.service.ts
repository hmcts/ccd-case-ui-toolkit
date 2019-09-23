import { Observable } from 'rxjs';
import { DocumentData } from '../../domain/document/document-data.model';
import { Injectable } from '@angular/core';
import { HttpService } from '../http';
import { Headers } from '@angular/http';
import { AbstractAppConfig } from '../../../app.config';
import { map } from 'rxjs/operators';

@Injectable()
export class DocumentManagementService {
  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';
  private static readonly PDF = 'pdf';
  private static readonly IMAGE = 'image';

  imagesList: string[] = ['JPEG', 'GIF', 'PNG', 'TIF', 'JPG'];

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
      .pipe(
        map(response => response.json())
      );
  }

  getMediaViewerInfo(caseFieldValue: any): string {
    let mediaViewer = {};
    if (caseFieldValue) {
      mediaViewer = {
        document_binary_url: this.transformDocumentUrl(caseFieldValue.document_binary_url),
        document_filename: caseFieldValue.document_filename,
        content_type: this.getContentType(caseFieldValue),
      }
    }
    return JSON.stringify(mediaViewer);
  }

  getContentType(caseFieldValue: any): string {
    let fileExtension = '';
    if (caseFieldValue.document_filename) {
      fileExtension = caseFieldValue.document_filename
        .slice(caseFieldValue.document_filename.lastIndexOf('.') + 1);
    }
    if (this.isImage(fileExtension)) {
      return DocumentManagementService.IMAGE;
    } else if (fileExtension === 'pdf') {
      return DocumentManagementService.PDF;
    } else {
      console.warn(`Unknown content type with the file extension: ${fileExtension}`);
      return null;
    }
  }

  isImage(imageType: string) {
    return this.imagesList.find(e => e === imageType.toUpperCase()) !== undefined;
  }

  transformDocumentUrl(value: string): string {
    let remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return value.replace(remoteDocumentManagementPattern, this.appConfig.getDocumentManagementUrl());
  }
}
