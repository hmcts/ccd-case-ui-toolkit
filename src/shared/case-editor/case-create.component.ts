import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { Draft } from '../domain/draft';
import { CasesService } from '../cases/cases.service';
import { HttpError } from '../http';
import { AlertService } from '../alert';
import { CaseEventData } from '../domain';
import { DraftService } from '../draft/draft.service';

@Component({
  selector: 'ccd-case-create',
  templateUrl: 'case-create.component.html'
})
export class CaseCreateComponent implements OnInit {

  @Input()
  jurisdiction: string;
  @Input()
  caseType: string;
  @Input()
  event: string;

  @Output()
  cancelled: EventEmitter<any> = new EventEmitter();
  @Output()
  submitted: EventEmitter<any> = new EventEmitter();

  private eventTrigger: CaseEventTrigger;
  isEventTriggerDataAvailable = false;

  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
    private draftService: DraftService,
  ) {}

  ngOnInit(): void {
    console.log('AAAAAAAA');
    this.casesService.getEventTrigger(this.jurisdiction, this.caseType, this.event).toPromise()
      .then(eventTrigger => {
        this.eventTrigger = eventTrigger;
        this.isEventTriggerDataAvailable = true;
        console.log('this.eventTrigger=', this.eventTrigger);
      })
      .catch((error: HttpError) => {
        console.log('error=', error);
        this.alertService.error(error.message);
        return Observable.throw(error);
      });
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    console.log('validate');
    return (sanitizedEditForm: CaseEventData) => {
      sanitizedEditForm.draft_id = this.eventTrigger.case_id;
      return this.casesService.createCase(this.jurisdiction, this.caseType, sanitizedEditForm);
    }
  }

  validate(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    console.log('validate');
    return (sanitizedEditForm: CaseEventData) => this.casesService.validateCase(this.jurisdiction, this.caseType, sanitizedEditForm);
  }

  saveDraft(): (caseEventData: CaseEventData) => Observable<Draft> {
    console.log('saveDraft');
    if (this.eventTrigger.can_save_draft) {
      return (caseEventData: CaseEventData) => this.draftService.createOrUpdateDraft(this.jurisdiction,
            this.caseType,
            this.eventTrigger.case_id,
            caseEventData);
    }
  }

  emitCancelled(event): void {
    console.log('!!!!!!!11111');
    this.cancelled.emit(event);
  }

  emitSubmitted(event): void {
    console.log('!!!!!!!22222');
    this.submitted.emit(event);
  }

}
