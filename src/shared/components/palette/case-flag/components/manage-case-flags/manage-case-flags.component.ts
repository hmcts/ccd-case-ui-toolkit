import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagDetail, Flags } from '../../domain';
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
  public filteredFlagsData: { partyName: string, association: string, comment: string, flagCode: string } [] = [];
  public caseFlagsConfigError = false;
  public readonly selectedControlName = 'selectedManageCaseLocation';

  public ngOnInit(): void {
    this.manageCaseFlagTitle = CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS;

    // Filter out any flags instances that don't have a party name
    if (this.flagsData) {
      this.filteredFlagsData = this.flagsData.reduce((flagsData, flagData) => {
        const result = flagData.details ? flagData.details.map(detail =>  this.flagDetailDisplay(detail, flagData.partyName)) : [];
        if (result.length) {
          return result;
        }
        return flagsData;
      }, []) as { partyName: string, association: string, comment: string, flagCode: string }[];
    }

    // Add a FormControl for the selected case flag if there is at least one flags instance remaining after filtering
    if (this.filteredFlagsData && this.filteredFlagsData.length > 0) {
      this.formGroup.addControl(this.selectedControlName, new FormControl(null));
    } else {
      // No filtered flags instances mean there are no parties to select from. The case has not been configured properly
      // for case flags and the user cannot proceed with flag creation. (Will need to be extended to check for case-level
      // flags in future)
      this.onCaseFlagsConfigError();
    }
  }

  public flagDetailDisplay(flagDetail: FlagDetail, partyName):
  { partyName: string, association: string, comment: string, flagCode: string } {
    return {
      partyName,
      association: flagDetail.name ? flagDetail.name : '',
      comment: flagDetail.flagComment ? flagDetail.flagComment : '',
      flagCode: flagDetail.flagCode ?  flagDetail.flagCode : '',
    };
  }

  public processLabel(flagDetail: { partyName: string, association: string, comment: string, flagCode }): string {
    const name = flagDetail.partyName ? flagDetail.partyName : '';
    const association = flagDetail.association ? flagDetail.association : '';
    const comment = flagDetail.comment ? flagDetail.comment : '';
    return `${name} - ${association}, ${comment}`;
  }

  public onNext(): void {
    // Validate flag location selection
    this.validateSelection();
    if (this.formGroup.controls.selectedManageCaseLocation && this.formGroup.controls.selectedManageCaseLocation.value) {
      const selectedFlagDetail = this.flagsData.reduce((flags, flag) => {
        const resultDetails = flag.details.filter(detail => detail.flagCode === this.formGroup.controls.selectedManageCaseLocation.value);
        if (resultDetails.length) {
          return resultDetails[0];
        }
        return flags;
      }, []) as FlagDetail;
      this.caseFlagStateEmitter.emit({
        currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
        errorMessages: this.errorMessages,
        selectedFlagDetail
      });
    }
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
