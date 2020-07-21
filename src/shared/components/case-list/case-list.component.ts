import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CaseField, SearchResultView, SearchResultViewColumn, SearchResultViewItem } from '../../domain';

@Component({
  selector: 'ccd-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit, OnChanges {

  @Input()
  resultView: SearchResultView

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resultView']) {
      this.hydrateResultView();
    }
  }

  /**
   * Hydrates result view with case field definitions.
   */
  // A longer term resolution is to move this piece of logic to the backend
  hydrateResultView(): void {
    this.resultView.results.forEach(result => {
      const caseFields = [];

      Object.keys(result.case_fields).forEach(fieldId => {

        const field = result.case_fields[fieldId];

        caseFields.push(Object.assign(new CaseField(), {
          id: fieldId,
          label: null,
          field_type: {},
          value: field,
          display_context: null,
        }));
      });

      result.hydrated_case_fields = caseFields;
      result.columns = {};

      this.resultView.columns.forEach(col => {
        result.columns[col.case_field_id] = this.buildCaseField(col, result);
      });
    });
  }

  buildCaseField(col: SearchResultViewColumn, result: SearchResultViewItem): CaseField {
    return Object.assign(new CaseField(), {
      id: col.case_field_id,
      label: col.label,
      field_type: col.case_field_type,
      value: result.case_fields[col.case_field_id],
      display_context: null,
    });
  }

  hasResults(): any {
    return this.resultView.results.length;
  }

  hasDrafts(): boolean {
    return this.resultView.hasDrafts();
  }
}
