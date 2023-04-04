import { Component, Input } from '@angular/core';
import { FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagStatus } from '../../enums';

@Component({
  selector: 'ccd-case-flag-table',
  templateUrl: './case-flag-table.component.html',
  styleUrls: ['./case-flag-table.component.scss']
})
export class CaseFlagTableComponent {
  @Input() public tableCaption: string;
  @Input() public flagData: FlagsWithFormGroupPath;
  @Input() public firstColumnHeader: string;
  @Input() public caseFlagsExternalUser = false;

  public get caseFlagStatus(): typeof CaseFlagStatus {
    return CaseFlagStatus;
  }
}
