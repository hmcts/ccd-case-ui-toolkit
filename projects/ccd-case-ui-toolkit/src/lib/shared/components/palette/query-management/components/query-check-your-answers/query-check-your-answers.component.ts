import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../../../domain';
import { QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagementUtils } from '../../utils/query-management.utils';
import { caseFieldMockData } from '../../__mocks__';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QueryCheckYourAnswersComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  public caseField: CaseField;
  public queryCreateContextEnum = QueryCreateContext;

  public ngOnInit(): void {
    this.caseField = caseFieldMockData;
    this.caseField.value = this.formGroup.get('attachments')?.value
      .map(QueryManagementUtils.documentToCollectionFormDocument);
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }
}
