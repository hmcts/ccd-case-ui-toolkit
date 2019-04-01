import { Component, Input, OnInit } from '@angular/core';
import { AlertService } from '../../../services/alert';
import { CaseView, Draft } from '../../../domain';
import { CasesService, CaseService } from '../../case-editor';
import { DraftService } from '../../../services';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ccd-case-view',
  templateUrl: 'case-view.component.html'
})
export class CaseViewComponent implements OnInit {

  @Input()
  case: string;

  caseDetails: CaseView;

  constructor(
    private caseService: CaseService,
    private casesService: CasesService,
    private draftService: DraftService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.getCaseView(this.case)
      .pipe(
        map(caseView => {
          this.caseDetails = caseView;
          this.caseService.announceCase(caseView);
        })
      )
      .toPromise()
      .catch(error => this.checkAuthorizationError(error));
  }

  isDataLoaded(): boolean {
    return this.caseDetails ? true : false;
  }

  private getCaseView(cid): Observable<CaseView> {
    if (Draft.isDraft(cid)) {
      return this.getDraft(cid);
    } else {
    return this.casesService
          .getCaseViewV2(cid);
    }
  }

  private getDraft(cid): Observable<CaseView> {
    return this.draftService
      .getDraft(cid);
  }

  private checkAuthorizationError(error: any) {
    // TODO Should be logged to remote logging infrastructure
    console.error(error);
    if (error.status !== 401 && error.status !== 403) {
      this.alertService.error(error.message);
    }
    return throwError(error);
  }
}
