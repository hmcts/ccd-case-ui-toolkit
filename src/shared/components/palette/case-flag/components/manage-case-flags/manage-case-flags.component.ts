import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CaseField, ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagErrorMessage } from '../../enums';

@Component({
  selector: 'ccd-manage-case-flags',
  templateUrl: './manage-case-flags.component.html'
})
export class ManageCaseFlagsComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public flagsData: FlagsWithFormGroupPath[];
  @Input() public caseTitle: string;
  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public manageCaseFlagTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public manageCaseFlagSelectedErrorMessage: SelectFlagErrorMessage = null;
  public flagsDisplayData: FlagDetailDisplayWithFormGroupPath[];
  public noFlagsError = false;
  public readonly selectedControlName = 'selectedManageCaseLocation';
  public readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public ngOnInit(): void {
    this.manageCaseFlagTitle = CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;

    // Map flags instances to objects for display
    if (this.flagsData) {
      this.flagsDisplayData = this.flagsData.reduce((displayData, flagsInstance) => {
        if (flagsInstance.flags.details && flagsInstance.flags.details.length > 0) {
          displayData = [
            ...displayData,
            ...flagsInstance.flags.details.map(detail =>
              this.mapFlagDetailForDisplay(detail, flagsInstance.flags.partyName, flagsInstance.pathToFlagsFormGroup,
                flagsInstance.caseField)
            )
          ];
        }
        return displayData;
      }, []);
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

  public mapFlagDetailForDisplay(flagDetail: FlagDetail, partyName: string,
    pathToFlagsFormGroup: string, caseField: CaseField): FlagDetailDisplayWithFormGroupPath {
      return {
        flagDetailDisplay: {
          partyName,
          flagDetail,
          flagsCaseFieldId: caseField.id
        },
        pathToFlagsFormGroup,
        caseField
      };
  }

  public processLabel(flagDisplay: FlagDetailDisplayWithFormGroupPath): string {
    const partyName = flagDisplay.pathToFlagsFormGroup && flagDisplay.pathToFlagsFormGroup === this.caseLevelCaseFlagsFieldId
      ? `${this.caseTitle} - `
      : flagDisplay.flagDetailDisplay.partyName
        ? `${flagDisplay.flagDetailDisplay.partyName} - `
        :  '';

    const flagDetail = flagDisplay.flagDetailDisplay.flagDetail;

    const flagPathOrName = flagDetail && flagDetail.path && flagDetail.path.length > 1
      ? flagDetail.path[1].value
      : flagDetail.subTypeKey && flagDetail.subTypeValue
        ? flagDetail.subTypeValue
        : flagDetail.name;

    const flagOtherDescriptionOrName = flagDetail && flagDetail.name
      ? flagDetail.name === 'Other'
        ? flagDetail.otherDescription
        : flagDetail.subTypeKey && flagDetail.subTypeValue
          ? flagDetail.subTypeValue
          : flagDetail.name
      : '';

    const comment = flagDetail.flagComment
      ? ` (${flagDetail.flagComment})`
      : '';

    return flagPathOrName === flagOtherDescriptionOrName
      ? `${partyName}${flagOtherDescriptionOrName}${comment}`
      : `${partyName}${flagPathOrName}, ${flagOtherDescriptionOrName}${comment}`;
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
  }

  private validateSelection(): void {
    this.manageCaseFlagSelectedErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(this.selectedControlName).value) {
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
