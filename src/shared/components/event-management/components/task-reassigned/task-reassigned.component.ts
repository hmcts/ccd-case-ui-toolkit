import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-reassigned',
  templateUrl: './task-reassigned.component.html'
})
export class TaskReAssignedComponent {
  
  public caseId: string;
  public assignedUserName: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.assignedUserName = this.route.snapshot.data.tasks && this.route.snapshot.data.tasks.length > 0
      ? this.route.snapshot.data.tasks[0].assignee
      : 'another user'
  }
}
