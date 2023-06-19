import { Component, Input, OnInit } from '@angular/core';
import { QualifyingQuestion } from '../../models';

@Component({
  selector: 'ccd-qualifying-questions',
  templateUrl: './qualifying-questions.component.html'
})
export class QualifyingQuestionsComponent implements OnInit {

  @Input() public qualifyingQuestions: QualifyingQuestion[];

  public qualifyingQuestionSelectionError: string;

  public ngOnInit(): void {
    console.log('QUALIFYING QUESTIONS');
  }
}
