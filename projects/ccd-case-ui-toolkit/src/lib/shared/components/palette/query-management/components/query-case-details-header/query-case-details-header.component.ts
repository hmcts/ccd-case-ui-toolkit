import { Component, Input } from '@angular/core';

@Component({
  selector: 'ccd-query-case-details-header',
  templateUrl: './query-case-details-header.component.html',
  styleUrls: ['./query-case-details-header.component.scss']
})
export class QueryCaseDetailsHeaderComponent {
  @Input() public caseId: string;
  @Input() public caseTitleDisplay: string;
}
