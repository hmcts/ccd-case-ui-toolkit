import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CaseTab } from '../../domain/case-view/case-tab.model';
import { Subject } from 'rxjs/Subject';
import { Activity, DisplayMode } from '../../domain/activity/activity.model';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { CaseField } from '../../domain/definition';
import { ShowCondition } from '../../directives/conditional-show/domain';
import { Draft } from '../../domain';
import { HttpError } from '../../domain/http';
import { OrderService } from '../../services/order';
import { CaseView, CaseViewTrigger } from '../../domain/case-view';
import { DeleteOrCancelDialogComponent } from '../../components/dialogs';
import { DRAFT_QUERY_PARAM } from '../../domain';
import { AlertService } from '../../services/alert';
import { CallbackErrorsContext } from '../../components/error/domain';
import { DraftService } from '../../services/draft';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CaseService } from '../case-editor';

@Component({
  selector: 'ccd-case-viewer',
  templateUrl: './case-viewer.component.html',
  styleUrls: ['./case-viewer.scss']
})
export class CaseViewerComponent implements OnInit, OnDestroy {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  static readonly TRIGGER_TEXT_START = 'Go';
  static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Go';

  BANNER = DisplayMode.BANNER;

  caseDetails: CaseView;
  sortedTabs: CaseTab[];
  caseFields: CaseField[];
  error: any;
  triggerTextStart = CaseViewerComponent.TRIGGER_TEXT_START;
  triggerTextIgnoreWarnings = CaseViewerComponent.TRIGGER_TEXT_CONTINUE;
  triggerText: string = CaseViewerComponent.TRIGGER_TEXT_START;
  ignoreWarning = false;
  subscription: Subscription;
  dialogConfig: MatDialogConfig;

  callbackErrorsSubject: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private activityPollingService: ActivityPollingService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private draftService: DraftService,
    private caseService: CaseService
  ) {}

  ngOnInit() {
    this.initDialog();
    if (!this.route.snapshot.data.case) {
      this.caseService.caseViewSource.asObservable().subscribe(caseDetails => {
        this.caseDetails = caseDetails;
        this.init();
      });
    } else {
      this.caseDetails = this.route.snapshot.data.case;
      this.init();
    }
  }

  ngOnDestroy() {
    if (this.activityPollingService.isEnabled) {
      this.subscription.unsubscribe();
    }
  }

  postViewActivity(): Observable<Activity[]> {
    return this.activityPollingService.postViewActivity(this.caseDetails.case_id);
  }

  private init() {
    // Clone and sort tabs array
    this.sortedTabs = this.orderService.sort(this.caseDetails.tabs);

    this.caseFields = this.getTabFields();

    this.sortedTabs = this.sortTabFieldsAndFilterTabs(this.sortedTabs);

    if (this.activityPollingService.isEnabled) {
      this.subscription = this.postViewActivity().subscribe((_resolved) => {
        // console.log('Posted VIEW activity and result is: ' + JSON.stringify(resolved));
      });
    }
  }

  private sortTabFieldsAndFilterTabs(tabs: CaseTab[]): CaseTab[] {
    return tabs
      .map(tab => Object.assign({}, tab, { fields: this.orderService.sort(tab.fields) }))
      .filter(tab => new ShowCondition(tab.show_condition).matchByCaseFields(this.caseFields));
  }

  clearErrorsAndWarnings() {
    this.error = null;
    this.ignoreWarning = false;
    this.triggerText = CaseViewerComponent.TRIGGER_TEXT_START;
  }

  applyTrigger(trigger: CaseViewTrigger): Promise<boolean | void> {
    this.error = null;

    let theQueryParams: Params = {};

    if (this.ignoreWarning) {
      theQueryParams['ignoreWarning'] = this.ignoreWarning;
    }

    // we may need to take care of different triggers in the future
    if (trigger.id === CaseViewTrigger.DELETE) {
      const dialogRef = this.dialog.open(DeleteOrCancelDialogComponent, this.dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'Delete') {
          this.draftService.deleteDraft(this.caseDetails.case_id)
            .subscribe(_ => {
              return this.router.navigate(['list/case'])
                .then(() => {
                  this.alertService.setPreserveAlerts(true);
                  this.alertService.success(`The draft has been successfully deleted`);
                });
            }, _ => {
              return this.router.navigate(['list/case']);
            });
        }
      });
    } else if (this.isDraft() && trigger.id !== CaseViewTrigger.DELETE) {
      theQueryParams[DRAFT_QUERY_PARAM] = this.caseDetails.case_id;
      theQueryParams[CaseViewerComponent.ORIGIN_QUERY_PARAM] = 'viewDraft';
      return this.router.navigate(
        ['create/case',
          this.caseDetails.case_type.jurisdiction.id,
          this.caseDetails.case_type.id,
          trigger.id], { queryParams: theQueryParams } ).catch(error => {
        this.handleError(error, trigger)
      });
    } else {
      return this.router.navigate(['trigger', trigger.id], {
        queryParams: theQueryParams,
        relativeTo: this.route
      }).catch(error => {
        this.handleError(error, trigger)
      });
    }
  }

  isDataLoaded(): boolean {
    return this.caseDetails ? true : false;
  }

  callbackErrorsNotify(callbackErrorsContext: CallbackErrorsContext) {
    this.ignoreWarning = callbackErrorsContext.ignore_warning;
    this.triggerText = callbackErrorsContext.trigger_text;
  }

  private getTabFields(): CaseField[] {
    const caseDataFields = this.sortedTabs.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }

  isDraft(): boolean {
    return Draft.isDraft(this.caseDetails.case_id);
  }

  private initDialog() {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.disableClose = true;
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.ariaLabel = 'Label';
    this.dialogConfig.height = '245px';
    this.dialogConfig.width = '550px';
    this.dialogConfig.panelClass = 'dialog';

    this.dialogConfig.closeOnNavigation = false;
    this.dialogConfig.position = {
      top: window.innerHeight / 2 - 120 + 'px', left: window.innerWidth / 2 - 275 + 'px'
    }
  }

  private handleError(error: HttpError, trigger: CaseViewTrigger) {
    if (error.status !== 401 && error.status !== 403) {
      this.error = error;
      console.log('error during triggering event:', trigger.id);
      console.log(error);
      this.callbackErrorsSubject.next(this.error);
    }
  }
}
