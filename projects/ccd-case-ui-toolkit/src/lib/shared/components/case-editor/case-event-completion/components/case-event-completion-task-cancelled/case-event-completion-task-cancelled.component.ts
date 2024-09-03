import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { COMPONENT_PORTAL_INJECTION_TOKEN, CaseEventCompletionComponent } from '../../case-event-completion.component';
import { EventCompletionStateMachineContext } from '../../../domain';

@Component({
  selector: 'app-case-event-completion-task-cancelled',
  templateUrl: './case-event-completion-task-cancelled.html'
})
export class CaseEventCompletionTaskCancelledComponent implements OnInit {
  @Input()
  context: EventCompletionStateMachineContext;
  @Output()
  public notifyEventCompletionCancelled: EventEmitter<boolean> = new EventEmitter<boolean>();

  public caseId: string;

  public ngOnInit(): void {
    this.caseId = this.context.caseId;
  }

  public onContinue(): void {
    // Emit event can be completed event
    this.context.sessionStorageService.removeItem('taskToComplete');
    this.notifyEventCompletionCancelled.emit(true);
  }
}
