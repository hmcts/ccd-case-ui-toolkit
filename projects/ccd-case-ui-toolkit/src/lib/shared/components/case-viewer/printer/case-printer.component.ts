import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CasePrintDocument } from '../../../domain/case-view/case-print-document.model';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { AlertService } from '../../../services/alert/alert.service';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { CasesService } from '../../case-editor/services/cases.service';

@Component({
  templateUrl: './case-printer.html'
})
export class CasePrinterComponent implements OnInit, OnDestroy {

  private readonly ERROR_MESSAGE = 'No documents to print';

  public caseDetails: CaseView;
  public documents: CasePrintDocument[];
  public caseSubscription: Subscription;

  constructor(
    private readonly caseNotifier: CaseNotifier,
    private readonly casesService: CasesService,
    private readonly alertService: AlertService
  ) {}

  public ngOnInit(): void {
    this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      this.casesService
        .getPrintDocuments(this.caseDetails.case_id)
        .pipe(
          map(documents => {

            if (!documents || !documents.length) {
              const error = new HttpError();
              error.message = this.ERROR_MESSAGE;
              throw error;
            }

            this.documents = documents;
          }),
          catchError(error => {
            this.alertService.error(error.message);
            return throwError(error);
          })
        ).toPromise();
    });
  }

  public ngOnDestroy(): void {
    if (this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public isDataLoaded() {
    return this.caseDetails && this.documents ? true : false;
  }

}
