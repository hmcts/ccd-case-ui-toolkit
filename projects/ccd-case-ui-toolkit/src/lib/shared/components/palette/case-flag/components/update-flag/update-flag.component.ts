import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RpxTranslationService } from 'rpx-xui-translation';
import { ErrorMessage, Journey } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../../domain';
import {
  CaseFlagDisplayContextParameter,
  CaseFlagFieldState,
  CaseFlagFormFields,
  CaseFlagStatus,
  CaseFlagWizardStepTitle,
  UpdateFlagErrorMessage,
  UpdateFlagStep
} from '../../enums';
import { AbstractJourneyComponent } from '../../../base-field';
import { MultipageComponentStateService } from "../../../../../services";

@Component({
  selector: 'ccd-update-flag',
  templateUrl: './update-flag.component.html'
})
export class UpdateFlagComponent extends AbstractJourneyComponent implements OnInit, Journey {
  @Input() public formGroup: FormGroup;
  @Input() public displayContextParameter: string;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public selectedFlag: FlagDetailDisplayWithFormGroupPath;
  public updateFlagTitle = '';
  public errorMessages: ErrorMessage[] = [];
  public commentsNotEnteredErrorMessage: UpdateFlagErrorMessage = null;
  public commentsCharLimitErrorMessage: UpdateFlagErrorMessage = null;
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
  public externalUserUpdate = false;
  public internalUserUpdate = false;
  public internalUser2Point1EnabledUpdate = false;

  public get externallyVisibleFlag(): boolean {
    return this.selectedFlag.flagDetailDisplay.visibility?.toLowerCase() === 'external';
  }

  constructor(
    private readonly rpxTranslationService: RpxTranslationService, 
    multipageComponentStateService: MultipageComponentStateService
  ) {
    super(multipageComponentStateService);
   }

  public ngOnInit(): void {
    // Set whether this is an external, internal, or internal Case Flags v2.1 enabled user update
    this.externalUserUpdate = this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    this.internalUserUpdate = this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE;
    this.internalUser2Point1EnabledUpdate = this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_2_POINT_1;
    this.selectedFlag = this.formGroup.get(this.selectedManageCaseLocation)?.value as FlagDetailDisplayWithFormGroupPath;
    if (this.selectedFlag?.flagDetailDisplay?.flagDetail) {
      this.flagDetail = this.selectedFlag.flagDetailDisplay.flagDetail;
      // If present, use the *original* flag status, not the one in the flagDetail object, because the status could have
      // been modified via a previous "Update Flag" journey through the UI but not persisted yet (thus not the *true* flag
      // status). Otherwise, use the status from the flagDetail object (initially, the original flag status won't be
      // present because it gets cached only on first update by WriteCaseFlagFieldComponent)
      const currentFlagStatusKey = Object.keys(CaseFlagStatus).find(
        (key) => CaseFlagStatus[key] === (this.selectedFlag.originalStatus || this.flagDetail.status));

      // Populate flag comments text area with existing comments; use the comments appropriate for the selected language,
      // falling back on their alternate counterpart if none are available. Comments are to be populated one time only -
      // when the user first visits the page - even if they switch language subsequently
      let existingComments: string;
      if (this.rpxTranslationService.language === 'cy') {
        existingComments = this.flagDetail.flagComment_cy || this.flagDetail.flagComment;
      } else {
        existingComments = this.flagDetail.flagComment || this.flagDetail.flagComment_cy;
      }
      this.formGroup.addControl(CaseFlagFormFields.COMMENTS, new FormControl(existingComments));
      this.formGroup.addControl(CaseFlagFormFields.STATUS, new FormControl(currentFlagStatusKey));
      // Populate status reason only if the user is not external
      this.formGroup.addControl(CaseFlagFormFields.STATUS_CHANGE_REASON, new FormControl(
        this.externalUserUpdate ? '' : this.flagDetail.flagUpdateComment));
      this.formGroup.addControl(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED, new FormControl(false));

      this.updateFlagTitle = this.setUpdateCaseFlagTitle(this.flagDetail);

      // Set the valid status options for display, based on current status of the selected flag. "Active" flags can
      // remain "Active" or move to "Inactive" only; "Requested" flags can remain "Requested" or move to "Active",
      // "Inactive", or "Not approved". No other status progressions are valid
      if (currentFlagStatusKey) {
        switch (currentFlagStatusKey) {
          case 'ACTIVE':
            this.validStatusProgressions = Object.keys(CaseFlagStatus).filter((key) => !['REQUESTED', 'NOT_APPROVED'].includes(key));
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
      case CaseFlagDisplayContextParameter.UPDATE_2_POINT_1:
        if (flagDetail?.name) {
          const subTypeValue = flagDetail.subTypeValue || flagDetail.subTypeValue_cy
            ? `, ${flagDetail.subTypeValue || flagDetail.subTypeValue_cy}`
            : '';
          const otherDescription = flagDetail.otherDescription || flagDetail.otherDescription_cy
            ? `, ${flagDetail.otherDescription || flagDetail.otherDescription_cy}`
            : '';
          return subTypeValue
            ? `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${flagDetail.name}${subTypeValue}"`
            : `${CaseFlagWizardStepTitle.UPDATE_FLAG_TITLE} "${flagDetail.name}${otherDescription}"`;
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
    this.validateTranslationNeeded();

    // Set selected flag status to "Inactive" if update is by external user
    if (this.externalUserUpdate) {
      this.formGroup.get(CaseFlagFormFields.STATUS)?.setValue(Object.keys(CaseFlagStatus)[2]);
    }

    // Return case flag field state, error messages, and selected flag detail to the parent. The selected flag must be
    // re-emitted because the parent component repopulates this on handling this EventEmitter
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: this.errorMessages,
      selectedFlag: this.selectedFlag,
    });

    window.scrollTo(0, 0);
  }

  public validateTranslationNeeded(): void {
    // it is possible that the user can select to have translation and then navigate back to remove the required translation in the same journey
    // this function will check the user does not have any of the translation fields applied and remove if they do
    const flagDetails = this.selectedFlag.flagDetailDisplay.flagDetail;
    const isTranslationRequired = this.formGroup.value.flagIsWelshTranslationNeeded;
    const hasTranslationFields = (flagDetails.flagComment_cy || flagDetails.otherDescription || flagDetails.otherDescription_cy);
    if (!isTranslationRequired && hasTranslationFields) {
      flagDetails.flagComment_cy = null;
      flagDetails.otherDescription = null;
      flagDetails.otherDescription_cy = null;
      this.formGroup.removeControl('flagComment_cy');
      this.formGroup.removeControl('otherDescription');
      this.formGroup.removeControl('otherDescription_cy');
    }
  }

  public onMakeInactive(): void {
    // Set selected flag status to "Inactive" on screen and in the FormGroup
    this.selectedFlag.flagDetailDisplay.flagDetail.status = CaseFlagStatus.INACTIVE;
    this.formGroup.get(CaseFlagFormFields.STATUS)?.setValue(Object.keys(CaseFlagStatus)[2]);
  }

  private validateTextEntry(): void {
    this.commentsNotEnteredErrorMessage = null;
    this.commentsCharLimitErrorMessage = null;
    this.statusReasonNotEnteredErrorMessage = null;
    this.statusReasonCharLimitErrorMessage = null;
    this.errorMessages = [];
    // Validation should fail if the flag has an existing comment and it has been deleted on screen; conversely, if there
    // is no existing comment then one is not required for validation to pass
    const comment = this.formGroup.get(CaseFlagFormFields.COMMENTS)?.value;
    if (!comment && (this.flagDetail.flagComment || this.flagDetail.flagComment_cy)) {
      this.commentsNotEnteredErrorMessage = !this.displayContextParameter
        ? UpdateFlagErrorMessage.NONE
        : UpdateFlagErrorMessage.FLAG_COMMENTS_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: this.commentsNotEnteredErrorMessage,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    if (comment && comment.length > this.textMaxCharLimit) {
      this.commentsCharLimitErrorMessage = UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.FLAG_COMMENTS_CHAR_LIMIT_EXCEEDED,
        fieldId: CaseFlagFormFields.COMMENTS
      });
    }

    const statusReason = this.formGroup.get(CaseFlagFormFields.STATUS_CHANGE_REASON)?.value;
    const flagStatusNotApprovedKey = Object.keys(CaseFlagStatus).find((key) => CaseFlagStatus[key] === CaseFlagStatus.NOT_APPROVED);
    // Status reason is mandatory if flag status is "Not approved" or user is external
    if (this.formGroup.get(CaseFlagFormFields.STATUS)?.value === flagStatusNotApprovedKey && !statusReason) {
      this.statusReasonNotEnteredErrorMessage = UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED,
        fieldId: CaseFlagFormFields.STATUS_CHANGE_REASON
      });
    }

    if (this.externalUserUpdate && !statusReason) {
      this.statusReasonNotEnteredErrorMessage = UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED_EXTERNAL;
      this.errorMessages.push({
        title: '',
        description: UpdateFlagErrorMessage.STATUS_REASON_NOT_ENTERED_EXTERNAL,
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

  public next() {
    this.onNext();

    if (this.errorMessages.length === 0) {
      super.next();
    }
  }
}
