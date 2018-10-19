import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { CasesService } from '../cases/cases.service';
import { HttpError } from '../http';
import { AlertService } from '../alert';
import { CaseEventData, CaseView } from '../domain';

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
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.casesService.getCaseViewV2(this.case).toPromise()
      .then(caseView => this.caseDetails = caseView)
      .then(caseView => this.casesService.getEventTrigger(caseView.case_type.jurisdiction.id,
                                                          caseView.case_type.id,
                                                          this.event,
                                                          caseView.case_id)
                                                          .toPromise())
      .then(eventTrigger => this.eventTrigger = eventTrigger)
      .catch((error: HttpError) => {
        this.alertService.error(error.message);
        return Observable.throw(error);
      });
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
  }

  validate(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => this.casesService.validateCase(
      this.caseDetails.case_type.jurisdiction.id,
      this.caseDetails.case_type.id, sanitizedEditForm);
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
