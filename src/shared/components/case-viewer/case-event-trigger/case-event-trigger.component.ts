import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { Activity, CaseEventData, CaseEventTrigger, CaseView, DisplayMode } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes';
import {
  ActivityPollingService,
  ActivityService,
  ActivitySocketService,
  AlertService,
  EventStatusService,
} from '../../../services';
import { MODES } from '../../../services/activity/utils';
import { CaseNotifier, CasesService } from '../../case-editor';

@Component({
  selector: 'ccd-case-event-trigger',
  templateUrl: './case-event-trigger.html'
})
export class CaseEventTriggerComponent implements OnInit, OnDestroy {
  BANNER = DisplayMode.BANNER;
  eventTrigger: CaseEventTrigger;
  caseDetails: CaseView;
  activitySubscription: Subscription;
  caseSubscription: Subscription;
  parentUrl: string;

  constructor(
    private ngZone: NgZone,
    private casesService: CasesService,
    private caseNotifier: CaseNotifier,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private caseReferencePipe: CaseReferencePipe,
    private readonly activityService: ActivityService,
    private readonly activityPollingService: ActivityPollingService,
    private readonly activitySocketService: ActivitySocketService
  ) {
  }

  ngOnInit(): void {
    if (this.route.snapshot.data.case) {
      this.caseDetails = this.route.snapshot.data.case;
    } else {
      this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
        this.caseDetails = caseDetails;
      });
    }
    this.eventTrigger = this.route.snapshot.data.eventTrigger;
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
  }

  postEditActivity(): Observable<Activity[]> {
    return this.activityPollingService.postEditActivity(this.caseDetails.case_id);
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) =>
      this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
  }

  validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService.validateCase(
      this.caseDetails.case_type.id, sanitizedEditForm,
      pageId);
  }

  submitted(event: any): void {
    let eventStatus: string = event['status'];
    this.router
      .navigate([this.parentUrl])
      .then(() => {
        let caseReference = this.caseReferencePipe.transform(this.caseDetails.case_id.toString());
        if (EventStatusService.isIncomplete(eventStatus)) {
          this.alertService.warning(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name} `
            + `but the callback service cannot be completed`);
        } else {
          this.alertService.success(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name}`, true);
        }
      });
  }

  cancel(): Promise<boolean> {
    return this.router.navigate([this.parentUrl]);
  }

  isDataLoaded(): boolean {
    return !!(this.eventTrigger && this.caseDetails);
  }
}
