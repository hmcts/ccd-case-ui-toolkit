import { Observable } from 'rxjs';
import { DocumentData } from '../../domain/document/document-data.model';
import { Injectable } from '@angular/core';
import { HttpService } from '../http';
import { Headers } from '@angular/http';
import { AbstractAppConfig } from '../../../app.config';
import { map } from 'rxjs/operators';
import { CaseField } from '../../domain/definition';

@Injectable()
export class DocumentManagementService {
  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';
  private static readonly PDF = 'pdf';
  private static readonly IMAGE = 'image';

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

  createMediaViewer(caseField: CaseField): string {
    let mediaViewer = {};
    if (caseField.value) {
      mediaViewer = {
        document_binary_url: this.transformDocumentUrl(caseField.value.document_binary_url),
        document_filename: caseField.value.document_filename,
        content_type: this.getContentType(caseField),
      }
    }
    return JSON.stringify(mediaViewer);
  }

  getContentType(caseField: CaseField): string {
    let fileExtension = '';
    if (caseField.value && caseField.value.document_filename) {
      fileExtension = caseField.value.document_filename
        .slice(caseField.value.document_filename.lastIndexOf('.') + 1);
    }
    return (fileExtension == 'pdf') ? DocumentManagementService.PDF : DocumentManagementService.IMAGE;
  }

  transformDocumentUrl(value: string): string {
    let remoteDocumentManagementPattern = new RegExp(this.appConfig.getRemoteDocumentManagementUrl());
    return value.replace(remoteDocumentManagementPattern, this.appConfig.getDocumentManagementUrl());
  }
}
