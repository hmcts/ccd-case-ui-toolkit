import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { CaseNotifier } from '../../../../case-editor';

@Component({
  selector: 'ccd-query-case-details-header',
  templateUrl: './query-case-details-header.component.html',
  styleUrls: ['./query-case-details-header.component.scss']
})
export class QueryCaseDetailsHeaderComponent {
  public caseView$: Observable<CaseView>;

  constructor(caseNotifier: CaseNotifier) {
    this.caseView$ = caseNotifier.caseView;
  }
}
