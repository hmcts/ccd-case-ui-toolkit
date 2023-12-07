import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-multiple-tasks-exist',
  templateUrl: './multiple-tasks-exist.component.html'
})
export class MultipleTasksExistComponent {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
  }
}
