import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { Constants } from '../../../commons/constants';
import { Activity, CaseEventData, CaseEventTrigger, CaseView, DisplayMode } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes';
import { ActivityPollingService, AlertService, EventStatusService, FieldsUtils, LoadingService, SessionStorageService } from '../../../services';
import { CaseNotifier, CasesService } from '../../case-editor';
import { EventTriggerResolver } from '../services';

@Component({
  selector: 'ccd-case-event-trigger',
  templateUrl: './case-event-trigger.html'
})
export class CaseEventTriggerComponent implements OnInit, OnDestroy {
  public static readonly EVENT_COMPLETION_MESSAGE = `Case #%CASEREFERENCE% has been updated with event: %NAME%`;
  public static readonly CALLBACK_FAILED_MESSAGE = ' but the callback service cannot be completed';

  public BANNER = DisplayMode.BANNER;
  public eventTrigger: CaseEventTrigger;
  public caseDetails: CaseView;
  public activitySubscription: Subscription;
  public caseSubscription: Subscription;
  public parentUrl: string;
  public routerCurrentNavigation: Navigation;

  constructor(
    private readonly ngZone: NgZone,
    private readonly casesService: CasesService,
    private readonly caseNotifier: CaseNotifier,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly route: ActivatedRoute,
    private readonly caseReferencePipe: CaseReferencePipe,
    private readonly activityPollingService: ActivityPollingService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly loadingService: LoadingService,
    private eventTriggerResolver: EventTriggerResolver
  ) {
    this.routerCurrentNavigation = this.router.getCurrentNavigation();
  }

  public ngOnInit(): void {
    if (this.loadingService.hasSharedSpinner()){
      this.loadingService.unregisterSharedSpinner();
    }
    if (this.route.snapshot.data.case) {
      this.caseDetails = this.route.snapshot.data.case;
    } else {
      this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
        this.caseDetails = caseDetails;
      });
    }
    this.eventTrigger = this.route.snapshot.data.eventTrigger;
    if (this.activityPollingService.isEnabled) {
      this.ngZone.runOutsideAngular( () => {
        this.activitySubscription = this.postEditActivity().subscribe(() => {
          // console.log('Posted EDIT activity and result is: ' + JSON.stringify(_resolved));
        });
      });
    }
    this.route.parent.url.subscribe(path => {
      this.parentUrl = `/${path.join('/')}`;
    });
  }

  public ngOnDestroy(): void {
    if (this.activitySubscription && this.activityPollingService.isEnabled) {
      this.activitySubscription.unsubscribe();
    }
    if (!this.route.snapshot.data.case && this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
    this.eventTriggerResolver.resetCachedEventTrigger();
  }

  public postEditActivity(): Observable<Activity[]> {
    return this.activityPollingService.postEditActivity(this.caseDetails.case_id);
  }

  public submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) =>
      this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
  }

  public validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => {
      // Bypass validation if the eventTrigger case fields contain a FlagLauncher field; this field type cannot be
      // validated, unlike regular fields
      return this.eventTrigger?.case_fields?.some((caseField) => FieldsUtils.isCaseFieldOfType(caseField, ['FlagLauncher']))
        ? of(null)
        : this.casesService.validateCase(this.caseDetails.case_type.id, sanitizedEditForm, pageId);
    };
  }

  public submitted(event: any): void {
    const eventStatus: string = event['status'];
    const taskCompletionFailed = this.sessionStorageService.getItem('taskCompletionError') === 'true';
    this.router
      .navigate([this.parentUrl])
      .then(() => {
        const caseReference = this.caseReferencePipe.transform(this.caseDetails.case_id.toString());
        const replacements = { CASEREFERENCE: caseReference, NAME: this.eventTrigger.name };
        this.alertService.setPreserveAlerts(true);
        if (taskCompletionFailed) {
          // if task still present in session storage, we know that the task has not been correctly completed
          this.alertService.warning({
            phrase: CaseEventTriggerComponent.EVENT_COMPLETION_MESSAGE + '. ' + Constants.TASK_COMPLETION_ERROR
            , replacements});
          this.sessionStorageService.removeItem('taskCompletionError');
        } else if (EventStatusService.isIncomplete(eventStatus)) {
          this.alertService.warning({
            phrase: CaseEventTriggerComponent.EVENT_COMPLETION_MESSAGE + CaseEventTriggerComponent.CALLBACK_FAILED_MESSAGE,
            replacements
          });
        } else {
          this.alertService.success({
            phrase: CaseEventTriggerComponent.EVENT_COMPLETION_MESSAGE,
            replacements,
            preserve: true
          });
        }
      });
  }

  // replace the old link with the new one with jurisdiction and case type id
  private getNavigationUrl(url: string): string {
    const urlRegex = /\/case-details\/(\d+)/;
    const match = url.match(urlRegex);
    if (match && /^\d+$/.test(match[1]) && this.caseDetails?.case_type) {
      const jurisdiction = this.caseDetails.case_type.jurisdiction.id;
      const id = this.caseDetails.case_type.id;
      return url.replace(
        urlRegex,
        `/case-details/${jurisdiction}/${id}/${match[1]}`
      );
    }
    return url;
  }

  private getNavigationUrlWithTab(urlLink: string): string {
    const isNotCasesPath = !urlLink.startsWith('/cases');
    const match = urlLink.match(/^.*?(\d+)([^\/]*)$/);
    const hasNoExtraPath = match && !match[2];
    if (isNotCasesPath && hasNoExtraPath) {
      // Only add '/cases' prefix if not already present
      if (!urlLink.startsWith('/cases')) {
        return `/cases${urlLink}/tasks`;
      }
      return `${urlLink}/tasks`;
    }
    return urlLink;
  }

  public cancel(): Promise<boolean> {
    let previousUrl = this.routerCurrentNavigation?.previousNavigation?.finalUrl?.toString();
    if (previousUrl) {
      previousUrl = this.getNavigationUrl(previousUrl);
      if (previousUrl.indexOf('#') > -1) {
        const url = previousUrl.split('#')[0];
        const fragment = previousUrl.split('#')[1].replace(/%20/g, ' ');
        return this.router.navigate([url], { fragment: fragment });
      } else {
        return this.router.navigate([previousUrl]);
      }
    } else {
      const url = this.getNavigationUrl(this.parentUrl);
      // If there is no tab name in the URL, we need to navigate to the tasks tab
      const updatedUrl = this.getNavigationUrlWithTab(url);
      return this.router.navigate([updatedUrl]);
    }
  }

  public isDataLoaded(): boolean {
    return !!(this.eventTrigger && this.caseDetails);
  }
}
