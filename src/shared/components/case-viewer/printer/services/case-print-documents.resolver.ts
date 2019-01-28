import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CasePrintDocument, HttpError } from '../../../../domain';
import { CasesService } from '../../../case-editor';
import { AlertService } from '../../../../services';

@Injectable()
export class CasePrintDocumentsResolver implements Resolve<CasePrintDocument[]> {

  private static readonly ERROR_MESSAGE = 'No documents to print';

  constructor(private casesService: CasesService, private alertService: AlertService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<CasePrintDocument[]> {
    let jid = route.parent.params['jid'];
    let ctid = route.parent.params['ctid'];
    let cid = route.parent.params['cid'];
    // let caseDetails: CaseView = route.parent.data.case;
    return this.casesService
      .getPrintDocuments(jid, ctid, cid)
      .pipe(
        map(documents => {

          if (!documents || !documents.length) {
            let error = new HttpError();
            error.message = CasePrintDocumentsResolver.ERROR_MESSAGE;
            throw error;
          }

          return documents;
        }),
        catchError(error => {
          this.alertService.error(error.message);
          return throwError(error);
        })
      ).toPromise();
  }

}
