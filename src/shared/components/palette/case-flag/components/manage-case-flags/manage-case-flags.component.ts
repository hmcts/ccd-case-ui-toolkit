import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, Flags, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagErrorMessage } from '../../enums';

@Component({
  selector: 'ccd-manage-case-flags',
  templateUrl: './manage-case-flags.component.html',
  styleUrls: ['./manage-case-flags.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCaseFlagsComponent implements OnInit {

  private static readonly CASE_LEVEL_CASE_FLAGS_FIELD_ID = 'caseFlags';
  private static readonly SELECTED_CONTROL_NAME = 'selectedManageCaseLocation';

  @Input() public formGroup: FormGroup;
  @Input() public flagsData: FlagsWithFormGroupPath[];
  @Input() public caseTitle: string;
  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public manageCaseFlagTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public manageCaseFlagSelectedErrorMessage: SelectFlagErrorMessage = null;
  public flagsDisplayData: FlagDetailDisplayWithFormGroupPath[];
  public flags: Flags;
  public noFlagsError = false;

  public ngOnInit(): void {
    this.manageCaseFlagTitle = CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;

    // Map flags instances to objects for display
    if (this.flagsData) {
      this.flagsDisplayData = this.flagsData.reduce((displayData, flagsInstance) => {
        if (flagsInstance.flags.details && flagsInstance.flags.details.length > 0) {
          displayData = [
            ...displayData,
            ...flagsInstance.flags.details.map(detail =>
              this.mapFlagDetailForDisplay(detail, flagsInstance)
            )
          ];
        }
        return displayData;
      }, []);

      this.flagsDisplayData.forEach(flagDisplayData => {
        flagDisplayData.label = this.processLabel(flagDisplayData);
      });

      console.log('FLAG DISPLAY DATA', this.flagsDisplayData);
    }

    // Add a FormControl for the selected case flag if there is at least one flags instance remaining after mapping
    if (this.flagsDisplayData && this.flagsDisplayData.length > 0) {
      this.formGroup.addControl(ManageCaseFlagsComponent.SELECTED_CONTROL_NAME, new FormControl(null));
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
      ? `${partyName} ${roleOnCase} - <span class="flag-name-and-description">${flagDescription}</span> ${flagComment}`
      : `${partyName} ${roleOnCase} - <span class="flag-name-and-description">${flagName}, ${flagDescription}</span> ${flagComment}`;
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
      return `(${flagDisplay.roleOnCase})`;
    }
    return '';
  }

  public getFlagComments(flagDetail: FlagDetail): string {
    if (flagDetail.flagComment) {
      return `(${flagDetail.flagComment})`;
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
      selectedFlag: this.formGroup.get(ManageCaseFlagsComponent.SELECTED_CONTROL_NAME).value
        ? this.formGroup.get(ManageCaseFlagsComponent.SELECTED_CONTROL_NAME).value as FlagDetailDisplayWithFormGroupPath
        : null
    });
  }

  private validateSelection(): void {
    this.manageCaseFlagSelectedErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(ManageCaseFlagsComponent.SELECTED_CONTROL_NAME).value) {
      this.manageCaseFlagSelectedErrorMessage = SelectFlagErrorMessage.FLAG_NOT_SELECTED;
      this.errorMessages.push({
        title: '',
        description: SelectFlagErrorMessage.FLAG_NOT_SELECTED,
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
