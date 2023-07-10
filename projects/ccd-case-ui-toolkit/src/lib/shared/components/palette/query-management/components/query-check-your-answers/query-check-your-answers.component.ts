import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QueryCreateContext, QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss']
})
export class QueryCheckYourAnswersComponent {
  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Output() public backClicked = new EventEmitter<boolean>();
  public queryCreateContextEnum = QueryCreateContext;

  public goBack(): void {
    this.backClicked.emit(true);
  }
}
