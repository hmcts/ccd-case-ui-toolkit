import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RpxTranslationService } from 'rpx-xui-translation';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import { CaseFlagDisplayContextParameter, CaseFlagFieldState, CaseFlagFormFields, CaseFlagStatus, CaseFlagWizardStepTitle, UpdateFlagErrorMessage, UpdateFlagStep } from '../../enums';

@Component({
  selector: 'ccd-update-flag',
  templateUrl: './update-flag.component.html'
})
export class UpdateFlagComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public displayContextParameter: string;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public selectedFlag: FlagDetailDisplayWithFormGroupPath;
  public updateFlagTitle = '';
  public errorMessages: ErrorMessage[] = [];
  public updateFlagNotEnteredErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagCharLimitErrorMessage: UpdateFlagErrorMessage = null;
  public statusReasonNotEnteredErrorMessage: UpdateFlagErrorMessage = null;
  public statusReasonCharLimitErrorMessage: UpdateFlagErrorMessage = null;
  public updateFlagStepEnum = UpdateFlagStep;
  public validStatusProgressions: string[];
  public readonly caseFlagStatusEnum = CaseFlagStatus;
  public readonly caseFlagFormFields = CaseFlagFormFields;
  private readonly textMaxCharLimit = 200;
  private readonly selectedManageCaseLocation = 'selectedManageCaseLocation';
  private flagDetail: FlagDetail;
  public caseFlagDisplayContextParameter = CaseFlagDisplayContextParameter;

  constructor(private readonly rpxTranslationService: RpxTranslationService) { }

  public ngOnInit(): void {
    this.selectedFlag = this.formGroup.get(this.selectedManageCaseLocation).value as FlagDetailDisplayWithFormGroupPath;
    if (this.selectedFlag?.flagDetailDisplay?.flagDetail) {
      this.flagDetail = this.selectedFlag.flagDetailDisplay.flagDetail;
      const currentFlagStatusKey = Object.keys(CaseFlagStatus).find(key => CaseFlagStatus[key] === this.flagDetail.status);

      // Populate flag comments text area with existing comments
      let existingComments: string;
      if (this.rpxTranslationService.language === 'cy') {
        existingComments = this.flagDetail.flagComment_cy
          ? this.flagDetail.flagComment_cy
          : this.flagDetail.flagComment;
      } else {
        existingComments = this.flagDetail.flagComment
          ? this.flagDetail.flagComment
          : this.flagDetail.flagComment_cy;
      }
      this.formGroup.addControl(CaseFlagFormFields.COMMENTS, new FormControl(existingComments));
      this.formGroup.addControl(CaseFlagFormFields.STATUS, new FormControl(currentFlagStatusKey));
      this.formGroup.addControl(CaseFlagFormFields.STATUS_CHANGE_REASON, new FormControl(''));
      this.formGroup.addControl(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED, new FormControl(false));

      this.updateFlagTitle = this.setUpdateCaseFlagTitle(this.flagDetail);

      // Set the valid status options for display, based on current status of the selected flag. "Active" flags can
      // remain "Active" or move to "Inactive" only; "Requested" flags can remain "Requested" or move to "Active",
      // "Inactive", or "Not approved". No other status progressions are valid
      if (currentFlagStatusKey) {
        switch (currentFlagStatusKey) {
          case 'ACTIVE':
            this.validStatusProgressions = Object.keys(CaseFlagStatus).filter(key => !['REQUESTED', 'NOT_APPROVED'].includes(key));
            break;
          case 'REQUESTED':
            this.validStatusProgressions = Object.keys(CaseFlagStatus);
            break;
          default:
            this.validStatusProgressions = [];
        }
      }
    }
  }

  public setUpdateCaseFlagTitle(flagDetail: FlagDetail): string {
    switch (this.displayContextParameter) {
      case CaseFlagDisplayContextParameter.UPDATE:
        if (flagDetail?.name) {
          const subTypeValue = flagDetail.subTypeValue ? `, ${flagDetail.subTypeValue}` : ''
          return `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${flagDetail.name}${subTypeValue}"`;
        }
        return `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE}`;
      case CaseFlagDisplayContextParameter.UPDATE_EXTERNAL:
        return CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE_EXTERNAL;
      default:
        return CaseFlagWizardStepTitle.NONE;
    }
  }

  public onNext(): void {
    // Validate flag comments and status reason entry
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
    if (!comment && (this.flagDetail.flagComment || this.flagDetail.flagComment_cy)) {
      this.updateFlagNotEnteredErrorMessage = this.getUpdateFlagNotEnteredErrorMessage();
      this.errorMessages.push({
        title: '',
        description: this.updateFlagNotEnteredErrorMessage,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    if (comment && comment.length > this.textMaxCharLimit) {
      this.updateFlagCharLimitErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    const statusReason = this.formGroup.get(CaseFlagFormFields.STATUS_CHANGE_REASON).value;
    const flagStatusNotApprovedKey = Object.keys(CaseFlagStatus).find(key => CaseFlagStatus[key] === CaseFlagStatus.NOT_APPROVED);
    if (this.formGroup.get(CaseFlagFormFields.STATUS).value === flagStatusNotApprovedKey && !statusReason) {
      this.statusReasonNotEnteredErrorMessage = UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED,
        fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
      });
    }

    if (statusReason && statusReason.length > this.textMaxCharLimit) {
      this.statusReasonCharLimitErrorMessage = UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.STATUS_REASON_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
      });
    }
  }

  private getUpdateFlagNotEnteredErrorMessage(): UpdateFlagErrorMessage {
    switch(this.displayContextParameter) {
      case CaseFlagDisplayContextParameter.UPDATE:
        return UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      case CaseFlagDisplayContextParameter.UPDATE_EXTERNAL:
        return UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED_EXTERNAL;
      default:
        return UpdateFlagErrorMessage.NONE;
    }
  }
}
