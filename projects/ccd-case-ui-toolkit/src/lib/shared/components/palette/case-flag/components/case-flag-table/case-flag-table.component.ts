import { Component, Input } from '@angular/core';
import { PVP_DISPLAY_TEXT, isPvpFlag } from '../../utils/case-flag-priority.utils';
import { FlagDetail, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagStatus } from '../../enums';

@Component({
  selector: 'ccd-case-flag-table',
  templateUrl: './case-flag-table.component.html',
  styleUrls: ['./case-flag-table.component.scss'],
  standalone: false
})
export class CaseFlagTableComponent {
  @Input() public tableCaption: string;
  @Input() public flagData: FlagsWithFormGroupPath;
  @Input() public firstColumnHeader: string;
  @Input() public caseFlagsExternalUser = false;
  public readonly pvpDisplayText = PVP_DISPLAY_TEXT;

  public get caseFlagStatus(): typeof CaseFlagStatus {
    return CaseFlagStatus;
  }

  public isPvpFlag(flagDetail: FlagDetail): boolean {
    return isPvpFlag(flagDetail);
  }

  public isActivePvpFlag(flagDetail: FlagDetail): boolean {
    return isPvpFlag(flagDetail) && flagDetail?.status === CaseFlagStatus.ACTIVE;
  }
}
