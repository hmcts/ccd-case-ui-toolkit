import { Component, Input, OnInit } from '@angular/core';
import { CaseField } from '../../../../../domain';

@Component({
  selector: 'ccd-linked-cases-check-your-answers',
  templateUrl: './check-your-answers.component.html'
})
export class CheckYourAnswersComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];

  ngOnInit(): void {
    console.log('CASE FIELDS', this.caseFields);
  }
}
