import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../../../domain';
import { caseFieldMockData } from '../../__mocks__';
import { QueryItemType, QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QueryCheckYourAnswersComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public QueryCreateContext: QueryItemType;
  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  public caseField: CaseField;
  public queryItemTypeEnum = QueryItemType;

  public ngOnInit(): void {
    // Set default value as false for testing follow up EUI-8387
    this.QueryCreateContext = QueryItemType.FOLLOWUP;
    // Mock object
    this.caseField = caseFieldMockData;
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }
}
