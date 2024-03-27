import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage, Journey } from '../../../../../domain';
import { FieldsUtils } from '../../../../../services/fields';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, Flags, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagDisplayContextParameter, CaseFlagFieldState, CaseFlagStatus, CaseFlagWizardStepTitle, SelectFlagErrorMessage } from '../../enums';
import { AbstractJourneyComponent } from '../../../base-field';

@Component({
  selector: 'ccd-manage-case-flags',
  templateUrl: './manage-case-flags.component.html',
  styleUrls: ['./manage-case-flags.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCaseFlagsComponent extends AbstractJourneyComponent implements OnInit, Journey {
  @Input() public formGroup: FormGroup;
  @Input() public flagsData: FlagsWithFormGroupPath[];
  @Input() public caseTitle: string;
  @Input() public displayContextParameter: string;
  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public manageCaseFlagTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public manageCaseFlagSelectedErrorMessage: SelectFlagErrorMessage = null;
  public flagsDisplayData: FlagDetailDisplayWithFormGroupPath[];
  public flags: Flags;
  public noFlagsError = false;
  public readonly selectedControlName = 'selectedManageCaseLocation';
  private readonly excludedFlagStatuses: CaseFlagStatus[] = [CaseFlagStatus.INACTIVE, CaseFlagStatus.NOT_APPROVED];

  public ngOnInit(): void {
    this.manageCaseFlagTitle = this.setManageCaseFlagTitle(this.displayContextParameter);

    // Map flags instances to objects for display, filtering out any where the original status is either "Inactive" or
    // "Not approved"
    /* istanbul ignore else */
    if (this.flagsData) {
      this.flagsDisplayData = this.flagsData.reduce((displayData, flagsInstance) => {
        /* istanbul ignore else */
        if (flagsInstance.flags.details && flagsInstance.flags.details.length > 0) {
          displayData = [
            ...displayData,
            ...flagsInstance.flags.details.map((detail) => this.mapFlagDetailForDisplay(detail, flagsInstance))
          ];
        }
        return displayData;
      }, []).filter((flagForDisplay) => !this.excludedFlagStatuses.includes(flagForDisplay.originalStatus as CaseFlagStatus));
    }

    // Add a FormControl for the selected case flag if there is at least one flags instance remaining after mapping
    if (this.flagsDisplayData && this.flagsDisplayData.length > 0) {
      this.formGroup.addControl(this.selectedControlName, new FormControl(null));
    } else {
      // No flags display data means there are no flags to select from. The user cannot proceed with a flag update.
      // (Will need to be extended to check for case-level flags in future)
      this.onNoFlagsError();
    }
  }

  public mapFlagDetailForDisplay(flagDetail: FlagDetail, flagsInstance: FlagsWithFormGroupPath): FlagDetailDisplayWithFormGroupPath {
    // Reset the flag status with the original persisted status. This is needed because ngOnInit() needs to filter
    // out any "Inactive" or "Not approved" flags based on their status *before* modification. If the user changes a
    // flag's status then decides to return to the start of the flag update journey, the flag's status would no
    // longer reflect its actual *persisted* status
    // Also reset comments and description fields (both English and Welsh) with the original persisted data, to avoid
    // the UI caching any changes that the user might not want persisted, if they start over and don't intend to add
    // translations subsequently
    let originalStatus: string;
    let formattedValue = flagsInstance.caseField?.formatted_value;
    // Use the pathToFlagsFormGroup property from the selected flag location to drill down to the correct part of the
    // CaseField formatted_value from which to get the original persisted data
    const pathToValue = flagsInstance.pathToFlagsFormGroup;
    // Root-level Flags CaseFields don't have a dot-delimited path - just the CaseField ID itself - so don't drill down
    if (pathToValue.indexOf('.') > -1) {
      pathToValue.slice(pathToValue.indexOf('.') + 1).split('.').forEach((part) => {
        if (formattedValue && FieldsUtils.isNonEmptyObject(formattedValue)) {
          formattedValue = formattedValue[part];
        }
      });
    }
    if (formattedValue && FieldsUtils.isNonEmptyObject(formattedValue)) {
      const originalFlagDetail = formattedValue.details?.find((detail) => detail.id === flagDetail.id);
      if (originalFlagDetail) {
        originalStatus = originalFlagDetail.value?.status;
        flagDetail.flagComment = originalFlagDetail.value?.flagComment;
        flagDetail.flagComment_cy = originalFlagDetail.value?.flagComment_cy;
        flagDetail.otherDescription = originalFlagDetail.value?.otherDescription;
        flagDetail.otherDescription_cy = originalFlagDetail.value?.otherDescription_cy;
      }
    }
    return {
      flagDetailDisplay: {
        partyName: flagsInstance.flags?.partyName,
        flagDetail,
        flagsCaseFieldId: flagsInstance.caseField?.id,
        visibility: flagsInstance.flags?.visibility
      },
      pathToFlagsFormGroup: flagsInstance.pathToFlagsFormGroup,
      caseField: flagsInstance.caseField,
      roleOnCase: flagsInstance.flags?.roleOnCase,
      originalStatus
    };
  }

  public onNext(): void {
    // Validate flag selection
    this.validateSelection();
    // Return case flag field state, error messages, and flag selection to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: this.errorMessages,
      selectedFlag: this.formGroup.get(this.selectedControlName).value
        ? this.formGroup.get(this.selectedControlName).value as FlagDetailDisplayWithFormGroupPath
        : null
    });

    window.scrollTo(0, 0);
  }

  public setManageCaseFlagTitle(displayContextParameter: string): CaseFlagWizardStepTitle {
    switch (displayContextParameter) {
      case CaseFlagDisplayContextParameter.UPDATE:
      case CaseFlagDisplayContextParameter.UPDATE_2_POINT_1:
        return CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;
      case CaseFlagDisplayContextParameter.UPDATE_EXTERNAL:
        return CaseFlagWizardStepTitle.MANAGE_SUPPORT;
      default:
        return CaseFlagWizardStepTitle.NONE;
    }
  }

  private validateSelection(): void {
    this.manageCaseFlagSelectedErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(this.selectedControlName).value) {
      const errorMessage = this.displayContextParameter === CaseFlagDisplayContextParameter.UPDATE_EXTERNAL ?
        SelectFlagErrorMessage.MANAGE_SUPPORT_FLAG_NOT_SELECTED : SelectFlagErrorMessage.MANAGE_CASE_FLAGS_FLAG_NOT_SELECTED;
      this.manageCaseFlagSelectedErrorMessage = errorMessage;
      this.errorMessages.push({
        title: '',
        description: errorMessage,
        fieldId: 'conditional-radios-list'
      });
    }
  }

  private onNoFlagsError(): void {
    // Set error flag on component to remove the "Next" button (user cannot proceed with flag creation)
    this.noFlagsError = true;
    this.errorMessages = [];
    this.errorMessages.push({ title: '', description: SelectFlagErrorMessage.NO_FLAGS, fieldId: 'conditional-radios-list' });
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: this.errorMessages
    });
  }

  public next() {
    this.onNext();

    if (this.errorMessages.length === 0) {
      super.next();
    }
  }
}
