import { Component, Input, OnInit } from '@angular/core';
import { CaseView } from '../../../../../domain/case-view/case-view.model';
import { CaseField } from '../../../../../domain/definition/case-field.model';
import { Draft } from '../../../../../domain/draft.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ccd-query-case-details-header',
  templateUrl: './query-case-details-header.component.html'
})
export class QueryCaseDetailsHeaderComponent implements OnInit {
  @Input()
  public caseDetails: CaseView;
  public caseTitle: CaseField;
  public caseFields: CaseField[];
  public caseView: CaseView;

  constructor(activatedRoute: ActivatedRoute) {
    this.caseView = activatedRoute.snapshot.data.case;
  }

  public ngOnInit(): void {
    this.caseTitle = new CaseField();
    if (!this.isDraft() && this.caseDetails.state.title_display) {
      this.caseTitle.label = this.caseDetails.state.title_display;
      this.caseFields = this.getCaseFields();
    }
  }

  public isDraft(): boolean {
    return Draft.isDraft(this.caseDetails.case_id);
  }

  private getCaseFields(): CaseField[] {
    const caseDataFields = this.caseDetails.tabs.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    return caseDataFields.concat(this.caseDetails.metadataFields);
  }
}
