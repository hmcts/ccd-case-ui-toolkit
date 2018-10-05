import { Observable } from 'rxjs/Observable';
import { DocumentData } from '../domain/document/document-data.model';
import { Injectable } from '@angular/core';
import { HttpService } from '../http';
import { Headers } from '@angular/http';
import { AbstractAppConfig } from '../../app.config';

@Injectable()
export class DocumentManagementService {
  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';

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
      .map(response => response.json());
  }
}
