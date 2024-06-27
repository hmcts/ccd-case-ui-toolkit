import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RpxTranslationService } from 'rpx-xui-translation';
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
  public flagUpdateComments: string;
  public summaryListDisplayMode: CaseFlagSummaryListDisplayMode;
  public addUpdateFlagHeaderText: string;
  public caseFlagFieldState = CaseFlagFieldState;
  public displayMode = CaseFlagSummaryListDisplayMode;
  public flagTypeHeaderText: string;
  public caseFlagCheckYourAnswersPageStep = CaseFlagCheckYourAnswersPageStep;
  public is2Point1Enabled = false;
  public externalUserUpdate = false;

  constructor(private readonly rpxTranslationService: RpxTranslationService) { }

  public ngOnInit(): void {
    if (this.flagForSummaryDisplay) {
      const flagDetail = this.flagForSummaryDisplay.flagDetail;
      this.flagDescription = this.getFlagDescription(flagDetail);
      this.flagDescriptionWelsh = flagDetail.otherDescription_cy;
      this.flagComments = flagDetail.flagComment;
      this.flagCommentsWelsh = flagDetail.flagComment_cy;
      // Flag update comments will be coming from the flagStatusReasonChange property instead of flagUpdateComment
      // because these haven't been persisted yet
      this.flagUpdateComments = flagDetail['flagStatusReasonChange'];
      this.flagStatus = flagDetail.status;
      this.addUpdateFlagHeaderText = this.getAddUpdateFlagHeaderText();
      this.flagTypeHeaderText = this.getFlagTypeHeaderText();
      this.summaryListDisplayMode = this.getSummaryListDisplayMode();
      this.is2Point1Enabled = this.getDisplayContextParameter2Point1Enabled();
      this.externalUserUpdate = this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    }
  }

  private getFlagDescription(flagDetail: FlagDetail): string {
    let flagName: string;
    let subTypeValue: string;
    if (this.rpxTranslationService.language === 'cy') {
      flagName = flagDetail.name_cy || flagDetail.name;
      subTypeValue = flagDetail.subTypeValue_cy || flagDetail.subTypeValue;
    } else {
      flagName = flagDetail.name || flagDetail.name_cy;
      subTypeValue = flagDetail.subTypeValue || flagDetail.subTypeValue_cy;
    }
    // The otherDescription field should be shown verbatim; otherDescription for Welsh is shown separately
    const otherDescription = flagDetail.otherDescription ? ` - ${flagDetail.otherDescription}` : '';
    const subTypeValueForDisplay = subTypeValue ? ` - ${subTypeValue}` : '';
    return `${flagName}${otherDescription}${subTypeValueForDisplay}`;
  }

  private getAddUpdateFlagHeaderText(): string {
    switch(this.displayContextParameter) {
      case CaseFlagDisplayContextParameter.CREATE:
      case CaseFlagDisplayContextParameter.CREATE_2_POINT_1:
        return CaseFlagCheckYourAnswersPageStep.ADD_FLAG_HEADER_TEXT;
      case CaseFlagDisplayContextParameter.CREATE_EXTERNAL:
        return CaseFlagCheckYourAnswersPageStep.ADD_FLAG_HEADER_TEXT_EXTERNAL;
      case CaseFlagDisplayContextParameter.UPDATE:
      case CaseFlagDisplayContextParameter.UPDATE_2_POINT_1:
        return CaseFlagCheckYourAnswersPageStep.UPDATE_FLAG_HEADER_TEXT;
      case CaseFlagDisplayContextParameter.UPDATE_EXTERNAL:
        return CaseFlagCheckYourAnswersPageStep.UPDATE_FLAG_HEADER_TEXT_EXTERNAL;
      default:
        return CaseFlagCheckYourAnswersPageStep.NONE;
    }
  }

  private getFlagTypeHeaderText(): string {
    switch(this.displayContextParameter) {
      case CaseFlagDisplayContextParameter.CREATE:
      case CaseFlagDisplayContextParameter.CREATE_2_POINT_1:
      case CaseFlagDisplayContextParameter.UPDATE:
      case CaseFlagDisplayContextParameter.UPDATE_2_POINT_1:
        return CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT;
      case CaseFlagDisplayContextParameter.CREATE_EXTERNAL:
      case CaseFlagDisplayContextParameter.UPDATE_EXTERNAL:
        return CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT_EXTERNAL;
      default:
        return CaseFlagCheckYourAnswersPageStep.NONE;
    }
  }

  private getSummaryListDisplayMode(): number {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE ||
        this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL ||
        this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_2_POINT_1) {
      return CaseFlagSummaryListDisplayMode.CREATE;
    }
    return CaseFlagSummaryListDisplayMode.MANAGE;
  }

  private getDisplayContextParameter2Point1Enabled(): boolean {
    return this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_2_POINT_1 ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_2_POINT_1;
  }
}
