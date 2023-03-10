import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import { CaseFlagFieldState, CaseFlagSummaryListDisplayMode } from '../../enums';

@Component({
  selector: 'ccd-case-flag-summary-list',
  templateUrl: './case-flag-summary-list.component.html'
})
export class CaseFlagSummaryListComponent implements OnInit {
  @Input() public flagForSummaryDisplay: FlagDetailDisplay;
  @Input() public summaryListDisplayMode: CaseFlagSummaryListDisplayMode;
  @Output() public changeButtonEmitter = new EventEmitter<number>();

  public flagDescription: string;
  public flagComments: string;
  public flagStatus: string;
  public isWelshTranslationRequired: boolean;
  public flagDescriptionWelsh: string;
  public flagCommentsWelsh: string;
  public otherDescription: string;
  public otherDescriptionWelsh: string;
  public displayMode = CaseFlagSummaryListDisplayMode;
  public addUpdateFlagHeaderText: string;
  public caseFlagFieldState = CaseFlagFieldState;
  public readonly caseLevelLocation = 'Case level';
  private readonly updateFlagHeaderText = 'Update flag for';
  private readonly addFlagHeaderText = 'Add flag to';

  public ngOnInit(): void {
    if (this.flagForSummaryDisplay) {
      const flagDetail = this.flagForSummaryDisplay.flagDetail;
      this.flagDescription = this.getFlagDescription(flagDetail);
      this.flagComments = flagDetail.flagComment;
      this.flagStatus = flagDetail.status;
      this.isWelshTranslationRequired = true;
      this.flagDescriptionWelsh = this.getFlagDescriptionWelsh(flagDetail);
      this.flagCommentsWelsh = flagDetail.flagComment_cy;
      this.addUpdateFlagHeaderText =
        this.summaryListDisplayMode === CaseFlagSummaryListDisplayMode.MANAGE ? this.updateFlagHeaderText : this.addFlagHeaderText;
    }
  }

  private getFlagDescription(flagDetail: FlagDetail): string {
    const otherDescription = flagDetail.otherDescription ? ` - ${flagDetail.otherDescription}` : '';
    const subTypeValue = flagDetail.subTypeValue ? ` - ${flagDetail.subTypeValue}` : '';
    return `${flagDetail.name}${otherDescription}${subTypeValue}`;
  }

  private getFlagDescriptionWelsh(flagDetail: FlagDetail): string {
    const otherDescriptionWelsh = flagDetail.otherDescription_cy ? ` - ${flagDetail.otherDescription_cy}` : '';
    const subTypeValueWelsh = flagDetail.subTypeValue_cy ? ` - ${flagDetail.subTypeValue_cy}` : '';
    return `${flagDetail.name}${otherDescriptionWelsh}${subTypeValueWelsh}`;
  }
}
