import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '../app.config';
import { HttpService } from '../http/http.service';
import { DocumentData } from '../../shared/domain/document/document-data.model';

@Injectable()
export class DocumentManagementService {
  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';

  constructor(private http: HttpService, private appConfig: AppConfig) {}

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
