import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-task-cancelled',
  templateUrl: './task-cancelled.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TaskCancelledComponent {
  @Input() public caseId: string;
}
