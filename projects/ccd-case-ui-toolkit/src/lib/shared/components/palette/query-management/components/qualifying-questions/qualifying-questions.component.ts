import { Component, Input, OnInit } from '@angular/core';
import { QualifyingQuestion } from '../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'ccd-qualifying-questions',
  templateUrl: './qualifying-questions.component.html'
})
export class QualifyingQuestionsComponent implements OnInit {

  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;

  public qualifyingQuestionSelectionError: string;

  public ngOnInit(): void {
    this.qualifyingQuestions$?.subscribe(x => {
      console.log('QUALIFYING QUESTIONS', x);
    });
  }
}
