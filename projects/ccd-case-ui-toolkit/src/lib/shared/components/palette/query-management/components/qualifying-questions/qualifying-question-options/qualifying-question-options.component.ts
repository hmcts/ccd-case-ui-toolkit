import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { QualifyingQuestionsErrorMessage } from '../../../enums';
import { QualifyingQuestion } from '../../../models';

@Component({
  selector: 'ccd-qualifying-question-options',
  templateUrl: './qualifying-question-options.component.html'
})
export class QualifyingQuestionOptionsComponent implements OnInit {
  @Input() public qualifyingQuestionsControl: FormControl;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  public qualifyingQuestionsErrorMessage = QualifyingQuestionsErrorMessage;
  public caseId: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router) {
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
  }

  public click(): void {
    this.router.navigate(['cases', 'case-details', this.caseId], { fragment: 'Queries' });
  }

  public get displayError(): boolean {
    return this.qualifyingQuestionsControl.touched && this.qualifyingQuestionsControl.hasError('required');
  }
}

