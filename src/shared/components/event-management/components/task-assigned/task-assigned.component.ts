import { Component, Input } from '@angular/core';
import { Task } from '../../../../domain/work-allocation/Task';

@Component({
  selector: 'app-task-assigned',
  templateUrl: './task-assigned.component.html'
})
export class TaskAssignedComponent {
  @Input() public task: Task = null;
  @Input() public caseId: string = null;
}
