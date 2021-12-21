import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-multiple-tasks-exist',
  templateUrl: './multiple-tasks-exist.component.html'
})
export class MultipleTasksExistComponent {
  @Input() public caseId: string = null;
}
