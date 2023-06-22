import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-details-table',
  templateUrl: './query-details-table.component.html',
  styleUrls: ['./query-details-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QueryDetailsTableComponent implements OnInit{
  @Input() public queryItem: QueryListItem;

  public ngOnInit(): void {}
}
