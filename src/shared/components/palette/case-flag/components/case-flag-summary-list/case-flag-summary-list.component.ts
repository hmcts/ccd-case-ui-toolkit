import { Component, Input, OnInit } from '@angular/core';
import { FlagDetailDisplay } from '../../domain';

@Component({
  selector: 'ccd-case-flag-summary-list',
  templateUrl: './case-flag-summary-list.component.html'
})
export class CaseFlagSummaryListComponent implements OnInit {

  @Input() public flagForSummaryDisplay: FlagDetailDisplay;

  public flagDescription: string;
  public flagComments: string;
  public readonly caseLevelLocation = 'Case level';

  public ngOnInit(): void {
    if (this.flagForSummaryDisplay) {
      const flagDetail = this.flagForSummaryDisplay.flagDetail;
      this.flagDescription = `${flagDetail.name}${flagDetail.otherDescription
        ? ` - ${flagDetail.otherDescription}`
        : ''}${flagDetail.subTypeValue ? ` - ${flagDetail.subTypeValue}` : ''}`;
      this.flagComments = flagDetail.flagComment;
    }
  }
}
