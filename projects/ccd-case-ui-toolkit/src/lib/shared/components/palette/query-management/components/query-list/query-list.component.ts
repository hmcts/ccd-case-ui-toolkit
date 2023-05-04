import { Component, Input, OnInit } from '@angular/core';
import { CaseQueries } from '../../domain';

@Component({
  selector: 'ccd-query-list',
  templateUrl: './query-list.component.html',
})
export class QueryListComponent implements OnInit {

  @Input() public caseQueries: CaseQueries[];

  constructor() {
  }

  public ngOnInit(): void {

  }
}
