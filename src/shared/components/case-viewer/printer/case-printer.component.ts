import { Component, OnInit, OnDestroy } from '@angular/core';
import { CaseView, CasePrintDocument, HttpError } from '../../../domain';
import { CaseNotifier, CasesService } from '../../case-editor';
import { catchError, map } from 'rxjs/operators';
import { throwError, Subscription } from 'rxjs';
import { AlertService } from '../../../services';

@Component({
  templateUrl: './case-printer.html'
})
export class CasePrinterComponent implements OnInit, OnDestroy {

  private static readonly ERROR_MESSAGE = 'No documents to print';

  caseDetails: CaseView;
  documents: CasePrintDocument[];
  caseSubscription: Subscription;

  constructor(
    private caseNotifier: CaseNotifier,
    private casesService: CasesService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      this.casesService
        .getPrintDocuments(this.caseDetails.case_id)
        .pipe(
          map(documents => {

            if (!documents || !documents.length) {
              let error = new HttpError();
              error.message = CasePrinterComponent.ERROR_MESSAGE;
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

  ngOnDestroy() {
    this.caseSubscription.unsubscribe();
  }

  isDataLoaded() {
    return this.caseDetails && this.documents ? true : false;
  }

}
