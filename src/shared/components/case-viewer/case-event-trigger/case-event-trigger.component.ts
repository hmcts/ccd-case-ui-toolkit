import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { DisplayMode, CaseEventTrigger, CaseView, Activity, CaseEventData } from '../../../domain';
import { CasesService } from '../../case-editor';
import { AlertService, ActivityPollingService, EventStatusService } from '../../../services';
import { CaseReferencePipe } from '../../../pipes';

@Component({
  selector: 'ccd-case-event-trigger',
  templateUrl: './case-event-trigger.html'
})
export class CaseEventTriggerComponent implements OnInit, OnDestroy {
  BANNER = DisplayMode.BANNER;
  eventTrigger: CaseEventTrigger;
  caseDetails: CaseView;
  subscription: Subscription;

  constructor(
    private casesService: CasesService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private caseReferencePipe: CaseReferencePipe,
    private activityPollingService: ActivityPollingService
  ) { }

  ngOnInit(): void {
    this.caseDetails = this.route.snapshot.data.case;
    this.eventTrigger = this.route.snapshot.data.eventTrigger;
    this.subscription = this.postEditActivity().subscribe((_resolved) => {
      // console.log('Posted EDIT activity and result is: ' + JSON.stringify(resolved));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  postEditActivity(): Observable<Activity[]> {
    return this.activityPollingService.postEditActivity(this.caseDetails.case_id);
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
  }

  validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService.validateCase(
      this.caseDetails.case_type.id, sanitizedEditForm,
      pageId);
  }

  submitted(event: any): void {
    let eventStatus: string = event['status'];
    this.router
      .navigate(['case', this.caseDetails.case_type.jurisdiction.id, this.caseDetails.case_type.id, this.caseDetails.case_id])
      .then(() => {
        let caseReference = this.caseReferencePipe.transform(this.caseDetails.case_id.toString());
        if (EventStatusService.isIncomplete(eventStatus)) {
          this.alertService.warning(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name} `
            + `but the callback service cannot be completed`);
        } else {
          this.alertService.success(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name}`);
        }
    });
  }

  cancel(): Promise<boolean> {
    return this.router.navigate(['/case', this.caseDetails.case_type.jurisdiction.id, this.caseDetails.case_type.id,
      this.caseDetails.case_id]);
  }
}
