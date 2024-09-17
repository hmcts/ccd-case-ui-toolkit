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
    // Removes task to complete so event completes without task
    this.context.sessionStorageService.removeItem('clientContext');
    // may be able to remove this call below since it is now unneccesary
    this.notifyEventCompletionCancelled.emit(true);
  }
}
