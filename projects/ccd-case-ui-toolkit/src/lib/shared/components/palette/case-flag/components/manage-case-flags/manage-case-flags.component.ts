import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, Flags, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagWizardStepTitle, SelectFlagErrorMessage } from '../../enums';

@Component({
  selector: 'ccd-manage-case-flags',
  templateUrl: './manage-case-flags.component.html',
  styleUrls: ['./manage-case-flags.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCaseFlagsComponent implements OnInit {

  private static readonly CASE_LEVEL_CASE_FLAGS_FIELD_ID = 'caseFlags';

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
  private readonly updateMode = '#ARGUMENT(UPDATE)';
  private readonly updateExternalMode = '#ARGUMENT(UPDATE,EXTERNAL)';
  private readonly excludedFlagStatuses: CaseFlagStatus[] = [CaseFlagStatus.INACTIVE, CaseFlagStatus.NOT_APPROVED];

  public ngOnInit(): void {
    this.manageCaseFlagTitle = this.setManageCaseFlagTitle(this.displayContextParameter);

    // Map flags instances to objects for display
    if (this.flagsData) {
      this.flagsDisplayData = this.flagsData.reduce((displayData, flagsInstance) => {
        if (flagsInstance.flags.details && flagsInstance.flags.details.length > 0) {
          displayData = [
            ...displayData,
            ...flagsInstance.flags.details.map(detail => {
              // Only map flags instances where the status is neither "Inactive" nor "Not approved"
              // This will result in some undefined mappings, which need to be filtered out after the reduce operation
              if (!this.excludedFlagStatuses.includes(detail.status as CaseFlagStatus)) {
                return this.mapFlagDetailForDisplay(detail, flagsInstance);
              }
            })
          ];
        }
        return displayData;
      }, []).filter(flagDetailDisplay => !!flagDetailDisplay);

      this.flagsDisplayData.forEach(flagDisplayData => {
        flagDisplayData.label = this.processLabel(flagDisplayData);
      });
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
    return {
      flagDetailDisplay: {
        partyName: flagsInstance.flags.partyName,
        flagDetail,
        flagsCaseFieldId: flagsInstance.caseField.id
      },
      pathToFlagsFormGroup: flagsInstance.pathToFlagsFormGroup,
      caseField: flagsInstance.caseField,
      roleOnCase: flagsInstance.flags.roleOnCase
    };
  }

  public processLabel(flagDisplay: FlagDetailDisplayWithFormGroupPath): string {
    const flagDetail = flagDisplay.flagDetailDisplay.flagDetail;
    const partyName = this.getPartyName(flagDisplay);
    const flagName = this.getFlagName(flagDetail);
    const flagDescription = this.getFlagDescription(flagDetail);
    const roleOnCase = this.getRoleOnCase(flagDisplay);
    const flagComment = this.getFlagComments(flagDetail);

    return flagName === flagDescription
      ? `${partyName}${roleOnCase} - <span class="flag-name-and-description">${flagDescription}</span>${flagComment}`
      : `${partyName}${roleOnCase} - <span class="flag-name-and-description">${flagName}, ${flagDescription}</span>${flagComment}`;
  }

  public getPartyName(flagDisplay: FlagDetailDisplayWithFormGroupPath): string {
    if (flagDisplay.pathToFlagsFormGroup && flagDisplay.pathToFlagsFormGroup === ManageCaseFlagsComponent.CASE_LEVEL_CASE_FLAGS_FIELD_ID) {
      return 'Case level';
    }
    if (flagDisplay.flagDetailDisplay.partyName) {
      return `${flagDisplay.flagDetailDisplay.partyName}`;
    }
    return '';
  }

  public getFlagName(flagDetail: FlagDetail): string {
    if (flagDetail && flagDetail.path && flagDetail.path.length > 1) {
      return flagDetail.path[1].value;
    }
    if (flagDetail.subTypeKey && flagDetail.subTypeValue) {
      return flagDetail.subTypeValue;
    }
    return flagDetail.name;
  }

  public getFlagDescription(flagDetail: FlagDetail): string {
    if (flagDetail && flagDetail.name) {
      if (flagDetail.name === 'Other' && flagDetail.otherDescription) {
        return flagDetail.otherDescription;
      }
      if (flagDetail.subTypeKey && flagDetail.subTypeValue) {
        return flagDetail.subTypeValue;
      }
      return flagDetail.name;
    }
    return '';
  }

  public getRoleOnCase(flagDisplay: FlagDetailDisplayWithFormGroupPath): string {
    if (flagDisplay && flagDisplay.roleOnCase) {
      return ` (${flagDisplay.roleOnCase})`;
    }
    return '';
  }

  public getFlagComments(flagDetail: FlagDetail): string {
    if (flagDetail.flagComment) {
      return ` (${flagDetail.flagComment})`;
    }
    return '';
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
      case this.updateMode:
        return CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;
      case this.updateExternalMode:
        return CaseFlagWizardStepTitle.MANAGE_SUPPORT;
      default:
        return CaseFlagWizardStepTitle.NONE;
    }
  }

  private validateSelection(): void {
    this.manageCaseFlagSelectedErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(this.selectedControlName).value) {
      const errorMessage = this.displayContextParameter === this.updateExternalMode ?
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
    this.errorMessages.push({title: '', description: SelectFlagErrorMessage.NO_FLAGS, fieldId: 'conditional-radios-list'});
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: this.errorMessages
    });
  }
}
