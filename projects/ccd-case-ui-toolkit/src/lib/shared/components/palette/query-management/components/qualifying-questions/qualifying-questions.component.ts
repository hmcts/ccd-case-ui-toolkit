import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { QualifyingQuestion } from '../../models';

@Component({
  selector: 'ccd-qualifying-questions',
  templateUrl: './qualifying-questions.component.html'
})
export class QualifyingQuestionsComponent {
  @Input() public qualifyingQuestionControl: FormControl;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public qualifyingQuestionSelectionError: string;
}
