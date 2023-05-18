import { Component, Input, OnInit } from '@angular/core';
import { QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-details-table',
  templateUrl: './query-details-table.component.html',
  styleUrls: ['./query-details-table.component.scss']
})
export class QueryDetailsTableComponent {
  @Input() public queryItem: QueryListItem;
}
