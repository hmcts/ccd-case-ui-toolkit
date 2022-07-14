import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { CaseEventData, CaseEventTrigger, CaseView, HttpError } from '../../../domain';
import { AlertService } from '../../../services';
import { CasesService, EventTriggerService } from '../services';

@Component({
  selector: 'ccd-case-progress',
  templateUrl: 'case-progress.component.html'
})
export class CaseProgressComponent implements OnInit {

  @Input()
  public case: string;
  @Input()
  public event: string;

  @Output()
  public cancelled: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitted: EventEmitter<any> = new EventEmitter();

  public caseDetails: CaseView;
  public eventTrigger: CaseEventTrigger;

  constructor(
    private readonly casesService: CasesService,
    private readonly alertService: AlertService,
    private readonly eventTriggerService: EventTriggerService
  ) {}

  public ngOnInit(): void {
    let caseTypeId;
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

  public submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) =>
      this.casesService.createEvent(this.caseDetails, sanitizedEditForm);
  }

  public validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService.validateCase(
      this.caseDetails.case_type.id,
      sanitizedEditForm,
      pageId);
  }

  public emitCancelled(event): void {
    this.cancelled.emit(event);
  }

  public emitSubmitted(event): void {
    this.submitted.emit(event);
  }

  public isDataLoaded(): boolean {
    return this.eventTrigger && this.caseDetails ? true : false;
  }
}
