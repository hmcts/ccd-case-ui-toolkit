import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagWizardStepTitle, UpdateFlagErrorMessage, UpdateFlagStep } from '../../enums';

@Component({
  selector: 'ccd-update-flag',
  templateUrl: './update-flag.component.html'
})
export class UpdateFlagComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public selectedFlag: FlagDetailDisplayWithFormGroupPath;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public updateFlagTitle = '';
  public errorMessages: ErrorMessage[] = [];
  public updateFlagNotEnteredErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagCharLimitErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagHint: UpdateFlagStep;
  public updateFlagCharLimitInfo: UpdateFlagStep;
  public readonly updateFlagControlName = 'flagComments';
  private readonly commentsMaxCharLimit = 200;

  public ngOnInit(): void {
    this.updateFlagHint = UpdateFlagStep.HINT_TEXT ;
    this.updateFlagCharLimitInfo = UpdateFlagStep.CHARACTER_LIMIT_INFO;
    this.formGroup.addControl(this.updateFlagControlName, new FormControl(''));

    if (this.selectedFlag && this.selectedFlag.flagDetailDisplay && this.selectedFlag.flagDetailDisplay.flagDetail) {
      const flagDetail = this.selectedFlag.flagDetailDisplay.flagDetail;
      // Populate flag comments text area with existing comments
      this.formGroup.get(this.updateFlagControlName).setValue(flagDetail.flagComment);
      if (flagDetail.name) {
        this.updateFlagTitle =
          `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${flagDetail.name}${flagDetail.subTypeValue
            ? `, ${flagDetail.subTypeValue}"`
            : '"'}`;
      }
    }
  }

  public onNext(): void {
    // Validate flag comments entry
    this.validateTextEntry();
    // If validation has passed, update the flag details with the comments entered
    if (this.errorMessages.length === 0) {
      this.selectedFlag.flagDetailDisplay.flagDetail = {
        ...this.selectedFlag.flagDetailDisplay.flagDetail, flagComment: this.formGroup.get(this.updateFlagControlName).value
      };
    }
    // Return case flag field state, error messages, and selected flag detail to the parent. The selected flag must be
    // re-emitted because the parent component repopulates this on handling this EventEmitter
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: this.errorMessages,
      selectedFlag: this.selectedFlag
    });
  }

  public onChangeStatus(): void {
    this.selectedFlag.flagDetailDisplay.flagDetail = {
      ...this.selectedFlag.flagDetailDisplay.flagDetail,
      status: this.selectedFlag.flagDetailDisplay.flagDetail.status === CaseFlagStatus.ACTIVE
        ? CaseFlagStatus.INACTIVE
        : CaseFlagStatus.ACTIVE
    };
  }

  private validateTextEntry(): void {
    this.updateFlagNotEnteredErrorMessage = null;
    this.updateFlagCharLimitErrorMessage = null;
    this.errorMessages = [];
    const comment = this.formGroup.get(this.updateFlagControlName).value;
    if (!comment) {
      this.updateFlagNotEnteredErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: this.updateFlagControlName
      });
    }
    if (comment && comment.length > this.commentsMaxCharLimit) {
      this.updateFlagCharLimitErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: this.updateFlagControlName
      });
    }
  }
}
