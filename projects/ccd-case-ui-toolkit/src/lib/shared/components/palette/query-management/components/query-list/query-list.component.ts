import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PartyMessagesGroup, QueryListData } from '../../domain';

@Component({
  selector: 'ccd-query-list',
  templateUrl: './query-list.component.html',
  styleUrls: ['./query-list.component.scss']
})
export class QueryListComponent implements OnChanges {
  @Input() public partyMessageGroup: PartyMessagesGroup;
  public queryListData: QueryListData | undefined;

  public ngOnChanges(simpleChanges: SimpleChanges) {
    const currentPartyMessageGroup = simpleChanges.partyMessageGroup?.currentValue as PartyMessagesGroup;
    if (currentPartyMessageGroup) {
      this.queryListData = new QueryListData(currentPartyMessageGroup);
    }
  }
}
