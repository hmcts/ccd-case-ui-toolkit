import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, FlagDetailDisplay, Flags } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle } from '../../enums';
import { SelectManageCaseFlagErrorMessage } from '../../enums/manage-case-flag-type.enum';

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
  public manageCaseFlagSelectedErrorMessage: SelectManageCaseFlagErrorMessage = null;
  public flagsDisplayData: FlagDetailDisplay[];
  public caseFlagsConfigError = false;
  public readonly selectedControlName = 'selectedManageCaseLocation';

  public ngOnInit(): void {
    this.manageCaseFlagTitle = CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;

    // Map flags instances to objects for display
    if (this.flagsData) {
      this.flagsDisplayData = this.flagsData.reduce((displayData, flagsInstance) => {
        if (flagsInstance.details && flagsInstance.details.length > 0) {
          displayData = [
            ...displayData,
            ...flagsInstance.details.map(detail => this.mapFlagDetailForDisplay(detail, flagsInstance.partyName))
          ];
        }
        return displayData;
      }, []) as FlagDetailDisplay[];
    }

    // Add a FormControl for the selected case flag if there is at least one flags instance remaining after mapping
    if (this.flagsDisplayData && this.flagsDisplayData.length > 0) {
      this.formGroup.addControl(this.selectedControlName, new FormControl(null));
    } else {
      // No flags display data means there are no parties with flags to select from. The user cannot proceed with a
      // flag update. (Will need to be extended to check for case-level flags in future)
      this.onCaseFlagsConfigError();
    }
  }

  public mapFlagDetailForDisplay(flagDetail: FlagDetail, partyName: string): FlagDetailDisplay {
    return {
      partyName,
      flagDetail
    };
  }

  public processLabel(flagDisplay: FlagDetailDisplay): string {
    const partyName = flagDisplay.partyName ? flagDisplay.partyName : '';
    const flagName = flagDisplay.flagDetail.name ? flagDisplay.flagDetail.name : '';
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
        : null
    });
  }

  private validateSelection(): void {
    this.manageCaseFlagSelectedErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(this.selectedControlName).value) {
      this.manageCaseFlagSelectedErrorMessage = SelectManageCaseFlagErrorMessage.MANAGE_CASE_FLAG_NOT_SELECTED;
      this.errorMessages.push({
        title: '',
        description: SelectManageCaseFlagErrorMessage.MANAGE_CASE_FLAG_NOT_SELECTED,
        fieldId: 'conditional-radios-list'
      });
    }
  }

  private onCaseFlagsConfigError(): void {
    // Set error flag on component to remove the "Next" button (user cannot proceed with flag creation)
    this.caseFlagsConfigError = true;
    this.errorMessages = [];
    this.errorMessages.push(
      { title: '', description: SelectManageCaseFlagErrorMessage.MANAGE_CASE_FLAG_NOT_CONFIGURED, fieldId: 'conditional-radios-list'});
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
  }
}
