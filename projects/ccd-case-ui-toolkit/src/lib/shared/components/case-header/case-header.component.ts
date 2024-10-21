import { Component, Input, OnInit } from '@angular/core';
import { CaseView } from '../../domain/case-view/case-view.model';
import { CaseField } from '../../domain/definition/case-field.model';
import { Draft } from '../../domain/draft.model';

@Component({
  selector: 'ccd-case-header',
  templateUrl: './case-header.html',
  styleUrls: ['./case-header.scss']
})

export class CaseHeaderComponent implements OnInit {
  @Input() public caseDetails: CaseView;
  public caseTitle: CaseField;
  public caseFields: CaseField[];

  public ngOnInit(): void {
    this.caseTitle = new CaseField();
    this.caseTitle.label = this.caseDetails.state.title_display;
    this.caseFields = this.getCaseFieldsInfo();
  }

  private getCaseFieldsInfo(): CaseField[] {
    const caseDataFields = this.caseDetails.tabs.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }
}
