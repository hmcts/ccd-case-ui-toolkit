import { Component, Inject } from '@angular/core';
import { CaseEventCompletionComponent, COMPONENT_PORTAL_INJECTION_TOKEN } from '../../case-event-completion.component';

@Component({
  selector: 'app-case-event-completion-task-cancelled',
  templateUrl: './case-event-completion-task-cancelled.html'
})
export class CaseEventCompletionTaskCancelledComponent {
  public caseId: string;

  constructor(@Inject(COMPONENT_PORTAL_INJECTION_TOKEN) private parentComponent: CaseEventCompletionComponent) {
    this.caseId = this.parentComponent.context.caseId;
  }

  public onContinue(): void {
    // Emit event can be completed event
    this.parentComponent.eventCanBeCompleted.emit(true);
  }
}
