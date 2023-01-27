import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagWizardStepTitle, UpdateFlagErrorMessage, UpdateFlagStep } from '../../enums';
import { UpdateFlagStatesEnum } from '../../enums/update-flag-states.enum';

@Component({
  selector: 'ccd-update-flag',
  templateUrl: './update-flag.component.html'
})
export class UpdateFlagComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public selectedFlag: FlagDetailDisplayWithFormGroupPath;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public currentFormStep: UpdateFlagStatesEnum = UpdateFlagStatesEnum.FLAG_FORM;
  public updateFlagStates = UpdateFlagStatesEnum;
  public updateFlagTitle = '';
  public errorMessages: ErrorMessage[] = [];
  public updateFlagNotEnteredErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagCharLimitErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagStepEnum = UpdateFlagStep;
  public readonly caseFlagStatuses = CaseFlagStatus;
  public readonly FLAG_COMMENTS_CONTROL_NAME = 'flagComment';
  public readonly FLAG_STATUS_CONTROL_NAME = 'flagStatus';
  public readonly FLAG_STATUS_CHANGE_REASON_CONTROL_NAME = 'flagStatusReasonChange';
  public readonly FLAG_WELSH_TRANSLATION_CONTROL_NAME = 'flagWelshTranslationNeeded';

  private readonly commentsMaxCharLimit = 200;

  public ngOnInit(): void {
    if (this.selectedFlag && this.selectedFlag.flagDetailDisplay && this.selectedFlag.flagDetailDisplay.flagDetail) {
      const flagDetail = this.selectedFlag.flagDetailDisplay.flagDetail;

      this.formGroup.addControl(this.FLAG_STATUS_CONTROL_NAME, new FormControl(flagDetail.status));
      this.formGroup.addControl(this.FLAG_STATUS_CHANGE_REASON_CONTROL_NAME, new FormControl(''));
      this.formGroup.addControl(this.FLAG_WELSH_TRANSLATION_CONTROL_NAME, new FormControl(false));
      // Populate flag comments text area with existing comments
      this.formGroup.addControl(this.FLAG_COMMENTS_CONTROL_NAME, new FormControl(flagDetail.flagComment));
      if (flagDetail.name) {
        this.updateFlagTitle =
          `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${flagDetail.name}${flagDetail.subTypeValue ? `, ${flagDetail.subTypeValue}"` : '"'}`;
      }
    }
  }

  public onNext(): void {
    // Validate flag comments entry
    this.validateTextEntry();
    // If validation has passed, update the flag details with the comments entered
    if (this.errorMessages.length === 0) {
      this.selectedFlag.flagDetailDisplay.flagDetail = {
        ...this.selectedFlag.flagDetailDisplay.flagDetail, flagComment: this.formGroup.get(this.FLAG_COMMENTS_CONTROL_NAME).value
      };
    }

    if (this.errorMessages.length > 0 || !this.formGroup.get(this.FLAG_WELSH_TRANSLATION_CONTROL_NAME).value
      || this.currentFormStep === UpdateFlagStatesEnum.WELSH_TRANSLATION_FORM) {
      // Return case flag field state, error messages, and selected flag detail to the parent. The selected flag must be
      // re-emitted because the parent component repopulates this on handling this EventEmitter
      this.caseFlagStateEmitter.emit({
        currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
        errorMessages: this.errorMessages,
        selectedFlag: this.selectedFlag,
      });
    } else if (this.formGroup.get(this.FLAG_WELSH_TRANSLATION_CONTROL_NAME).value && this.currentFormStep === 0) {
      this.currentFormStep = UpdateFlagStatesEnum.WELSH_TRANSLATION_FORM;
      this.caseFlagStateEmitter.emit({
        currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE_EXTRA_STEP,
        errorMessages: this.errorMessages,
        selectedFlag: this.selectedFlag,
      });
    }

    window.scrollTo(0, 0);
  }

  public onBack(): void {
    if (this.currentFormStep === UpdateFlagStatesEnum.WELSH_TRANSLATION_FORM) {
      this.currentFormStep = UpdateFlagStatesEnum.FLAG_FORM;
    }
  }

  private validateTextEntry(): void {
    this.updateFlagNotEnteredErrorMessage = null;
    this.updateFlagCharLimitErrorMessage = null;
    this.errorMessages = [];
    const comment = this.formGroup.get(this.FLAG_COMMENTS_CONTROL_NAME).value;
    if (!comment) {
      this.updateFlagNotEnteredErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED,
        fieldId: this.FLAG_COMMENTS_CONTROL_NAME
      });
    }

    if (comment && comment.length > this.commentsMaxCharLimit) {
      this.updateFlagCharLimitErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: this.FLAG_COMMENTS_CONTROL_NAME
      });
    }
  }
}
