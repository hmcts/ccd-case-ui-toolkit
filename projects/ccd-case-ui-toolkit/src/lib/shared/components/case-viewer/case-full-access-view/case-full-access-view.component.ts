import { Location } from '@angular/common';
import { AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { Observable, Subject, Subscription } from 'rxjs';
import { initDialog } from 'src/shared/components/helpers/init-dialog-helper';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { Activity, DisplayMode } from '../../../domain/activity/activity.model';
import { CaseTab } from '../../../domain/case-view/case-tab.model';
import { CaseViewTrigger } from '../../../domain/case-view/case-view-trigger.model';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { Draft, DRAFT_QUERY_PARAM } from '../../../domain/draft.model';
import { ActivityPollingService } from '../../../services/activity/activity.polling.service';
import { AlertService } from '../../../services/alert/alert.service';
import { DraftService } from '../../../services/draft/draft.service';
import { ErrorNotifierService } from '../../../services/error/error-notifier.service';
import { NavigationNotifierService } from '../../../services/navigation/navigation-notifier.service';
import { NavigationOrigin } from '../../../services/navigation/navigation-origin.model';
import { OrderService } from '../../../services/order/order.service';
import { ConvertHrefToRouterService } from '../../case-editor/services/convert-href-to-router.service';
import { DeleteOrCancelDialogComponent } from '../../dialogs/delete-or-cancel-dialog/delete-or-cancel-dialog.component';
import { CallbackErrorsContext } from '../../error/domain/error-context';



@Component({
  selector: 'ccd-case-full-access-view',
  templateUrl: './case-full-access-view.component.html',
  styleUrls: ['./case-full-access-view.component.scss']
})
export class CaseFullAccessViewComponent implements OnInit, OnDestroy, AfterViewInit {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  public static readonly TRIGGER_TEXT_START = 'Go';
  public static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Go';
  public static readonly UNICODE_SPACE = '%20';
  public static readonly EMPTY_SPACE = ' ';

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;
  @Input() public caseDetails: CaseView;
  @Input() public prependedTabs: CaseTab[] = [];
  @Input() public appendedTabs: CaseTab[] = [];

  public BANNER = DisplayMode.BANNER;
  public sortedTabs: CaseTab[];
  public caseFields: CaseField[];
  public formGroup: FormGroup;
  public error: any;
  public triggerTextStart = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
  public triggerTextIgnoreWarnings = CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE;
  public triggerText: string = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
  public ignoreWarning = false;
  public activitySubscription: Subscription;
  public caseSubscription: Subscription;
  public errorSubscription: Subscription;
  public dialogConfig: MatDialogConfig;
  public markdownUseHrefAsRouterLink: boolean;
  public message: string;
  public subscription: Subscription;

  public callbackErrorsSubject: Subject<any> = new Subject();
  @ViewChild('tabGroup', { static: false }) public tabGroup: MatTabGroup;

  constructor(
    private readonly ngZone: NgZone,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly navigationNotifierService: NavigationNotifierService,
    private readonly orderService: OrderService,
    private readonly activityPollingService: ActivityPollingService,
    private readonly dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly draftService: DraftService,
    private readonly errorNotifierService: ErrorNotifierService,
    private readonly convertHrefToRouterService: ConvertHrefToRouterService,
    private readonly location: Location
  ) {
  }

  public ngOnInit() {
    this.dialogConfig = initDialog();

    this.init();

    this.callbackErrorsSubject.subscribe(errorEvent => {
      this.error = errorEvent;
    });
    this.errorSubscription = this.errorNotifierService.error.subscribe(error => {
      if (error && error.status !== 401 && error.status !== 403) {
        this.error = error;
        this.callbackErrorsSubject.next(this.error);
      }
    });
    this.markdownUseHrefAsRouterLink = true;

    this.subscription = this.convertHrefToRouterService.getHrefMarkdownLinkContent().subscribe((hrefMarkdownLinkContent: string) => {
      // do not convert router with initial default value; convert to router only on updated link content
      if (hrefMarkdownLinkContent !== 'Default') {
        this.convertHrefToRouterService.callAngularRouter(hrefMarkdownLinkContent);
      }
    });
  }

  public isPrintEnabled(): boolean {
    return this.caseDetails.case_type.printEnabled;
  }

  public ngOnDestroy() {
    if (this.activitySubscription && this.activityPollingService.isEnabled) {
      this.activitySubscription.unsubscribe();
    }
    if (this.callbackErrorsSubject) {
      this.callbackErrorsSubject.unsubscribe();
    }
    if (!this.route.snapshot.data.case && this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public postViewActivity(): Observable<Activity[]> {
    return this.activityPollingService.postViewActivity(this.caseDetails.case_id);
  }

  public clearErrorsAndWarnings(): void {
    this.resetErrors();
    this.ignoreWarning = false;
    this.triggerText = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
  }

  public applyTrigger(trigger: CaseViewTrigger): void {
    this.error = null;

    const theQueryParams: Params = {};

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
              this.navigationNotifierService.announceNavigation({action: NavigationOrigin.DRAFT_DELETED});
            }, _ => {
              this.navigationNotifierService.announceNavigation({action: NavigationOrigin.ERROR_DELETING_DRAFT});
            });
        }
      });
    } else if (this.isDraft() && trigger.id !== CaseViewTrigger.DELETE) {
      theQueryParams[DRAFT_QUERY_PARAM] = this.caseDetails.case_id;
      theQueryParams[CaseFullAccessViewComponent.ORIGIN_QUERY_PARAM] = 'viewDraft';
      this.navigationNotifierService.announceNavigation(
        {
          action: NavigationOrigin.DRAFT_RESUMED,
          jid: this.caseDetails.case_type.jurisdiction.id,
          ctid: this.caseDetails.case_type.id,
          etid: trigger.id,
          queryParams: theQueryParams
        });
    } else {
      this.navigationNotifierService.announceNavigation(
        {
          action: NavigationOrigin.EVENT_TRIGGERED,
          queryParams: theQueryParams,
          etid: trigger.id,
          relativeTo: this.route
        });
    }
  }

  public hasTabsPresent(): boolean {
    return this.sortedTabs.length > 0 || this.prependedTabs.length > 0 || this.appendedTabs.length > 0;
  }

  public callbackErrorsNotify(callbackErrorsContext: CallbackErrorsContext): void {
    this.ignoreWarning = callbackErrorsContext.ignore_warning;
    this.triggerText = callbackErrorsContext.trigger_text;
  }

  public isDraft(): boolean {
    return Draft.isDraft(this.caseDetails.case_id);
  }

  public isTriggerButtonDisabled(): boolean {
    return (this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length)
      || (this.error
        && this.error.details
        && this.error.details.field_errors
        && this.error.details.field_errors.length);
  }

  public ngAfterViewInit(): void {
    let matTab;
    const url = this.location.path(true);
    let hashValue = url.substring(url.indexOf('#') + 1);
    if (!url.includes('#')) {
      const paths = url.split('/');
      // lastPath can be /caseId, or the tabs /tasks, /hearings etc.
      const lastPath = decodeURIComponent(paths[paths.length - 1]);
      let foundTab: CaseTab = null;
      const additionalTabs = [...this.prependedTabs, ...this.appendedTabs];
      if (additionalTabs && additionalTabs.length) {
        foundTab =  additionalTabs.find((caseTab: CaseTab) => caseTab.id.toLowerCase() === lastPath.toLowerCase());
      }
      // found tasks or hearing tab
      if (foundTab) {
        this.router.navigate(['cases', 'case-details', this.caseDetails.case_id, foundTab.id]).then(() => {
          matTab = this.tabGroup._tabs.find((x) => x.textLabel === foundTab.label);
          this.tabGroup.selectedIndex = matTab.position;
        });
      // last path is caseId
      } else {
        // sort with the order of CCD predefined tabs
        this.caseDetails.tabs.sort((aTab, bTab) => aTab.order > bTab.order ? 1 : (bTab.order > aTab.order ? -1 : 0));
        // preselect the 1st order of CCD predefined tabs
        const preSelectTab: CaseTab = this.caseDetails.tabs[0];
        this.router.navigate(['cases', 'case-details', this.caseDetails.case_id]).then(() => {
          matTab = this.tabGroup._tabs.find((x) => x.textLabel === preSelectTab.label);
          this.tabGroup.selectedIndex = matTab.position;
        });
      }
    } else {
      const regExp = new RegExp(CaseFullAccessViewComponent.UNICODE_SPACE, 'g');
      hashValue = hashValue.replace(regExp, CaseFullAccessViewComponent.EMPTY_SPACE);
      matTab = this.tabGroup._tabs.find((x) =>
        x.textLabel.replace(CaseFullAccessViewComponent.EMPTY_SPACE, '').toLowerCase() ===
                                hashValue.replace(CaseFullAccessViewComponent.EMPTY_SPACE, '').toLowerCase());
      if (matTab && matTab.position) {
        this.tabGroup.selectedIndex = matTab.position;
      }
    }
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    const tab = tabChangeEvent.tab['_viewContainerRef'] as ViewContainerRef;
    const id = (tab.element.nativeElement as HTMLElement).id;
    const tabsLengthBeforeAppended = this.prependedTabs.length + this.caseDetails.tabs.length;
    if ((tabChangeEvent.index <= 1 && this.prependedTabs.length) ||
      (tabChangeEvent.index >= tabsLengthBeforeAppended && this.appendedTabs.length)) {
      this.router.navigate([id], {relativeTo: this.route});
    } else {
      const label = tabChangeEvent.tab.textLabel;
      this.router.navigate(['cases', 'case-details', this.caseDetails.case_id]).then(() => {
        window.location.hash = label;
      });
    }
  }

  private init(): void {
    // Clone and sort tabs array
    this.sortedTabs = this.orderService.sort(this.caseDetails.tabs);
    this.caseFields = this.getTabFields();
    this.sortedTabs = this.sortTabFieldsAndFilterTabs(this.sortedTabs);
    this.formGroup = this.buildFormGroup(this.caseFields);

    if (this.activityPollingService.isEnabled) {
      this.ngZone.runOutsideAngular(() => {
        this.activitySubscription = this.postViewActivity().subscribe((_resolved) => {
          // console.log('Posted VIEW activity and result is: ' + JSON.stringify(_resolved));
        });
      });
    }

    if (this.caseDetails.triggers && this.error) {
      this.resetErrors();
    }
  }

  private sortTabFieldsAndFilterTabs(tabs: CaseTab[]): CaseTab[] {
    return tabs
      .map(tab => Object.assign({}, tab, {fields: this.orderService.sort(tab.fields)}))
      .filter(tab => ShowCondition.getInstance(tab.show_condition).matchByContextFields(this.caseFields));
  }

  private getTabFields(): CaseField[] {
    const caseDataFields = this.sortedTabs.reduce((acc, tab) => {
      return acc.concat(plainToClass(CaseField, tab.fields));
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }

  /**
   * For EUI-3825:
   * Builds a FormGroup from all the CaseFields contained within the view.
   * This FormGroup is necessary for evaluation the show/hide conditions of
   * fields that are dependent on a field only available on a DIFFERENT tab.
   */
  private buildFormGroup(caseFields: CaseField[]): FormGroup {
    let value: object = {};
    if (caseFields) {
      caseFields.forEach(caseField => {
        value = {
          ...value,
          [caseField.id]: caseField.value
        };
      });
    }
    return new FormGroup({data: new FormControl(value)});
  }

  private resetErrors(): void {
    this.error = null;
    this.callbackErrorsSubject.next(null);
    this.alertService.clear();
  }

}
