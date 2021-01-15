import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { CaseEventData, CaseEventTrigger, CaseView, HttpError, Profile } from '../../../domain';
import { AlertService } from '../../../services';
import { CasesService, EventTriggerService } from '../services';

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

  public caseDetails: CaseView;
  public eventTrigger: CaseEventTrigger;

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

  submit(): (sanitizedEditForm: CaseEventData, profile?: Profile) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, profile?: Profile) =>
      this.casesService.createEvent(this.caseDetails, sanitizedEditForm, profile);
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
