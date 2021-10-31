import { Location } from '@angular/common';
import { AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { DeleteOrCancelDialogComponent } from '../../dialogs';
import { ShowCondition } from '../../../directives';
import { Activity, CaseField, CaseTab, CaseView, CaseViewTrigger, DisplayMode, Draft, DRAFT_QUERY_PARAM, } from '../../../domain';
import {
  ActivityPollingService,
  AlertService,
  DraftService,
  ErrorNotifierService,
  NavigationNotifierService,
  NavigationOrigin,
  OrderService,
} from '../../../services';
import { CallbackErrorsContext } from '../../error';
import { initDialog } from '../../helpers';

@Component({
  selector: 'ccd-case-full-access-view',
  templateUrl: './case-full-access-view.component.html',
  styleUrls: ['./case-full-access-view.component.scss']
})
export class CaseFullAccessViewComponent implements OnInit, OnDestroy, AfterViewInit {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  static readonly TRIGGER_TEXT_START = 'Go';
  static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Go';
  static readonly UNICODE_SPACE = '%20';
  static readonly EMPTY_SPACE = ' ';

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;
  @Input() public caseDetails: CaseView;
  @Input() public prependedTabs: CaseTab[] = [];

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

  public callbackErrorsSubject: Subject<any> = new Subject();
  @ViewChild('tabGroup') public tabGroup: MatTabGroup;

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
    private readonly location: Location
  ) {
  }

  ngOnInit() {
    initDialog(this.dialogConfig);

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
  }

  public isPrintEnabled(): boolean {
    return this.caseDetails.case_type.printEnabled;
  }

  ngOnDestroy() {
    if (this.activityPollingService.isEnabled) {
      this.activitySubscription.unsubscribe();
    }
    this.callbackErrorsSubject.unsubscribe();
    if (!this.route.snapshot.data.case) {
      this.caseSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
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
    return this.sortedTabs.length > 0 || this.prependedTabs.length > 0;
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
    // if we have prepended tabs route to one of the prepended tabs
    if (!url.includes('#') && this.prependedTabs && this.prependedTabs.length) {
      const paths = url.split('/');
      const tabName = decodeURIComponent(paths[paths.length - 1]);
      const selectedTab: CaseTab = this.prependedTabs.find((caseTab: CaseTab) => caseTab.id.toLowerCase() === tabName.toLowerCase());
      const tab: string = selectedTab ? selectedTab.id : 'tasks'
      this.router.navigate(['cases', 'case-details', this.caseDetails.case_id, tab]).then(() => {
        matTab = this.tabGroup._tabs.find((x) => x.textLabel === selectedTab.label);
        this.tabGroup.selectedIndex = matTab.position;
      });
    } else {
      const regExp = new RegExp(CaseFullAccessViewComponent.UNICODE_SPACE, 'g');
      hashValue = hashValue.replace(regExp, CaseFullAccessViewComponent.EMPTY_SPACE);
      matTab = this.tabGroup._tabs.find((x) =>
        x.textLabel.replace(CaseFullAccessViewComponent.EMPTY_SPACE, '').toLowerCase() === hashValue.toLowerCase());
      if (matTab && matTab.position) {
        this.tabGroup.selectedIndex = matTab.position;
      }
    }
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    const tab = tabChangeEvent.tab['_viewContainerRef'] as ViewContainerRef;
    const id = (<HTMLElement>tab.element.nativeElement).id
    if (tabChangeEvent.index <= 1 && this.prependedTabs.length) {
      this.router.navigate([id], {relativeTo: this.route});
    } else {
      this.router.navigate(['cases', 'case-details', this.caseDetails.case_id]).then(() => {
        window.location.hash = id;
      })
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
