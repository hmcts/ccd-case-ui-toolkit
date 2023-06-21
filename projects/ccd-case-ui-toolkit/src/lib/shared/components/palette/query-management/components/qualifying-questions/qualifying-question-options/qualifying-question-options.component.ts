import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { QualifyingQuestion } from '../../../models';

@Component({
  selector: 'ccd-qualifying-question-options',
  templateUrl: './qualifying-question-options.component.html'
})
export class QualifyingQuestionOptionsComponent {
  @Input() public qualifyingQuestionControl: FormControl;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public qualifyingQuestionSelectionError: string;
}
