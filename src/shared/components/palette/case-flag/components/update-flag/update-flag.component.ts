import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, UpdateFlagErrorMessage, UpdateFlagStep } from '../../enums';

@Component({
  selector: 'ccd-update-flag',
  templateUrl: './update-flag.component.html'
})
export class UpdateFlagComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public selectedFlagDetail: FlagDetail;

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

  public onNext(): void {
    // Validate flag comments entry
    this.validateTextEntry();
    // Return case flag field state, error messages, and selected flag detail to the parent. The selected flag must be
    // re-emitted because the parent component repopulates this on handling this EventEmitter
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: this.errorMessages,
      selectedFlagDetail: this.selectedFlagDetail
    });
  }

  public onChangeStatus(): void {
    this.selectedFlagDetail = {...this.selectedFlagDetail, status: this.selectedFlagDetail.status === 'Active' ? 'Inactive' : 'Active'}
  }

  private validateTextEntry(): void {
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
