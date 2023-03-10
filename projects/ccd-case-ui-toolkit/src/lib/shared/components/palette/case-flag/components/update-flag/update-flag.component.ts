import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagWizardStepTitle, UpdateFlagErrorMessage, UpdateFlagStep } from '../../enums';
import { CaseFlagFormFields } from '../../enums/case-flag-form-fields.enum';

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
  public statusReasonNotEnteredErrorMessage: UpdateFlagErrorMessage = null;
  public statusReasonCharLimitErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagStepEnum = UpdateFlagStep;
  public readonly caseFlagStatuses = CaseFlagStatus;
  public readonly caseFlagFormFields = CaseFlagFormFields;
  private readonly commentsMaxCharLimit = 200;
  private flagDetail: FlagDetail;

  public ngOnInit(): void {
    if (this.selectedFlag && this.selectedFlag.flagDetailDisplay && this.selectedFlag.flagDetailDisplay.flagDetail) {
      this.flagDetail = this.selectedFlag.flagDetailDisplay.flagDetail;

      // Populate flag comments text area with existing comments
      this.formGroup.addControl(CaseFlagFormFields.COMMENTS, new FormControl(this.flagDetail.flagComment));
      this.formGroup.addControl(CaseFlagFormFields.STATUS, new FormControl(this.flagDetail.status));
      this.formGroup.addControl(CaseFlagFormFields.STATUS_CHANGE_REASON, new FormControl(''));
      this.formGroup.addControl(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED, new FormControl(false));

      if (this.flagDetail.name) {
        this.updateFlagTitle =
          `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${this.flagDetail.name}${this.flagDetail.subTypeValue ? `, ${this.flagDetail.subTypeValue}"` : '"'}`;
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
      selectedFlag: this.selectedFlag,
    });

    window.scrollTo(0, 0);
  }

  private validateTextEntry(): void {
    this.updateFlagNotEnteredErrorMessage = null;
    this.updateFlagCharLimitErrorMessage = null;
    this.statusReasonNotEnteredErrorMessage = null;
    this.statusReasonCharLimitErrorMessage = null;
    this.errorMessages = [];
    // Validation should fail if the flag has an existing comment and it has been deleted on screen; conversely, if there
    // is no existing comment then one is not required for validation to pass
    const comment = this.formGroup.get(CaseFlagFormFields.COMMENTS).value;
    if (!comment && this.flagDetail.flagComment) {
      this.updateFlagNotEnteredErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    if (comment && comment.length > this.commentsMaxCharLimit) {
      this.updateFlagCharLimitErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    const statusReason = this.formGroup.get(CaseFlagFormFields.STATUS_CHANGE_REASON).value;
    if (this.formGroup.get(CaseFlagFormFields.STATUS).value === CaseFlagStatus.NOT_APPROVED && !statusReason) {
      this.statusReasonNotEnteredErrorMessage = UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED,
        fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
      });
    }

    if (statusReason && statusReason.length > this.commentsMaxCharLimit) {
      this.statusReasonCharLimitErrorMessage = UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
      });
    }
  }
}
