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
  private readonly commentsMaxCharLimit = 100;

  public ngOnInit(): void {
    if ( this.selectedFlagDetail && this.selectedFlagDetail.name ) {
    this.updateFlagTitle = (this.selectedFlagDetail && this.selectedFlagDetail.subTypeValue) ?
    `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${this.selectedFlagDetail.name}, ${this.selectedFlagDetail.subTypeValue}"`
    : `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${this.selectedFlagDetail.name}"`;
    }
    this.updateFlagHint = UpdateFlagStep.HINT_TEXT ;
    this.updateFlagCharLimitInfo = UpdateFlagStep.CHARACTER_LIMIT_INFO;
    this.formGroup.addControl(this.updateFlagControlName, new FormControl(''));
  }

  public onNext(): void {
    // Validate flag comments entry
    this.validateTextEntry();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE, errorMessages: this.errorMessages });
  }

  public onChangeStatus(): void {
    this.selectedFlagDetail = {...this.selectedFlagDetail, status: this.selectedFlagDetail.status === 'Active' ? 'InActive' : 'Active'}
  }

  private validateTextEntry(): void {
    this.updateFlagNotEnteredErrorMessage = null;
    this.updateFlagCharLimitErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(this.updateFlagControlName).value) {
      this.updateFlagNotEnteredErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: this.updateFlagControlName
      });
    }
    if (this.formGroup.get(this.updateFlagControlName).value &&
      this.formGroup.get(this.updateFlagControlName).value.length > this.commentsMaxCharLimit) {
      this.updateFlagCharLimitErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: this.updateFlagControlName
      });
    }
  }
}
