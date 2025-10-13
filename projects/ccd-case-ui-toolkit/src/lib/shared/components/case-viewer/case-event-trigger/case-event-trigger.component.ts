import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { Constants } from '../../../commons/constants';
import { Activity, CaseEventData, CaseEventTrigger, CaseView, DisplayMode } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes';
import {
  ActivityPollingService,
  ActivityService,
  ActivitySocketService,
  AlertService,
  EventStatusService,
  FieldsUtils,
  LoadingService,
  SessionStorageService
} from '../../../services';
import { CaseNotifier, CasesService } from '../../case-editor';
import { EventTriggerResolver } from '../services';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { MODES } from '../../../services/activity/utils';

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
    private readonly eventTriggerResolver: EventTriggerResolver,
    private readonly activitySocketService: ActivitySocketService,
    private readonly activityService: ActivityService
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
    // if (this.activityPollingService.isEnabled) {
      this.activityService.modeSubject
        .pipe(filter(mode => !!mode))
        .pipe(distinctUntilChanged())
        .subscribe(mode => {
          if (ActivitySocketService.SOCKET_MODES.indexOf(mode) > -1) {
            this.activitySocketService.connected
              .subscribe(connected => {
                if (connected) {
                  this.activitySocketService.editCase(this.caseDetails.case_id);
                }
              });
          } else if (mode === MODES.polling) {
            this.ngZone.runOutsideAngular(() => {
              this.activitySubscription = this.postEditActivity().subscribe((_resolved) => { });
            });
          }
        });
   // }
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

  public cancel(): Promise<boolean> {
    const previousUrl = this.routerCurrentNavigation?.previousNavigation?.finalUrl?.toString();
    if (previousUrl) {
      if (previousUrl.indexOf('#') > -1) {
        const url = previousUrl.split('#')[0];
        const fragment = previousUrl.split('#')[1].replace(/%20/g, ' ');
        return this.router.navigate([url], { fragment: fragment });
      } else {
        return this.router.navigate([previousUrl]);
      }
    } else {
      return this.router.navigate([this.parentUrl]);
    }
  }

  public isDataLoaded(): boolean {
    return !!(this.eventTrigger && this.caseDetails);
  }
}
