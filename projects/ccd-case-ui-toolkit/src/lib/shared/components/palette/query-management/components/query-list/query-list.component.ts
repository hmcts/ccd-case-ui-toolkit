import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SortOrder } from '../../../complex/sort-order';
import { PartyMessagesGroup, QueryListData, queryListColumn } from '../../domain';

@Component({
  selector: 'ccd-query-list',
  templateUrl: './query-list.component.html',
  styleUrls: ['./query-list.component.scss']
})
export class QueryListComponent implements OnChanges {
  @Input() public partyMessageGroup: PartyMessagesGroup;
  public queryListData: QueryListData | undefined;
  public displayedColumns: queryListColumn[] = [
    { name: 'subject', displayName: 'Queries', sortOrder: SortOrder.UNSORTED },
    { name: 'lastSubmittedBy', displayName: 'Last submitted by', sortOrder: SortOrder.UNSORTED },
    { name: 'lastSubmittedDate', displayName: 'Last submission date', sortOrder: SortOrder.UNSORTED },
    { name: 'lastResponseDate', displayName: 'Last response date', sortOrder: SortOrder.UNSORTED },
    { name: 'lastResponseBy', displayName: 'Response by', sortOrder: SortOrder.UNSORTED }
  ];

  public ngOnChanges(simpleChanges: SimpleChanges) {
    const currentPartyMessageGroup = simpleChanges.partyMessageGroup?.currentValue as PartyMessagesGroup;
    if (currentPartyMessageGroup) {
      this.queryListData = new QueryListData(currentPartyMessageGroup);
    }
  }

  public sortTable(col: queryListColumn) {
    switch (col.displayName) {
      case 'Queries': {
        this.sort(col);
        break;
      }
      case 'Last submitted by': {
        this.sort(col);
        break;
      }
      case 'Last submission date': {
        this.sortDate(col);
        break;
      }
      case 'Last response date': {
        this.sortDate(col);
        break;
      }
      case 'Response by': {
        this.sort(col);
        break;
      }
      default: {
        this.sort(col);
        break;
      }
    }
  }

  public sortWidget(col: queryListColumn): string {
    switch (col.sortOrder) {
      case SortOrder.DESCENDING: {
        return '&#9660;';
      }
      case SortOrder.ASCENDING: {
        return '&#9650;';
      }
      default: {
        return '&#11047;';
      }
    }
  }

  private sort(col: queryListColumn) {
    if (col.sortOrder === SortOrder.ASCENDING) {
      this.queryListData.partyMessages.sort((a, b) => (a[col.name] < b[col.name]) ? 1 : -1);
      this.displayedColumns.forEach((c) => c.sortOrder = SortOrder.UNSORTED);
      col.sortOrder = SortOrder.DESCENDING;
    } else {
      this.queryListData.partyMessages.sort((a, b) => (a[col.name] > b[col.name]) ? 1 : -1);
      this.displayedColumns.forEach((c) => c.sortOrder = SortOrder.UNSORTED);
      col.sortOrder = SortOrder.ASCENDING;
    }
  }

  private sortDate(col: queryListColumn) {
    if (col.sortOrder === SortOrder.ASCENDING) {
      this.queryListData.partyMessages.sort((a, b) => b[col.name] - a[col.name]);
      this.displayedColumns.forEach((c) => c.sortOrder = SortOrder.UNSORTED);
      col.sortOrder = SortOrder.DESCENDING;
    } else {
      this.queryListData.partyMessages.sort((a, b) => a[col.name] - b[col.name]);
      this.displayedColumns.forEach((c) => c.sortOrder = SortOrder.UNSORTED);
      col.sortOrder = SortOrder.ASCENDING;
    }
  }
}
