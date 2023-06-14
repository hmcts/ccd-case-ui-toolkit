import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseNotifier } from '../../../../../case-editor/services';
import { QueryItemType, QueryListItem } from '../../../models';

@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html',
  styleUrls: ['./query-write-respond-to-query.component.scss']
})

export class QueryWriteRespondToQueryComponent implements OnInit {
  @Input() public queryItem: QueryListItem;
  @Input() public formGroup: FormGroup;
  // Set default value as false for testing follow up EUI-8454
  @Input() public queryCreateContext: QueryItemType = QueryItemType.FOLLOWUP;
  public readonly queryItemTypeEnum = QueryItemType;
  public caseId: string;

  constructor(private readonly caseNotifier: CaseNotifier) { }

  public ngOnInit(): void {
    this.caseNotifier.caseView.subscribe(caseDetails => {
      this.caseId = caseDetails.case_id;
    });
  }
}
