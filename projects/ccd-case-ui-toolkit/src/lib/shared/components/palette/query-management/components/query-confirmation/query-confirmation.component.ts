import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryCreateContext } from '../../models/query-create-context.enum';

@Component({
  selector: 'ccd-query-confirmation',
  templateUrl: './query-confirmation.component.html'
})
export class QueryConfirmationComponent implements OnInit {
  @Input() public queryCreateContext: QueryCreateContext;

  public caseId = '';
  public jurisdiction = '';
  public caseType = '';
  public queryCreateContextEnum = QueryCreateContext;

  constructor(private readonly route: ActivatedRoute) {
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    this.jurisdiction = this.route.snapshot.params.jurisdiction;
    this.caseType = this.route.snapshot.params.caseType;
  }
}
