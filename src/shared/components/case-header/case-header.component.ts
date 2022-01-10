import { Component, Input, OnInit } from '@angular/core';
import { CaseView, CaseField, Draft } from '../../domain';

@Component({
  selector: 'ccd-case-header',
  templateUrl: './case-header.html',
  styleUrls: ['./case-header.scss']
})

export class CaseHeaderComponent implements OnInit {

  public label: string;
  @Input()
  caseDetails: CaseView;
  caseTitle: CaseField;
  caseFields: CaseField[];

  ngOnInit(): void {
    this.caseTitle = new CaseField();
    if (!this.isDraft() && this.caseDetails.state.title_display) {
      this.caseTitle.label = this.caseDetails.state.title_display;
      this.label = this.caseTitle.label;
      this.caseFields = this.getCaseFields();
    }
  }

  isDraft(): boolean {
    return Draft.isDraft(this.caseDetails.case_id);
  }

  private getCaseFields(): CaseField[] {
    const caseDataFields = this.caseDetails.tabs.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }
}
