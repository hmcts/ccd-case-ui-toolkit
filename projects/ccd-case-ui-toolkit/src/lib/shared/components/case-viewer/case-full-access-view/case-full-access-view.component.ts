import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Input, NgZone, OnChanges, OnDestroy, OnInit,
  SimpleChanges, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import {
  NotificationBannerConfig,
  NotificationBannerHeaderClass,
  NotificationBannerType
} from '../../../../components/banners/notification-banner';
import { ShowCondition } from '../../../directives';
import { Activity, CaseField, CaseTab, CaseView, CaseViewTrigger, DisplayMode, Draft, DRAFT_QUERY_PARAM } from '../../../domain';
import {
  ActivityPollingService,
  AlertService,
  DraftService,
  ErrorNotifierService,
  FieldsUtils,
  NavigationNotifierService,
  NavigationOrigin,
  OrderService,
  SessionStorageService
} from '../../../services';
import { ConvertHrefToRouterService } from '../../case-editor/services/convert-href-to-router.service';
import { DeleteOrCancelDialogComponent } from '../../dialogs';
import { CallbackErrorsContext } from '../../error';
import { initDialog } from '../../helpers';

@Component({
  selector: 'ccd-case-full-access-view',
  templateUrl: './case-full-access-view.component.html',
  styleUrls: ['./case-full-access-view.component.scss']
})
export class CaseFullAccessViewComponent implements OnInit, OnDestroy, OnChanges {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  public static readonly TRIGGER_TEXT_START = 'Go';
  public static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Go';
  public static readonly UNICODE_SPACE = '%20';
  public static readonly EMPTY_SPACE = ' ';
  private readonly HEARINGS_TAB_LABEL = 'Hearings';

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
  public notificationBannerConfig: NotificationBannerConfig;
  public selectedTabIndex = 0;
  public activeCaseFlags = false;
  private subs: Subscription[] = [];

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
    private readonly location: Location,
    private readonly crf: ChangeDetectorRef,
    private readonly sessionStorageService: SessionStorageService
  ) {
  }

  public ngOnInit(): void {
    initDialog();
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

    this.sessionStorageService.removeItem('eventUrl');

    this.subscription = this.convertHrefToRouterService.getHrefMarkdownLinkContent().subscribe((hrefMarkdownLinkContent: string) => {
      // do not convert router with initial default value; convert to router only on updated link content
      if (hrefMarkdownLinkContent !== 'Default') {
        this.convertHrefToRouterService.callAngularRouter(hrefMarkdownLinkContent);
      }
    });

    if (this.activityPollingService.isEnabled && !this.activitySubscription) {
      this.ngZone.runOutsideAngular(() => {
        this.activitySubscription = this.postViewActivity().subscribe();
      });
    }

    this.checkRouteAndSetCaseViewTab();

    // Check for active Case Flags
    this.activeCaseFlags = this.hasActiveCaseFlags();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.prependedTabs && !changes.prependedTabs.firstChange) {
      this.init();
      this.crf.detectChanges();
      this.organiseTabPosition();
    }
  }

  public isPrintEnabled(): boolean {
    return this.caseDetails.case_type.printEnabled;
  }

  public ngOnDestroy(): void {
    if (this.activityPollingService.isEnabled) {
      this.unsubscribe(this.activitySubscription);
    }
    if (!this.route.snapshot.data.case) {
      this.unsubscribe(this.caseSubscription);
    }
    this.unsubscribe(this.callbackErrorsSubject);
    this.unsubscribe(this.errorSubscription);
    this.unsubscribe(this.subscription);
    this.subs.forEach(s => s.unsubscribe());
  }

  public unsubscribe(subscription: any) {
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  private checkRouteAndSetCaseViewTab(): void {
    this.subs.push(this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event && (event as any).url;
        if (url) {
          const tabUrl = url ? url.split('#') : null;
          const tab = tabUrl && tabUrl.length > 1 ? tabUrl[tabUrl.length - 1].replaceAll('%20', ' ') : '';
          const matTab = this.tabGroup._tabs.find((x) => x.textLabel.toLowerCase() === tab.toLowerCase());
          if (matTab && matTab.position) {
            this.tabGroup.selectedIndex = matTab.position;
          }
        }
      }));
  };

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

  public organiseTabPosition(): void {
    let matTab;
    const url = this.location.path(true);
    let hashValue = url.substring(url.indexOf('#') + 1);
    if (!url.includes('#') && !url.includes('roles-and-access') && !url.includes('tasks') && !url.includes('hearings')) {
      const paths = url.split('/');
      // lastPath can be /caseId, or the tabs /tasks, /hearings etc.
      const lastPath = decodeURIComponent(paths[paths.length - 1]);
      let foundTab: CaseTab = null;
      if (!this.prependedTabs) {
        this.prependedTabs = [];
      }
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
        this.router.navigate(['cases', 'case-details', this.caseDetails.case_id], {fragment: preSelectTab.label}).then(() => {
          matTab = this.tabGroup._tabs.find((x) => x.textLabel === preSelectTab.label);
          this.tabGroup.selectedIndex = matTab.position;
        });
      }
    } else {
      const regExp = new RegExp(CaseFullAccessViewComponent.UNICODE_SPACE, 'g');
      hashValue = hashValue.replace(regExp, CaseFullAccessViewComponent.EMPTY_SPACE);
      if (hashValue.includes('hearings')) {
        hashValue = 'hearings';
      } else {
        if (hashValue.includes('roles-and-access') || hashValue.includes('tasks')) {
          hashValue = hashValue.includes('roles-and-access') ? 'roles and access' : 'tasks';
        }
      }
      matTab = this.tabGroup._tabs.find((x) =>
        x.textLabel.replace(CaseFullAccessViewComponent.EMPTY_SPACE, '').toLowerCase() ===
                                hashValue.replace(CaseFullAccessViewComponent.EMPTY_SPACE, '').toLowerCase());
      if (matTab && matTab.position) {
        this.tabGroup.selectedIndex = matTab.position;
      }
    }
  }

  // Refactored under EXUI-110 to address infinite tab loop to use tabIndexChanged instead
  public tabChanged(tabIndexChanged: number): void {
    const matTab = this.tabGroup._tabs.find(tab => tab.isActive);
    const tabLabel = matTab.textLabel;
    // sortedTabs are fragments
    // appended/prepepended tabs use router navigation
    if ((tabIndexChanged <= 1 && this.prependedTabs && this.prependedTabs.length) ||
      (this.appendedTabs && this.appendedTabs.length && tabLabel === this.HEARINGS_TAB_LABEL)) {
      // Hack to get ID from tab as it's not easily achieved through Angular Material Tabs
      const tab = matTab['_viewContainerRef'] as ViewContainerRef;
      const id = (tab.element.nativeElement as HTMLElement).id;
      // cases/case-details/:caseId/hearings
      // cases/case-details/:caseId/roles-and-access
      this.router.navigate([id], { relativeTo: this.route });
    } else {
      // Routing here is based on tab label, not ideal
      // cases/case-details/:caseId#tabLabel
      this.router.navigate(['cases', 'case-details', this.caseDetails.case_id], { fragment: tabLabel })
    }
  }

  public onLinkClicked(triggerOutputEventText: string): void {
    // Get the *absolute* (not relative) index of the target tab and set as the active tab, using the selectedIndex input
    // of mat-tab-group (bound to selectedTabIndex)
    const targetTabIndex = this.tabGroup._tabs.toArray().findIndex(tab => tab.textLabel === triggerOutputEventText);
    if (targetTabIndex > -1) {
      this.selectedTabIndex = targetTabIndex;
    }
  }

  public hasActiveCaseFlags(): boolean {
    // Determine which tab contains the FlagLauncher CaseField type, from the CaseView object in the snapshot data
    const caseFlagsTab = this.caseDetails.tabs
      ? (this.caseDetails.tabs).filter(
        tab => tab.fields && tab.fields.some(caseField => FieldsUtils.isFlagLauncherCaseField(caseField)))[0]
      : null;

    if (caseFlagsTab) {
      // Get the active case flags count
      // Cannot filter out anything other than to remove the FlagLauncher CaseField because Flags fields may be
      // contained in other CaseField instances, either as a sub-field of a Complex field, or fields in a collection
      // (or sub-fields of Complex fields in a collection)
      const activeCaseFlags = caseFlagsTab.fields
        .filter(caseField => !FieldsUtils.isFlagLauncherCaseField(caseField) && caseField.value)
        .reduce((active, caseFlag) => {
          return FieldsUtils.countActiveFlagsInCaseField(active, caseFlag);
        }, 0);

      if (activeCaseFlags > 0) {
        const description = activeCaseFlags > 1
          ? `There are ${activeCaseFlags} active flags on this case.` : 'There is 1 active flag on this case.';
        // Initialise and display notification banner
        this.notificationBannerConfig = {
          bannerType: NotificationBannerType.INFORMATION,
          headingText: 'Important',
          description,
          showLink: true,
          linkText: 'View case flags',
          triggerOutputEvent: true,
          triggerOutputEventText: caseFlagsTab.label,
          headerClass: NotificationBannerHeaderClass.INFORMATION
        };

        return true;
      }
    }

    return false;
  }

  /**
   * Indicates that a CaseField is to be displayed without a label, as is expected for all ComponentLauncher-type
   * fields.
   * @param caseField The `CaseField` instance to check
   * @returns `true` if it should not have a label; `false` otherwise
   */
  public isFieldToHaveNoLabel(caseField: CaseField): boolean {
    return caseField.field_type.type === 'ComponentLauncher'
      && caseField.display_context_parameter === '#ARGUMENT(CaseFileView)';
  }

  private init(): void {
    // Clone and sort tabs array
    this.sortedTabs = this.orderService.sort(this.caseDetails.tabs);
    this.caseFields = this.getTabFields();
    this.sortedTabs = this.sortTabFieldsAndFilterTabs(this.sortedTabs);
    this.formGroup = this.buildFormGroup(this.caseFields);

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

  private getUrlFragment(url: string) {
    return url.split('#')[url.split('#').length - 1];
  }

  private getTabIndexByTabLabel(tabGroup: MatTabGroup, tabLabel) {
    return tabGroup._tabs.toArray().findIndex((t) => t.textLabel.toLowerCase() === tabLabel.toLowerCase());
  }

}
