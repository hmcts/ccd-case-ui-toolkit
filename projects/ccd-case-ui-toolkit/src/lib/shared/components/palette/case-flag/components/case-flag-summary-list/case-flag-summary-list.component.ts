import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import {
  CaseFlagCheckYourAnswersPageStep,
  CaseFlagDisplayContextParameter,
  CaseFlagFieldState,
  CaseFlagSummaryListDisplayMode
} from '../../enums';

@Component({
  selector: 'ccd-case-flag-summary-list',
  templateUrl: './case-flag-summary-list.component.html'
})
export class CaseFlagSummaryListComponent implements OnInit {
  @Input() public flagForSummaryDisplay: FlagDetailDisplay;
  @Input() public displayContextParameter: string;
  @Output() public changeButtonEmitter = new EventEmitter<number>();

  public flagDescription: string;
  public flagComments: string;
  public flagStatus: string;
  public flagDescriptionWelsh: string;
  public flagCommentsWelsh: string;
  public otherDescription: string;
  public otherDescriptionWelsh: string;
  public summaryListDisplayMode: CaseFlagSummaryListDisplayMode;
  public addUpdateFlagHeaderText: string;
  public caseFlagFieldState = CaseFlagFieldState;
  public displayMode = CaseFlagSummaryListDisplayMode;
  public canDisplayStatus = false;
  public flagTypeHeaderText: string;
  public caseFlagCheckYourAnswersPageStep = CaseFlagCheckYourAnswersPageStep;

  public ngOnInit(): void {
    if (this.flagForSummaryDisplay) {
      const flagDetail = this.flagForSummaryDisplay.flagDetail;
      this.flagDescription = this.getFlagDescription(flagDetail);
      this.flagDescriptionWelsh = flagDetail.otherDescription_cy;
      this.flagComments = flagDetail.flagComment;
      this.flagCommentsWelsh = flagDetail.flagComment_cy;
      this.flagStatus = flagDetail.status;
      this.addUpdateFlagHeaderText = this.getAddUpdateFlagHeaderText();
      this.flagTypeHeaderText = this.getFlagTypeHeaderText();
      this.summaryListDisplayMode = this.getSummaryListDisplayMode();
      this.canDisplayStatus = this.getCanDisplayStatus();
    }
  }

  private getFlagDescription(flagDetail: FlagDetail): string {
    const otherDescription = flagDetail.otherDescription ? ` - ${flagDetail.otherDescription}` : '';
    const subTypeValue = flagDetail.subTypeValue ? ` - ${flagDetail.subTypeValue}` : '';
    return `${flagDetail.name}${otherDescription}${subTypeValue}`;
  }

  private getAddUpdateFlagHeaderText(): string {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE) {
      return CaseFlagCheckYourAnswersPageStep.ADD_FLAG_HEADER_TEXT;
    }
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL) {
      return CaseFlagCheckYourAnswersPageStep.ADD_FLAG_HEADER_TEXT_EXTERNAL;
    }
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE) {
      return CaseFlagCheckYourAnswersPageStep.UPDATE_FLAG_HEADER_TEXT;
    }
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL) {
      return CaseFlagCheckYourAnswersPageStep.UPDATE_FLAG_HEADER_TEXT_EXTERNAL;
    }
    return CaseFlagCheckYourAnswersPageStep.NONE;
  }

  private getFlagTypeHeaderText(): string {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE) {
      return CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT;
    }
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL) {
      return CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT_EXTERNAL;
    }
    return CaseFlagCheckYourAnswersPageStep.NONE;
  }

  private getSummaryListDisplayMode(): number {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE ||
        this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL) {
      return CaseFlagSummaryListDisplayMode.CREATE;
    }
    return CaseFlagSummaryListDisplayMode.MANAGE;
  }

  private getCanDisplayStatus(): boolean {
    return !(this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE);
  }
}
