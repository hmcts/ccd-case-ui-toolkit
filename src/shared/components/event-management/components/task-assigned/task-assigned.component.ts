import { Component, Input, OnInit } from '@angular/core';
import { Task } from '../../../../domain/work-allocation/Task';

@Component({
  selector: 'app-task-assigned',
  templateUrl: './task-assigned.component.html'
})
export class TaskAssignedComponent implements OnInit {
  @Input() public task: Task = null;
  @Input() public caseId: string;

  public assignedUserName: string;

  public ngOnInit(): void {
    this.assignedUserName = this.task ? this.task.assignee : 'another user'
  }
}
