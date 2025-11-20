import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { EventCompletionStateMachineContext } from '../../../domain';
import { CaseEditComponent } from '../../../case-edit';

@Component({
  selector: 'app-case-event-completion-task-cancelled',
  templateUrl: './case-event-completion-task-cancelled.html',
  standalone: false
})
export class CaseEventCompletionTaskCancelledComponent implements OnInit {
  @Input()
  context: EventCompletionStateMachineContext;
  @Output()
  public notifyEventCompletionCancelled: EventEmitter<boolean> = new EventEmitter<boolean>();

  public caseId: string;
  public jurisdiction: string;
  public caseType: string;

  public ngOnInit(): void {
    this.caseId = this.context.caseId;
    this.jurisdiction = this.context.task.jurisdiction;
    this.caseType = this.context.task.case_type_id;
  }

  public onContinue(): void {
    // Removes task to complete so event completes without task
    this.context.sessionStorageService.removeItem(CaseEditComponent.CLIENT_CONTEXT);
    // may be able to remove this call below since it is now unneccesary
    this.notifyEventCompletionCancelled.emit(true);
  }
}
