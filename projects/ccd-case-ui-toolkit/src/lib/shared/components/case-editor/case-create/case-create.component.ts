import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { CaseEventData, CaseEventTrigger, Draft, HttpError } from '../../../domain';
import { AlertService, DraftService } from '../../../services';
import { CasesService, EventTriggerService } from '../services';

@Component({
  selector: 'ccd-case-create',
  templateUrl: 'case-create.component.html'
})
export class CaseCreateComponent implements OnInit {

  @Input()
  public jurisdiction: string;
  @Input()
  public caseType: string;
  @Input()
  public event: string;

  @Output()
  public cancelled: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitted: EventEmitter<any> = new EventEmitter();

  public eventTrigger: CaseEventTrigger;

  constructor(
    private readonly casesService: CasesService,
    private readonly alertService: AlertService,
    private readonly draftService: DraftService,
    private readonly eventTriggerService: EventTriggerService,
  ) {}

  public ngOnInit(): void {
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

  public submit(): (sanitizedEditForm: CaseEventData) => Observable<object> {
    return (sanitizedEditForm: CaseEventData) => {
      sanitizedEditForm.draft_id = this.eventTrigger.case_id;
      return this.casesService.createCase(this.caseType, sanitizedEditForm);
    };
  }

  public validate(): (sanitizedEditForm: CaseEventData, pageId: string) => Observable<object> {
    return (sanitizedEditForm: CaseEventData, pageId: string) => this.casesService
      .validateCase(this.caseType, sanitizedEditForm, pageId);
  }

  public saveDraft(): (caseEventData: CaseEventData) => Observable<Draft> {
    if (this.eventTrigger.can_save_draft) {
      return (caseEventData: CaseEventData) => this.draftService.createOrUpdateDraft(this.caseType,
                                                                                     this.eventTrigger.case_id,
                                                                                     caseEventData);
    }
  }

  public emitCancelled(event): void {
    this.cancelled.emit(event);
  }

  public emitSubmitted(event): void {
    this.submitted.emit(event);
  }

  public isDataLoaded(): boolean {
    return this.eventTrigger ? true : false;
  }
}
