import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QueryCreateContext, QueryListItem } from '../../../models';

@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html',
  styleUrls: ['./query-write-respond-to-query.component.scss']
})
export class QueryWriteRespondToQueryComponent {
  @Input() public queryItem: QueryListItem;
  @Input() public formGroup: FormGroup;
  // Set default value as false for testing follow up EUI-8454
  @Input() public QueryCreateContext: QueryCreateContext = QueryCreateContext.FOLLOWUP;
  public readonly queryItemTypeEnum = QueryCreateContext;
}
