import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { DisplayMode, CaseEventTrigger, CaseView, Activity, CaseEventData } from '../../../domain';
import { CaseService, CasesService } from '../../case-editor';
import { AlertService, ActivityPollingService, EventStatusService } from '../../../services';
import { CaseReferencePipe } from '../../../pipes';
import { NgZone } from '@angular/core';

@Component({
  selector: 'ccd-case-event-trigger',
  templateUrl: './case-event-trigger.html'
})
export class CaseEventTriggerComponent implements OnInit, OnDestroy {
  BANNER = DisplayMode.BANNER;
  eventTrigger: CaseEventTrigger;
  caseDetails: CaseView;
  subscription: Subscription;
  parentUrl: string;

  constructor(
    private ngZone: NgZone,
    private casesService: CasesService,
    private caseService: CaseService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private caseReferencePipe: CaseReferencePipe,
    private activityPollingService: ActivityPollingService
  ) { }

  ngOnInit(): void {
    if (this.route.snapshot.data.case) {
      this.caseDetails = this.route.snapshot.data.case;
    } else {
        this.caseService.caseView.subscribe(caseDetails => {
          this.caseDetails = caseDetails;
        });
    }
    this.eventTrigger = this.route.snapshot.data.eventTrigger;
    if (this.activityPollingService.isEnabled) {
      this.ngZone.runOutsideAngular( () => {
        this.subscription = this.postEditActivity().subscribe((_resolved) => {
          // console.log('Posted EDIT activity and result is: ' + JSON.stringify(_resolved));
        });
      });
    }
    this.route.parent.url.subscribe(path => {
      this.parentUrl = `/${path.join('/')}`;
    });
  }

  ngOnDestroy() {
    if (this.activityPollingService.isEnabled) {
      this.subscription.unsubscribe();
    }
  }

  postEditActivity(): Observable<Activity[]> {
    return this.activityPollingService.postEditActivity(this.caseDetails.case_id);
  }

  replaceFixedListEmptyStringWithNull(sanitizedEditForm: CaseEventData) {
    let data = sanitizedEditForm.data;
    console.log('Traversing data...');
    this.traverseData(data);
  }

  private traverseData(data: object, parentLocator = '') {
    Object.keys(data).forEach(fieldId => {
      if (typeof data[fieldId] === 'object') {
        if (Array.isArray(data[fieldId])) {
          data[fieldId].foreach(subDataObject => {
            this.traverseData(subDataObject, parentLocator + '.' + fieldId);
          });
        } else {
          this.traverseData(data[fieldId], parentLocator + '.' + fieldId);
        }
      }
      console.log('working on', fieldId, ' data[fieldId]=', data[fieldId]);
      if (data[fieldId] === '' && this.isFixedList(fieldId, parentLocator)) {
        console.log('Found a fixed List with null fieldId --> ', fieldId);
        data[fieldId] = null;
      }
    });
  }

  private isFixedList(fieldId: string, parentLocator: string): boolean {
    console.log('CaseFields', this.eventTrigger.case_fields);
    return !!this.eventTrigger.case_fields.find(field => field.id === fieldId && field.field_type.type === 'FixedList');
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    console.log('CaseEventTriggerComponent Submit called');
    return (sanitizedEditForm: CaseEventData) => {
      console.log('replaceFixedListEmptyStringWithNull');
      this.replaceFixedListEmptyStringWithNull(sanitizedEditForm)
      return this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
    }
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
          this.alertService.success(`Case #${caseReference} has been updated with event: ${this.eventTrigger.name}`);
        }
    });
  }

  cancel(): Promise<boolean> {
    return this.router.navigate([this.parentUrl]);
  }

  isDataLoaded(): boolean {
    return this.eventTrigger && this.caseDetails ? true : false;
  }
}
