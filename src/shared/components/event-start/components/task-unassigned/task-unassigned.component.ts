import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-unassigned',
  templateUrl: './task-unassigned.component.html'
})
export class TaskUnassignedComponent {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
  }
}
