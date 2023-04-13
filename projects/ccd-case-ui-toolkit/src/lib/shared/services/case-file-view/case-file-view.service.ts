import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { categoriesAndDocumentsTestData } from '../../components/palette/case-file-view/test-data/categories-and-documents-test-data';
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
    // Case file view v1.1 epic - https://tools.hmcts.net/jira/browse/EUI-7807
    // Display upload_timestamp - https://tools.hmcts.net/jira/browse/EUI-7819
    // Sort by upload_timestamp - https://tools.hmcts.net/jira/browse/EUI-7812
    // The property upload_timestamp is not available as it is not yet implemented by CCD
    // Using this case reference '1666863124102280' to return the mock data with upload_timestamp
    // The below 'if' statement should be removed once the upload_timestamp property is made available by CCD
    // https://tools.hmcts.net/jira/browse/EUI-8129
    if (caseRef === '1666863124102280') {
      return of(categoriesAndDocumentsTestData);
    }

    let url = this.appConfig.getCategoriesAndDocumentsUrl();

    if (url) {
      url += `/${caseRef}`;

      return this.http.get(url, {observe: 'body'});
    }

    return of(null);
  }

  public updateDocumentCategory(caseRef: string,
                                caseVersion: number,
                                attributePath: string,
                                categoryId: string): Observable<CategoriesAndDocuments> {
    let url = this.appConfig.getDocumentDataUrl();

    if (url) {
      url += `/${caseRef}`;
      const body = {
        case_version: caseVersion,
        attribute_path: attributePath,
        category_id: categoryId
      };

      return this.http.put(url, body, {observe: 'body'});
    }

    return of(null);
  }
}
