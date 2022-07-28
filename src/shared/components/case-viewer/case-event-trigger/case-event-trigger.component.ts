import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';

import { Activity, CaseEventData, CaseEventTrigger, CaseView, DisplayMode } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes';
import { ActivityPollingService, AlertService, EventStatusService } from '../../../services';
import { CaseNotifier, CasesService } from '../../case-editor';

@Component({
  selector: 'ccd-case-event-trigger',
  templateUrl: './case-event-trigger.html'
})
export class CaseEventTriggerComponent implements OnInit, OnDestroy {
  public BANNER = DisplayMode.BANNER;
  public eventTrigger: CaseEventTrigger;
  public caseDetails: CaseView;
  public activitySubscription: Subscription;
  public caseSubscription: Subscription;
  public parentUrl: string;

  constructor(
    private readonly ngZone: NgZone,
    private readonly casesService: CasesService,
    private readonly caseNotifier: CaseNotifier,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly route: ActivatedRoute,
    private readonly caseReferencePipe: CaseReferencePipe,
    private readonly activityPollingService: ActivityPollingService
  ) {
  }

  public ngOnInit(): void {
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
        this.activitySubscription = this.postEditActivity().subscribe((_resolved) => {
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
  }

  public postEditActivity(): Observable<Activity[]> {
    return this.activityPollingService.postEditActivity(this.caseDetails.case_id);
  }

  public submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) =>
      this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
  }

  public validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService.validateCase(
      this.caseDetails.case_type.id, sanitizedEditForm,
      pageId);
  }

  public submitted(event: any): void {
    const eventStatus: string = event['status'];
    this.router
      .navigate([this.parentUrl])
      .then(() => {
        const caseReference = this.caseReferencePipe.transform(this.caseDetails.case_id.toString());
        if (EventStatusService.isIncomplete(eventStatus)) {
          this.alertService.warning(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name} `
            + `but the callback service cannot be completed`);
        } else {
          this.alertService.success(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name}`, true);
        }
    });
  }

  public cancel(): Promise<boolean> {
    return this.router.navigate([this.parentUrl]);
  }

  public isDataLoaded(): boolean {
    return !!(this.eventTrigger && this.caseDetails);
  }
}
