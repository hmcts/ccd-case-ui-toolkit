import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState } from '../../domain';
import {
  CaseFlagFieldState,
  CaseFlagStatus,
  CaseFlagWizardStepTitle,
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
  public statusReasonHint: ConfirmStatusStep;
  public statusReasonCharLimitInfo: ConfirmStatusStep;
  public readonly selectedStatusControlName = 'selectedStatus';
  public readonly statusReasonControlName = 'statusReason';

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
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS, errorMessages: this.errorMessages });
  }
}
