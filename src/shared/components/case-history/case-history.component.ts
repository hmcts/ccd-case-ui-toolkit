import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseHistory } from './domain';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CaseView, CaseTab, HttpError } from '../../domain';
import { AlertService, OrderService } from '../../services';
import { CaseHistoryService } from './services/case-history.service';
import { CaseService } from '../case-editor';
import { ShowCondition } from '../../directives';

@Component({
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.scss']
})
export class CaseHistoryComponent implements OnInit {

  private static readonly ERROR_MESSAGE = 'No case history to show';
  public static readonly PARAM_EVENT_ID = 'eid';

  caseHistory: CaseHistory;
  caseDetails: CaseView;
  tabs: CaseTab[];

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private orderService: OrderService,
    private caseService: CaseService,
    private caseHistoryService: CaseHistoryService) { }

  ngOnInit() {
    this.caseService.caseView.subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      this.route.snapshot.paramMap.get(CaseHistoryComponent.PARAM_EVENT_ID);
      this.caseHistoryService
        .get(this.caseDetails.case_id, this.route.snapshot.paramMap.get(CaseHistoryComponent.PARAM_EVENT_ID))
        .pipe(
          map(caseHistory => {
            if (!caseHistory) {
              let error = new HttpError();
              error.message = CaseHistoryComponent.ERROR_MESSAGE;
              throw error;
            }

            this.caseHistory = caseHistory;
            this.tabs = this.orderService.sort(this.caseHistory.tabs);
            this.tabs = this.sortTabFieldsAndFilterTabs(this.tabs);
          }),
          catchError(error => {
            console.error(error);
            if (error.status !== 401 && error.status !== 403) {
              this.alertService.error(error.message);
            }
            return throwError(error);
            })
        ).toPromise();
    });
  }

  isDataLoaded() {
    return this.caseDetails && this.caseHistory ? true : false;
  }

  private sortTabFieldsAndFilterTabs(tabs: CaseTab[]): CaseTab[] {
    return tabs
      .map(tab => Object.assign({}, tab, { fields: this.orderService.sort(tab.fields) }))
      .filter(tab => new ShowCondition(tab.show_condition).matchByCaseFields(tab.fields));
  }
}
