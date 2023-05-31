import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SortOrder } from '../../../complex/sort-order';
import { PartyMessagesGroup, QueryListColumn, QueryListData, QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-list',
  templateUrl: './query-list.component.html',
  styleUrls: ['./query-list.component.scss']
})
export class QueryListComponent implements OnChanges {
  @Input() public partyMessageGroup: PartyMessagesGroup;
  @Output() public selectedQuery: EventEmitter<QueryListItem> = new EventEmitter();
  public queryListData: QueryListData | undefined;
  public displayedColumns: QueryListColumn[] = [
    { name: 'subject', displayName: 'Queries', sortOrder: SortOrder.UNSORTED },
    { name: 'lastSubmittedBy', displayName: 'Last submitted by', sortOrder: SortOrder.UNSORTED },
    { name: 'lastSubmittedDate', displayName: 'Last submission date', sortOrder: SortOrder.UNSORTED },
    { name: 'lastResponseDate', displayName: 'Last response date', sortOrder: SortOrder.UNSORTED },
    { name: 'lastResponseBy', displayName: 'Response status', sortOrder: SortOrder.UNSORTED }
  ];

  public ngOnChanges(simpleChanges: SimpleChanges) {
    const currentPartyMessageGroup = simpleChanges.partyMessageGroup?.currentValue as PartyMessagesGroup;
    if (currentPartyMessageGroup) {
      this.queryListData = new QueryListData(currentPartyMessageGroup);
    }
  }

  public sortTable(col: QueryListColumn): void {
    switch (col.displayName) {
      case 'Last submission date':
      case 'Last response date': {
        this.sortDate(col);
        break;
      }
      default: {
        this.sort(col);
        break;
      }
    }
  }

  public sortWidget(col: QueryListColumn): string {
    switch (col.sortOrder) {
      case SortOrder.ASCENDING: {
        return '&#9650;';
      }
      default: {
        return '&#9660;';
      }
    }
  }

  public showDetails(query): void {
    this.selectedQuery.emit(query);
  }

  private sort(col: QueryListColumn): void {
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

  private sortDate(col: QueryListColumn): void {
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
