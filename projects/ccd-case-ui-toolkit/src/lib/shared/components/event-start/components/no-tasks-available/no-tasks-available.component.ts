import { Component, Input } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-no-tasks-available',
  templateUrl: './no-tasks-available.component.html',
  standalone: false
})
export class NoTasksAvailableComponent {

  public caseId: string;
  public jurisdiction: string;
  public caseType: string;

  constructor(private readonly route: ActivatedRoute) {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.jurisdiction = this.route.snapshot.data.case.case_type.jurisdiction.id;
    this.caseType = this.route.snapshot.data.case.case_type.id;
  }
}
