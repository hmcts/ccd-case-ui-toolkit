import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { CategoriesAndDocuments } from '../../domain/case-file-view';
import { HttpService } from '../http';

@Injectable()
export class CaseFileViewService {
  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig
  ) { }

  /**
   * Retrieves the categories and documents for a case.
   *
   * @param caseRef 16-digit Case Reference number of the case
   * @returns An `Observable` of the `CategoriesAndDocuments` for the case
   */
  public getCategoriesAndDocuments(caseRef: string): Observable<CategoriesAndDocuments> {
    let url = this.appConfig.getCategoriesAndDocumentsUrl();

    if (url) {
      url += `/${caseRef}`;

      return this.http.get(url, {observe: 'body'});
    }

    return of(null);
  }
}
