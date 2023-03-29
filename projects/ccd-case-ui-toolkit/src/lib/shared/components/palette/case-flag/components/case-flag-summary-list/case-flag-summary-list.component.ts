import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import { CaseFlagDisplayContextParameter, CaseFlagFieldState, CaseFlagSummaryListDisplayMode } from '../../enums';

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
  public readonly caseLevelLocation = 'Case level';
  private readonly updateFlagHeaderText = 'Update flag for';
  private readonly addFlagHeaderText = 'Add flag to';
  public displayMode = CaseFlagSummaryListDisplayMode;
  public canDisplayStatus = false;

  public ngOnInit(): void {
    if (this.flagForSummaryDisplay) {
      const flagDetail = this.flagForSummaryDisplay.flagDetail;
      this.flagDescription = this.getFlagDescription(flagDetail);
      this.flagDescriptionWelsh = flagDetail.otherDescription_cy;
      this.flagComments = flagDetail.flagComment;
      this.flagCommentsWelsh = flagDetail.flagComment_cy;
      this.flagStatus = flagDetail.status;
      this.addUpdateFlagHeaderText = this.getHeaderText();
      this.summaryListDisplayMode = this.getSummaryListDisplayMode();
      this.canDisplayStatus = this.getCanDisplayStatus();
    }
  }

  private getFlagDescription(flagDetail: FlagDetail): string {
    const otherDescription = flagDetail.otherDescription ? ` - ${flagDetail.otherDescription}` : '';
    const subTypeValue = flagDetail.subTypeValue ? ` - ${flagDetail.subTypeValue}` : '';
    return `${flagDetail.name}${otherDescription}${subTypeValue}`;
  }

  private getHeaderText(): string {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL) {
      return this.addFlagHeaderText;
    }
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE ||
      this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL) {
      return this.updateFlagHeaderText;
    }
    return '';
  }

  private getSummaryListDisplayMode(): number {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE ||
        this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL) {
      return CaseFlagSummaryListDisplayMode.CREATE;
    }
    return CaseFlagSummaryListDisplayMode.MANAGE;
  }

  private getCanDisplayStatus(): boolean {
    if (this.displayContextParameter === CaseFlagDisplayContextParameter.CREATE_EXTERNAL ||
        this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL ||
        this.summaryListDisplayMode === CaseFlagSummaryListDisplayMode.CREATE) {
      return false;
    }
    return true;
  }
}
