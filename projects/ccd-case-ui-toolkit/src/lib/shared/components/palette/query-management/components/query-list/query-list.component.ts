import { Component, Input, OnInit } from '@angular/core';
import { PartyMessages } from '../../domain';

@Component({
  selector: 'ccd-query-list',
  templateUrl: './query-list.component.html',
  styleUrls: ['./query-list.component.scss']
})
export class QueryListComponent implements OnInit {
  @Input() public partyMessages: PartyMessages;

  constructor() {
  }

  public ngOnInit(): void {
    console.log(this.partyMessages);
  }
}
