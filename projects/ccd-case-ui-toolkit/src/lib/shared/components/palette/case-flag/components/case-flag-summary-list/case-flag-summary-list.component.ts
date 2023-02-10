import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FlagDetailDisplay } from '../../domain';
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
  public displayMode = CaseFlagSummaryListDisplayMode;
  public addUpdateFlagHeaderText: string;
  public CaseFlagFieldState = CaseFlagFieldState;
  public readonly caseLevelLocation = 'Case level';
  private readonly updateFlagHeaderText = 'Update flag for';
  private readonly addFlagHeaderText = 'Add flag to';

  public ngOnInit(): void {
    if (this.flagForSummaryDisplay) {
      const flagDetail = this.flagForSummaryDisplay.flagDetail;
      this.flagDescription = `${flagDetail.name}${flagDetail.otherDescription
        ? ` - ${flagDetail.otherDescription}`
        : ''}${flagDetail.subTypeValue ? ` - ${flagDetail.subTypeValue}` : ''}`;
      this.flagComments = flagDetail.flagComment;
      this.flagStatus = flagDetail.status;
      this.addUpdateFlagHeaderText =
        this.summaryListDisplayMode === CaseFlagSummaryListDisplayMode.MANAGE ? this.updateFlagHeaderText : this.addFlagHeaderText;
    }
  }
}
