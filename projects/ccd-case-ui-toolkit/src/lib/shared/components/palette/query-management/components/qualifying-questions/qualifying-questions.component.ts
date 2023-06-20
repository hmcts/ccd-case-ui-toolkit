import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QualifyingQuestion } from '../../models';

@Component({
  selector: 'ccd-qualifying-questions',
  templateUrl: './qualifying-questions.component.html'
})
export class QualifyingQuestionsComponent {
  @Input() public formGroup: FormGroup;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public qualifyingQuestionSelectionError: string;
}
