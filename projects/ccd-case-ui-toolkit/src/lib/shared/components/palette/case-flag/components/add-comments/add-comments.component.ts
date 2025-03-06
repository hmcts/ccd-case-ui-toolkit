import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage, Journey } from '../../../../../domain';
import { CaseFlagState } from '../../domain';
import { AddCommentsErrorMessage, AddCommentsStep, CaseFlagFieldState, CaseFlagFormFields, CaseFlagWizardStepTitle } from '../../enums';
import { AbstractJourneyComponent } from '../../../base-field';

@Component({
  selector: 'ccd-add-comments',
  templateUrl: './add-comments.component.html'
})
export class AddCommentsComponent extends AbstractJourneyComponent implements OnInit, Journey {

  @Input() public formGroup: FormGroup;
  @Input() public optional = false;
  @Input() public isDisplayContextParameterExternal = false;
  @Input() public isDisplayContextParameter2Point1Enabled = false;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public addCommentsTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public flagCommentsNotEnteredErrorMessage: AddCommentsErrorMessage = null;
  public flagCommentsCharLimitErrorMessage: AddCommentsErrorMessage = null;
  public addCommentsHint: AddCommentsStep;
  public addCommentsStepEnum = AddCommentsStep;
  public readonly flagCommentsControlName = 'flagComments';
  private readonly commentsMaxCharLimit = 200;
  // Code for "Other" flag type as defined in Reference Data
  private readonly otherFlagTypeCode = 'OT0001';

  public get otherInternalFlagTypeSelected(): boolean {
    return this.formGroup.get(CaseFlagFormFields.FLAG_TYPE)?.value?.flagCode === this.otherFlagTypeCode &&
      this.formGroup.get(CaseFlagFormFields.IS_VISIBLE_INTERNALLY_ONLY)?.value === true;
  }

  public ngOnInit(): void {
    this.addCommentsTitle = !this.isDisplayContextParameterExternal ?
      CaseFlagWizardStepTitle.ADD_FLAG_COMMENTS : CaseFlagWizardStepTitle.ADD_FLAG_COMMENTS_EXTERNAL_MODE;
    this.addCommentsHint = !this.isDisplayContextParameterExternal ?
      AddCommentsStep.HINT_TEXT : AddCommentsStep.HINT_TEXT_EXTERNAL;

    if (!this.formGroup.get(this.flagCommentsControlName)) {
      this.formGroup.addControl(this.flagCommentsControlName, new FormControl(''));
    }

    if (!this.optional){
      if ((this.formGroup?.value && this.formGroup?.value?.isParent === false && this.formGroup?.value?.flagComment === false) ||
        (this.formGroup?.value?.flagType?.isParent === false && this.formGroup?.value?.flagType?.flagComment === false)) {
        this.optional = true;
      } else {
        this.optional = false;
      }
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
      this.flagCommentsNotEnteredErrorMessage = this.isDisplayContextParameterExternal
        ? AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED_EXTERNAL
        : AddCommentsErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: this.flagCommentsNotEnteredErrorMessage,
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

  public next() {
    this.onNext();

    if (this.errorMessages.length === 0) {
      super.next();
    }
  }
}
