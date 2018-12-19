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

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
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
