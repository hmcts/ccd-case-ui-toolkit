import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CasesService } from '../services/cases.service';
import { HttpError } from '../../../domain/http';
import { AlertService } from '../../../services/alert';
import { CaseEventData, CaseView } from '../../../domain';
import { EventTriggerService } from '../services/event-trigger.service';

@Component({
  selector: 'ccd-case-progress',
  templateUrl: 'case-progress.component.html'
})
export class CaseProgressComponent implements OnInit {

  @Input()
  case: string;
  @Input()
  event: string;

  @Output()
  cancelled: EventEmitter<any> = new EventEmitter();
  @Output()
  submitted: EventEmitter<any> = new EventEmitter();

  private caseDetails: CaseView;
  private eventTrigger: CaseEventTrigger;

  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
    private eventTriggerService: EventTriggerService
  ) {}

  ngOnInit(): void {
    let caseTypeId = undefined;
    this.casesService.getCaseViewV2(this.case).toPromise()
      .then(caseView => this.caseDetails = caseView)
      .then(caseView => this.casesService.getEventTrigger(caseTypeId, this.event, caseView.case_id)
        .toPromise())
      .then(eventTrigger => {
        this.eventTriggerService.announceEventTrigger(eventTrigger);
        this.eventTrigger = eventTrigger;
      })
      .catch((error: HttpError) => {
        this.alertService.error(error.message);
        return throwError(error);
      });
  }

  replaceFixedListEmptyStringWithNull(sanitizedEditForm: CaseEventData) {
    let data = sanitizedEditForm.data;
    console.log('Traversing data...');
    this.traverseData(data);
  }

  private traverseData(data: object) {
    Object.keys(data).forEach(fieldId => {
      // if (typeof data[fieldId] === 'object') {
      //   this.traverseData(data[fieldId]);
      // }
      console.log('working on', fieldId);
      if (data[fieldId] === '' && this.isFixedList(fieldId)) {
        console.log('Founbd a fixed List with null fieldId --> ', fieldId);
        data[fieldId] = 'null';
      }
    });
  }

  private isFixedList(value: string): boolean {
    return !!this.eventTrigger.case_fields.find(field => field.id === value && field.field_type.type === 'FixedList');
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    console.log('submit called');
    return (sanitizedEditForm: CaseEventData) => {
      console.log('replaceFixedListEmptyStringWithNull');
      this.replaceFixedListEmptyStringWithNull(sanitizedEditForm)
      return this.casesService.createEvent(this.caseDetails, sanitizedEditForm)
    };
  }

  validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService.validateCase(
      this.caseDetails.case_type.id,
      sanitizedEditForm,
      pageId);
  }

  emitCancelled(event): void {
    this.cancelled.emit(event);
  }

  emitSubmitted(event): void {
    this.submitted.emit(event);
  }

  isDataLoaded(): boolean {
    return this.eventTrigger && this.caseDetails ? true : false;
  }
}
