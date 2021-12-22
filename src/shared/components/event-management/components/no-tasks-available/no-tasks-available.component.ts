import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-tasks-available',
  templateUrl: './no-tasks-available.component.html'
})
export class NoTasksAvailableComponent {
  @Input() public caseId: string;
}
