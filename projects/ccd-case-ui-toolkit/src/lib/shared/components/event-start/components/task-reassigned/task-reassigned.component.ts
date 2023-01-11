import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-reassigned',
  templateUrl: './task-reassigned.component.html'
})
export class TaskReassignedComponent {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
  }
}
