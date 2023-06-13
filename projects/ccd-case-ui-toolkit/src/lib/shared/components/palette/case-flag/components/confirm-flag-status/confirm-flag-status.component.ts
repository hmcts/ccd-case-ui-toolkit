import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState } from '../../domain';
import {
  CaseFlagFieldState,
  CaseFlagStatus,
  CaseFlagWizardStepTitle,
  ConfirmStatusErrorMessage,
  ConfirmStatusStep
} from '../../enums';

@Component({
  selector: 'ccd-confirm-flag-status',
  templateUrl: './confirm-flag-status.component.html'
})
export class ConfirmFlagStatusComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public defaultStatus: string;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public confirmFlagStatusTitle: CaseFlagWizardStepTitle;
  public caseFlagStatusEnum = CaseFlagStatus;
  public flagCreationStatuses: string[];
  public errorMessages: ErrorMessage[] = [];
  public statusReasonNotEnteredErrorMessage: ConfirmStatusErrorMessage = null;
  public statusReasonCharLimitErrorMessage: ConfirmStatusErrorMessage = null;
  public statusReasonHint: ConfirmStatusStep;
  public statusReasonCharLimitInfo: ConfirmStatusStep;
  public readonly selectedStatusControlName = 'selectedStatus';
  public readonly statusReasonControlName = 'statusReason';
  private readonly reasonMaxCharLimit = 200;

  public ngOnInit(): void {
    this.confirmFlagStatusTitle = CaseFlagWizardStepTitle.CONFIRM_FLAG_STATUS;
    this.flagCreationStatuses = Object.keys(CaseFlagStatus).filter(key => !['INACTIVE'].includes(key));
    this.statusReasonHint = ConfirmStatusStep.HINT_TEXT;
    this.statusReasonCharLimitInfo = ConfirmStatusStep.CHARACTER_LIMIT_INFO;
    this.formGroup.addControl(this.selectedStatusControlName, new FormControl(this.flagCreationStatuses.find(
      key => CaseFlagStatus[key] === this.defaultStatus)));
    this.formGroup.addControl(this.statusReasonControlName, new FormControl(''));
  }

  public onNext(): void {
    // Validate status reason entry
    this.validateTextEntry();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS, errorMessages: this.errorMessages });
  }

  private validateTextEntry(): void {
    this.statusReasonNotEnteredErrorMessage = null;
    this.statusReasonCharLimitErrorMessage = null;
    this.errorMessages = [];
    if (this.formGroup.get(this.selectedStatusControlName).value === 'NOT_APPROVED' &&
      !this.formGroup.get(this.statusReasonControlName).value) {
      this.statusReasonNotEnteredErrorMessage = ConfirmStatusErrorMessage.STATUS_REASON_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: ConfirmStatusErrorMessage.STATUS_REASON_NOT_ENTERED,
        fieldId: this.statusReasonControlName
      });
    }
    if (this.formGroup.get(this.statusReasonControlName).value &&
      this.formGroup.get(this.statusReasonControlName).value.length > this.reasonMaxCharLimit) {
      this.statusReasonCharLimitErrorMessage = ConfirmStatusErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: ConfirmStatusErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
        fieldId: this.statusReasonControlName
      });
    }
  }
}
