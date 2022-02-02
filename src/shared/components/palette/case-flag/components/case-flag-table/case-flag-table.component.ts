import { Component, Input, OnInit } from '@angular/core';
import { Flag } from '../../domain';

@Component({
  selector: 'ccd-case-flag-table',
  templateUrl: './case-flag-table.component.html'
})
export class CaseFlagTableComponent implements OnInit {

  @Input()
  public flagData: Flag[];

  constructor() {
  }

  public ngOnInit(): void {

  }
}
