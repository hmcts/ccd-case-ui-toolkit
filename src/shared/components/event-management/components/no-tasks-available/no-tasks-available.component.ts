import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-no-tasks-available',
  templateUrl: './no-tasks-available.component.html'
})
export class NoTasksAvailableComponent {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
  }
}
