import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { Draft } from '../domain/draft';
import { CasesService } from '../cases/cases.service';
import { HttpError } from '../http';
import { AlertService } from '../alert';
import { CaseEventData } from '../domain';
import { DraftService } from '../draft/draft.service';
import { EventTriggerService } from './eventTrigger.service';

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

  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
    private draftService: DraftService,
    private eventTriggerService: EventTriggerService,
  ) {}

  ngOnInit(): void {
    console.log('CaseCreateComponent ngOnInit');
    this.casesService.getEventTrigger(this.jurisdiction, this.caseType, this.event).toPromise()
      .then(eventTrigger => {
        this.eventTrigger = eventTrigger;
        console.log('CaseCreateComponent announceEventTrigger');
        this.eventTriggerService.announceEventTrigger(eventTrigger);
      })
      .catch((error: HttpError) => {
        this.alertService.error(error.message);
        return Observable.throw(error);
      });
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => {
      sanitizedEditForm.draft_id = this.eventTrigger.case_id;
      return this.casesService.createCase(this.jurisdiction, this.caseType, sanitizedEditForm);
    }
  }

  validate(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => this.casesService.validateCase(this.jurisdiction, this.caseType, sanitizedEditForm);
  }

  saveDraft(): (caseEventData: CaseEventData) => Observable<Draft> {
    if (this.eventTrigger.can_save_draft) {
      return (caseEventData: CaseEventData) => this.draftService.createOrUpdateDraft(this.jurisdiction,
            this.caseType,
            this.eventTrigger.case_id,
            caseEventData);
    }
  }

  emitCancelled(event): void {
    this.cancelled.emit(event);
  }

  emitSubmitted(event): void {
    this.submitted.emit(event);
  }

  isDataLoaded(): boolean {
    return this.eventTrigger ? true : false;
  }
}
