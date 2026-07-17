import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { QualifyingQuestionsErrorMessage } from '../../../enums';
import { QualifyingQuestion } from '../../../models';
import { QualifyingQuestionService } from '../../../services';

@Component({
  selector: 'ccd-qualifying-question-options',
  templateUrl: './qualifying-question-options.component.html',
  standalone: false
})
export class QualifyingQuestionOptionsComponent implements OnInit {
  @Input() public qualifyingQuestionsControl: FormControl;
  @Input() public qualifyingQuestions$: Observable<QualifyingQuestion[]>;
  @Output() questionSelected = new EventEmitter<QualifyingQuestion>();

  public qualifyingQuestionsErrorMessage = QualifyingQuestionsErrorMessage;
  public caseId: string;
  public jurisdiction: string;
  public caseType: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly qualifyingQuestionService: QualifyingQuestionService) {
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    this.jurisdiction = this.route.snapshot.params.jurisdiction;
    this.caseType = this.route.snapshot.params.caseType;

    // Check if there's already a selected qualifying question from the service
    const savedSelection = this.qualifyingQuestionService.getQualifyingQuestionSelection();
    if (savedSelection) {
      this.qualifyingQuestionsControl.setValue(savedSelection);
    }
  }

  public click(): void {
    this.router.navigate(['cases', 'case-details', this.jurisdiction, this.caseType, this.caseId], { fragment: 'Queries' });
  }

  public get displayError(): boolean {
    return this.qualifyingQuestionsControl.touched && this.qualifyingQuestionsControl.hasError('required');
  }

  public onSelectionChange(qualifyingQuestion: QualifyingQuestion) {
    this.questionSelected.emit(qualifyingQuestion);
  }
}

