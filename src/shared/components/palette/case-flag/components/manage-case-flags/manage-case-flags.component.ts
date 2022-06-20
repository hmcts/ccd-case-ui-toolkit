import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplay, Flags } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagErrorMessage } from '../../enums';

@Component({
  selector: 'ccd-manage-case-flags',
  templateUrl: './manage-case-flags.component.html'
})
export class ManageCaseFlagsComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public flagsData: Flags[];
  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public manageCaseFlagTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public manageCaseFlagSelectedErrorMessage: SelectFlagErrorMessage = null;
  public flagsDisplayData: FlagDetailDisplay[];
  public noFlagsError = false;
  public readonly selectedControlName = 'selectedManageCaseLocation';

  public ngOnInit(): void {
    this.manageCaseFlagTitle = CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;

    // Map flags instances to objects for display
    if (this.flagsData) {
      this.flagsDisplayData = this.flagsData.reduce((displayData, flagsInstance) => {
        if (flagsInstance.details && flagsInstance.details.length > 0) {
          displayData = [
            ...displayData,
            ...flagsInstance.details.map(detail =>
              this.mapFlagDetailForDisplay(detail, flagsInstance.partyName, flagsInstance.flagsCaseFieldId)
            )
          ];
        }
        return displayData;
      }, []) as FlagDetailDisplay[];
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

  public mapFlagDetailForDisplay(flagDetail: FlagDetail, partyName: string, flagsCaseFieldId: string): FlagDetailDisplay {
    return {
      partyName,
      flagDetail,
      flagsCaseFieldId
    };
  }

  public processLabel(flagDisplay: FlagDetailDisplay): string {
    const partyName = flagDisplay.partyName ? flagDisplay.partyName : '';
    const flagName = flagDisplay.flagDetail.paths.length > 1
      ? `${flagDisplay.flagDetail.paths[1].value}, ${flagDisplay.flagDetail.paths[flagDisplay.flagDetail.paths.length - 1].value}`
      : flagDisplay.flagDetail.name
        ? flagDisplay.flagDetail.name
        : '';
    const comment = flagDisplay.flagDetail.flagComment ? flagDisplay.flagDetail.flagComment : '';
    return `${partyName} - ${flagName}${comment ? ` (${comment})` : ''}`;
  }

  public onNext(): void {
    // Validate flag selection
    this.validateSelection();
    // Return case flag field state, error messages, and flag selection to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: this.errorMessages,
      selectedFlagDetail: this.formGroup.get(this.selectedControlName).value
        ? (this.formGroup.get(this.selectedControlName).value as FlagDetailDisplay).flagDetail
        : null,
      flagsCaseFieldId: this.formGroup.get(this.selectedControlName).value
        ? (this.formGroup.get(this.selectedControlName).value as FlagDetailDisplay).flagsCaseFieldId
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
