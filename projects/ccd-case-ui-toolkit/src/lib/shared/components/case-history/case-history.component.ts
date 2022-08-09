import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ShowCondition } from '../../directives';
import { CaseTab, CaseView, HttpError } from '../../domain';
import { AlertService, OrderService } from '../../services';
import { CaseNotifier } from '../case-editor';
import { CaseHistory } from './domain';
import { CaseHistoryService } from './services/case-history.service';

@Component({
  selector: 'ccd-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.scss']
})
export class CaseHistoryComponent implements OnInit, OnDestroy {
  public static readonly PARAM_EVENT_ID = 'eid';

  private static readonly ERROR_MESSAGE = 'No case history to show';

  @Input()
  public event: string;

  public caseHistory: CaseHistory;
  public caseDetails: CaseView;
  public tabs: CaseTab[];
  public caseSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly orderService: OrderService,
    private readonly caseNotifier: CaseNotifier,
    private readonly caseHistoryService: CaseHistoryService) { }

  public ngOnInit() {
    this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      const eventId = this.route.snapshot.paramMap.get(CaseHistoryComponent.PARAM_EVENT_ID) || this.event;
      this.caseHistoryService
        .get(this.caseDetails.case_id, eventId)
        .pipe(
          map(caseHistory => {
            if (!caseHistory) {
              const error = new HttpError();
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

  public ngOnDestroy(): void {
    if (this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public isDataLoaded() {
    return !!(this.caseDetails && this.caseHistory);
  }

  private sortTabFieldsAndFilterTabs(tabs: CaseTab[]): CaseTab[] {
    return tabs
      .map(tab => Object.assign({}, tab, { fields: this.orderService.sort(tab.fields) }))
      .filter(tab => ShowCondition.getInstance(tab.show_condition).matchByContextFields(tab.fields));
  }
}
