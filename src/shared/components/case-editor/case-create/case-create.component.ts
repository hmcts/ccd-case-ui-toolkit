import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { CaseEventData, CaseEventTrigger, Draft, HttpError, Profile } from '../../../domain';
import { AlertService, DraftService } from '../../../services';
import { CasesService, EventTriggerService } from '../services';

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

  public eventTrigger: CaseEventTrigger;

  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
    private draftService: DraftService,
    private eventTriggerService: EventTriggerService,
  ) {}

  ngOnInit(): void {
    this.casesService.getEventTrigger(this.caseType, this.event).toPromise()
      .then(eventTrigger => {
        this.eventTrigger = eventTrigger;
        this.eventTriggerService.announceEventTrigger(eventTrigger);
      })
      .catch((error: HttpError) => {
        this.alertService.error(error.message);
        return throwError(error);
      });
  }

  submit(): (sanitizedEditForm: CaseEventData, profile?: Profile) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, profile?: Profile) => {
      sanitizedEditForm.draft_id = this.eventTrigger.case_id;
      return this.casesService.createCase(this.caseType, sanitizedEditForm, profile);
    }
  }

  validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService
      .validateCase(this.caseType, sanitizedEditForm, pageId);
  }

  saveDraft(): (caseEventData: CaseEventData) => Observable<Draft> {
    if (this.eventTrigger.can_save_draft) {
      return (caseEventData: CaseEventData) => this.draftService.createOrUpdateDraft(this.caseType,
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
