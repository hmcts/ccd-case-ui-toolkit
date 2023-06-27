import { Component, Input } from '@angular/core';
import { QualifyingQuestion } from '../../../models';

@Component({
  selector: 'ccd-qualifying-question-detail',
  templateUrl: './qualifying-question-detail.component.html'
})
export class QualifyingQuestionDetailComponent {
  @Input() public qualifyingQuestion: QualifyingQuestion;
}
