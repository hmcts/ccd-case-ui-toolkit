import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CaseEventData, CaseView } from '../../../domain';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { Draft } from '../../../domain/draft.model';
import { HttpError } from '../../../domain/http';
import { AlertService } from '../../../services/alert';
import { DraftService } from '../../../services/draft/draft.service';
import { CaseNotifier } from '../services';
import { CasesService } from '../services/cases.service';
import { EventTriggerService } from '../services/event-trigger.service';

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
    private caseNotifier: CaseNotifier
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

    const caseView = new CaseView();
    caseView.case_type.jurisdiction.id = this.jurisdiction;
    caseView.case_type.id = this.caseType;
    this.caseNotifier.announceCase(caseView);
  }

  submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => {
      sanitizedEditForm.draft_id = this.eventTrigger.case_id;
      return this.casesService.createCase(this.caseType, sanitizedEditForm);
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
