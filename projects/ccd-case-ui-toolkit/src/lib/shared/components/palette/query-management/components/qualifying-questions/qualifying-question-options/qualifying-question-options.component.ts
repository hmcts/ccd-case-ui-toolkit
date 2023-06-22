import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { QualifyingQuestionsErrorMessage } from '../../../enums';
import { QualifyingQuestion, QueryItemType } from '../../../models';

@Component({
  selector: 'ccd-qualifying-question-options',
  templateUrl: './qualifying-question-options.component.html'
})
export class QualifyingQuestionOptionsComponent {
  @Input() public qualifyingQuestionsControl: FormControl;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public queryItemTypeEnum = QueryItemType;
  public qualifyingQuestionsErrorMessage = QualifyingQuestionsErrorMessage;

  public get displayError(): boolean {
    return this.qualifyingQuestionsControl.touched && this.qualifyingQuestionsControl.hasError('required');
  }
}

