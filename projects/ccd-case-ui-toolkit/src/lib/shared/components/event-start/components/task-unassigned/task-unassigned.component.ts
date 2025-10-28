import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-unassigned',
  templateUrl: './task-unassigned.component.html',
  standalone: false
})
export class TaskUnassignedComponent {

  public caseId: string;
  public jurisdiction: string;
  public caseType: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.jurisdiction = this.route.snapshot.data.case.case_type.jurisdiction.id;
    this.caseType = this.route.snapshot.data.case.case_type.id;
  }
}
