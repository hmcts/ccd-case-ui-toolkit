import { Component, Input, OnInit } from '@angular/core';
import { Task } from '../../../../domain/work-allocation/Task';
import { CaseView } from '../../../../domain';

@Component({
  selector: 'app-task-assigned',
  templateUrl: './task-assigned.component.html'
})
export class TaskAssignedComponent {
  @Input() public task: Task = null;
  @Input() public caseId = '1620409659381330';
}
