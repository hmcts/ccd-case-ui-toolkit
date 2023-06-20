import { Component, Input } from '@angular/core';
import { QualifyingQuestion } from '../../models';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ccd-qualifying-questions',
  templateUrl: './qualifying-questions.component.html'
})
export class QualifyingQuestionsComponent {
  @Input() public formGroup: FormGroup;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public qualifyingQuestionSelectionError: string;
}
