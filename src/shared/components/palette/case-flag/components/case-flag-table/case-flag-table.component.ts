import { Component, Input, OnInit } from '@angular/core';
import { CaseFlag } from '../../domain/case-flag.model';

@Component({
  selector: 'ccd-case-flag-table',
  templateUrl: './case-flag-table.component.html'
})
export class CaseFlagTableComponent implements OnInit {

  @Input()
  public caseFlagData: CaseFlag[];

  constructor() {
  }

  public ngOnInit(): void {

  }
}
