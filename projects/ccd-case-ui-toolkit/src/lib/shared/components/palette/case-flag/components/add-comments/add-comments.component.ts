import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState } from '../../domain';
import { AddCommentsErrorMessage, AddCommentsStep, CaseFlagFieldState, CaseFlagWizardStepTitle } from '../../enums';

@Component({
  selector: 'ccd-add-comments',
  templateUrl: './add-comments.component.html'
})
export class AddCommentsComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public optional = false;
  @Input() public isDisplayContextParameterExternal = false;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public addCommentsTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public flagCommentsNotEnteredErrorMessage: AddCommentsErrorMessage = null;
  public flagCommentsCharLimitErrorMessage: AddCommentsErrorMessage = null;
  public addCommentsHint: AddCommentsStep;
  public addCommentsCharLimitInfo: AddCommentsStep;
  public readonly flagCommentsControlName = 'flagComments';
  private readonly commentsMaxCharLimit = 200;

  public ngOnInit(): void {
    this.addCommentsTitle = !this.isDisplayContextParameterExternal ?
      CaseFlagWizardStepTitle.ADD_FLAG_COMMENTS : CaseFlagWizardStepTitle.ADD_FLAG_COMMENTS_EXTERNAL_MODE;
    this.addCommentsHint = !this.isDisplayContextParameterExternal ?
      AddCommentsStep.HINT_TEXT : AddCommentsStep.HINT_TEXT_EXTERNAL;
    this.addCommentsCharLimitInfo = AddCommentsStep.CHARACTER_LIMIT_INFO;

    if (!this.formGroup.get(this.flagCommentsControlName)) {
      this.formGroup.addControl(this.flagCommentsControlName, new FormControl(''));
    }
  }

  public onNext(): void {
    // Validate flag comments entry
    this.validateTextEntry();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_COMMENTS, errorMessages: this.errorMessages });
  }

  private validateTextEntry(): void {
    this.flagCommentsNotEnteredErrorMessage = null;
    this.flagCommentsCharLimitErrorMessage = null;
    this.errorMessages = [];
    if (!this.optional && !this.formGroup.get(this.flagCommentsControlName).value) {
      this.flagCommentsNotEnteredErrorMessage = AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: this.flagCommentsControlName
      });
    }
    if (this.formGroup.get(this.flagCommentsControlName).value &&
      this.formGroup.get(this.flagCommentsControlName).value.length > this.commentsMaxCharLimit) {
      this.flagCommentsCharLimitErrorMessage = AddCommentsErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: AddCommentsErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: this.flagCommentsControlName
      });
    }
  }
}
