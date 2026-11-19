import { Component, Input, OnInit } from '@angular/core';
import { CaseView } from '../../../../../domain/case-view/case-view.model';
import { CaseField } from '../../../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-query-case-details-header',
  templateUrl: './query-case-details-header.component.html',
  standalone: false
})

export class QueryCaseDetailsHeaderComponent implements OnInit {
  @Input() public caseDetails: CaseView;
  public caseTitle: CaseField;
  public caseFields: CaseField[];

  public ngOnInit(): void {
    this.caseTitle = new CaseField();
    this.caseTitle.label = QueryCaseDetailsHeaderComponent.demoteHeadings(this.caseDetails?.state?.title_display);
    this.caseFields = this.getCaseFieldsInfo();
  }

  public static demoteHeadings(markdown: string): string {
    return typeof markdown === 'string' ? markdown.replace(/^(\s{0,3})(#{1,5})(?=\s|$)/gm, '$1$2#') : markdown;
  }

  private getCaseFieldsInfo(): CaseField[] {
    const caseDataFields = this.caseDetails?.tabs?.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }
}
