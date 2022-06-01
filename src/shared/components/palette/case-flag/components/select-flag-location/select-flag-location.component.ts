import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, Flags } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagLocationErrorMessage } from '../../enums';

@Component({
  selector: 'ccd-select-flag-location',
  templateUrl: './select-flag-location.component.html'
})
export class SelectFlagLocationComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public flagsData: Flags[];

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public flagLocationTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public flagLocationNotSelectedErrorMessage: SelectFlagLocationErrorMessage = null;
  public filteredFlagsData: Flags[];
  public caseFlagsConfigError = false;
  public readonly selectedLocationControlName = 'selectedLocation';

  public ngOnInit(): void {
    this.flagLocationTitle = CaseFlagWizardStepTitle.SELECT_FLAG_LOCATION;

    // Filter out any flags instances that don't have a party name
    if (this.flagsData) {
      this.filteredFlagsData = this.flagsData.filter(f => f.partyName != null);
    }

    // Add a FormControl for the selected flag location if there is at least one flags instance remaining after filtering
    if (this.filteredFlagsData && this.filteredFlagsData.length > 0) {
      this.formGroup.addControl(this.selectedLocationControlName, new FormControl(null));
    } else {
      // No filtered flags instances mean there are no parties to select from. The case has not been configured properly
      // for case flags and the user cannot proceed with flag creation. (Will need to be extended to check for case-level
      // flags in future)
      this.onCaseFlagsConfigError();
    }
  }

  public onNext(): void {
    // Validate flag location selection
    this.validateSelection();
    // Return case flag field state, error messages, and selected Flags instance (i.e. flag location) to the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LOCATION,
      errorMessages: this.errorMessages,
      selectedFlagsLocation: this.formGroup.get(this.selectedLocationControlName).value
        ? this.formGroup.get(this.selectedLocationControlName).value as Flags
        : null
    });
  }

  private validateSelection(): void {
    this.flagLocationNotSelectedErrorMessage = null;
    this.errorMessages = [];
    if (!this.formGroup.get(this.selectedLocationControlName).value) {
      this.flagLocationNotSelectedErrorMessage = SelectFlagLocationErrorMessage.FLAG_LOCATION_NOT_SELECTED;
      this.errorMessages.push({
        title: '',
        description: SelectFlagLocationErrorMessage.FLAG_LOCATION_NOT_SELECTED,
        fieldId: 'conditional-radios-list'
      });
    }
  }

  private onCaseFlagsConfigError(): void {
    // Set error flag on component to remove the "Next" button (user cannot proceed with flag creation)
    this.caseFlagsConfigError = true;
    this.errorMessages = [];
    this.errorMessages.push(
      {title: '', description: SelectFlagLocationErrorMessage.FLAGS_NOT_CONFIGURED, fieldId: 'conditional-radios-list'});
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
  }
}
