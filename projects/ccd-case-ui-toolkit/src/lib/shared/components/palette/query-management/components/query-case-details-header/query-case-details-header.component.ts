import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseView } from '../../../../../domain';

@Component({
  selector: 'ccd-query-case-details-header',
  templateUrl: './query-case-details-header.component.html',
  styleUrls: ['./query-case-details-header.component.scss']
})
export class QueryCaseDetailsHeaderComponent {
  public caseView: CaseView;

  constructor(private activatedRoute: ActivatedRoute) {
    this.caseView = this.activatedRoute.snapshot.data.case;
  }
}
