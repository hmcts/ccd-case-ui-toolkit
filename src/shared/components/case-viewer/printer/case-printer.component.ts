import { Component, OnInit } from '@angular/core';
import { CaseView, CasePrintDocument, HttpError } from '../../../domain';
import { CaseService, CasesService } from '../../case-editor';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AlertService } from '../../../services';

@Component({
  templateUrl: './case-printer.html'
})
export class CasePrinterComponent implements OnInit {

  private static readonly ERROR_MESSAGE = 'No documents to print';

  caseDetails: CaseView;
  documents: CasePrintDocument[];

  constructor(
    private caseService: CaseService,
    private casesService: CasesService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.caseService.caseView.subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      this.casesService
        .getPrintDocuments(this.caseDetails.case_type.jurisdiction.id,
                           this.caseDetails.case_type.id,
                           this.caseDetails.case_id)
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

  isDataLoaded() {
    return this.caseDetails && this.documents ? true : false;
  }

}
