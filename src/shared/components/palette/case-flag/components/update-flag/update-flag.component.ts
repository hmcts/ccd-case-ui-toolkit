import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { FlagDetail } from '../../domain';
import { CaseFlagWizardStepTitle, UpdateFlagErrorMessage, UpdateFlagStep } from '../../enums';

@Component({
  selector: 'ccd-update-flag',
  templateUrl: './update-flag.component.html'
})
export class UpdateFlagComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public selectedFlagDetail: FlagDetail;

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

    if (this.selectedFlagDetail) {
      // Populate flag comments text area with existing comments
      this.formGroup.get(this.updateFlagControlName).setValue(this.selectedFlagDetail.flagComment);
      if (this.selectedFlagDetail.name) {
        this.updateFlagTitle =
          `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${this.selectedFlagDetail.name}${this.selectedFlagDetail.subTypeValue
            ? `, ${this.selectedFlagDetail.subTypeValue}"`
            : '"'}`;
      }
    }
  }

  public onChangeStatus(): void {
    this.selectedFlagDetail = {...this.selectedFlagDetail, status: this.selectedFlagDetail.status === 'Active' ? 'Inactive' : 'Active'}
  }

  public validateFlagComments(): void {
    this.updateFlagNotEnteredErrorMessage = null;
    this.updateFlagCharLimitErrorMessage = null;
    this.errorMessages = [];
    const comment = this.formGroup.get(this.updateFlagControlName).value;
    if (this.selectedFlagDetail.flagComment && !comment) {
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
