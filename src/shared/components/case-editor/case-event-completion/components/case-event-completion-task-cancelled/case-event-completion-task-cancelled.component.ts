import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-case-event-completion-task-cancelled',
  templateUrl: './case-event-completion-task-cancelled.html'
})
export class CaseEventCompletionTaskCancelledComponent {
  public caseId: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.params['cid'];
  }
}
