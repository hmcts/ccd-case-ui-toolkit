import { Component, Input } from '@angular/core';
import { Task } from '../../../../domain/work-allocation/Task';

@Component({
  selector: 'app-task-conflict',
  templateUrl: './task-conflict.component.html'
})
export class TaskConflictComponent {
  @Input() public task: Task;
  @Input() public caseId: string;
}
