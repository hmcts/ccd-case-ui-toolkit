import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseHistory } from './domain';
import { catchError, map } from 'rxjs/operators';
import { throwError, Subscription } from 'rxjs';
import { CaseView, CaseTab, HttpError } from '../../domain';
import { AlertService, OrderService } from '../../services';
import { CaseHistoryService } from './services/case-history.service';
import { CaseNotifier } from '../case-editor';
import { ShowCondition } from '../../directives';

@Component({
  selector: 'ccd-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.scss']
})
export class CaseHistoryComponent implements OnInit, OnDestroy {

  private static readonly ERROR_MESSAGE = 'No case history to show';
  public static readonly PARAM_EVENT_ID = 'eid';

  @Input()
  event: string;

  caseHistory: CaseHistory;
  caseDetails: CaseView;
  tabs: CaseTab[];
  caseSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private orderService: OrderService,
    private caseNotifier: CaseNotifier,
    private caseHistoryService: CaseHistoryService) { }

  ngOnInit() {
    this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      let eventId = this.route.snapshot.paramMap.get(CaseHistoryComponent.PARAM_EVENT_ID) || this.event;
      this.caseHistoryService
        .get(this.caseDetails.case_id, eventId)
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

  ngOnDestroy() {
    this.caseSubscription.unsubscribe();
  }

  isDataLoaded() {
    return !!(this.caseDetails && this.caseHistory);
  }

  private sortTabFieldsAndFilterTabs(tabs: CaseTab[]): CaseTab[] {
    return tabs
      .map(tab => Object.assign({}, tab, { fields: this.orderService.sort(tab.fields) }))
      .filter(tab => ShowCondition.getInstance(tab.show_condition).matchByContextFields(tab.fields));
  }
}
