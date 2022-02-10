import { Component, Input } from '@angular/core';
import { Flag } from '../../domain';
import { CaseFlagStatus } from '../../enums';

@Component({
  selector: 'ccd-case-flag-table',
  templateUrl: './case-flag-table.component.html',
  styleUrls: ['./case-flag-table.component.scss']
})
export class CaseFlagTableComponent {

  @Input()
  public flagData: Flag;

  public get caseFlagStatus(): typeof CaseFlagStatus {
    return CaseFlagStatus
  };
}
