import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { CasePrintDocument, CaseView, HttpError } from '../../../../domain';
import { CasesService } from '../../../case-editor';
import { AlertService } from '../../../../services';

@Injectable()
export class CasePrintDocumentsResolver implements Resolve<CasePrintDocument[]> {

  private static readonly ERROR_MESSAGE = 'No documents to print';

  constructor(private casesService: CasesService, private alertService: AlertService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CasePrintDocument[]> {
    let caseDetails: CaseView = route.parent.data.case;

    return this.casesService
      .getPrintDocuments(caseDetails.case_type.jurisdiction.id, caseDetails.case_type.id, caseDetails.case_id)
      .map(documents => {

        if (!documents || !documents.length) {
          let error = new HttpError();
          error.message = CasePrintDocumentsResolver.ERROR_MESSAGE;
          throw error;
        }

        return documents;
      })
      .catch((error: HttpError) => {
        this.alertService.error(error.message);

        return Observable.throw(error);
      });
  }

}
