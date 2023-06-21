import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CaseField } from '../../../../../domain';
import { caseFieldMockData } from '../../__mocks__';
import { QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-details-table',
  templateUrl: './query-details-table.component.html',
  styleUrls: ['./query-details-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QueryDetailsTableComponent implements OnInit{
  @Input() public queryItem: QueryListItem;
  public caseField: CaseField;

  public ngOnInit(): void {
    // Mock object
    this.caseField = caseFieldMockData;
  }
}
