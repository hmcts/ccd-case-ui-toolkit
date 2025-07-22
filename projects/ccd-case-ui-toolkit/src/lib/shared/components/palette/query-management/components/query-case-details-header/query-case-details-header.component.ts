import { Component, Input, OnInit } from '@angular/core';
import { CaseView } from '../../../../../domain/case-view/case-view.model';
import { CaseField } from '../../../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-query-case-details-header',
  templateUrl: './query-case-details-header.component.html'
})

export class QueryCaseDetailsHeaderComponent implements OnInit {
  @Input() public caseDetails: CaseView;
  public caseTitle: CaseField;
  public caseFields: CaseField[];

  public ngOnInit(): void {
    this.caseTitle = new CaseField();
    this.caseTitle.label = this.caseDetails?.state?.title_display;
    this.caseFields = this.getCaseFieldsInfo();
  }

  private getCaseFieldsInfo(): CaseField[] {
    const caseDataFields = this.caseDetails?.tabs?.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }
}
