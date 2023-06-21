import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QualifyingQuestion } from '../../../models';

@Component({
  selector: 'ccd-qualifying-question-options',
  templateUrl: './qualifying-question-options.component.html'
})
export class QualifyingQuestionOptionsComponent {
  @Input() public formGroup: FormGroup;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public qualifyingQuestionSelectionError: string;
}
