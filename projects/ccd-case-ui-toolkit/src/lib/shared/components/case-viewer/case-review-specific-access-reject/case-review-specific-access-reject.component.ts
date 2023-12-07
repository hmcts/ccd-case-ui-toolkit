import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'case-review-specific-access-reject',
  templateUrl: './case-review-specific-access-reject.component.html'
})
export class CaseReviewSpecificAccessRejectComponent implements OnInit {

  public caseId: string;
  public readonly retunToTask = 'Return to the Tasks tab for this case';
  public readonly returnToMyTask = 'Return to My tasks';

  constructor(private readonly route: ActivatedRoute) { }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.data.case.case_id;
  }
}
