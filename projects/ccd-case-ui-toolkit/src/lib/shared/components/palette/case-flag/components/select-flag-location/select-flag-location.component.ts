import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorMessage, Journey } from '../../../../../domain';
import { CaseFlagState, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagLocationErrorMessage } from '../../enums';
import { AbstractJourneyComponent } from '../../../base-field/abstract-journey.component';

@Component({
  selector: 'ccd-select-flag-location',
  templateUrl: './select-flag-location.component.html',
  standalone: false
})
export class SelectFlagLocationComponent extends AbstractJourneyComponent implements OnInit, Journey {
  @Input() public formGroup: FormGroup;
  @Input() public flagsData: FlagsWithFormGroupPath[];
  @Input() public isDisplayContextParameterExternal = false;

  @Output() public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public flagLocationTitle: CaseFlagWizardStepTitle;
  public errorMessages: ErrorMessage[] = [];
  public flagLocationNotSelectedErrorMessage: SelectFlagLocationErrorMessage = null;
  public filteredFlagsData: FlagsWithFormGroupPath[];
  public cachedLocation: string;
  public caseFlagsConfigError = false;
  public readonly selectedLocationControlName = 'selectedLocation';
  public readonly caseLevelFlagLabel = 'Case level';
  private readonly caseLevelCaseFlagsFieldId = 'caseFlags';

  public ngOnInit(): void {
    if (this.formGroup.get(this.selectedLocationControlName)) {
      this.cachedLocation = this.formGroup.get(this.selectedLocationControlName).value?.pathToFlagsFormGroup;
    }
    this.flagLocationTitle = this.isDisplayContextParameterExternal ?
      CaseFlagWizardStepTitle.SELECT_FLAG_LOCATION_EXTERNAL : CaseFlagWizardStepTitle.SELECT_FLAG_LOCATION;

    // Filter out any flags instances that don't have a party name, unless the instance is for case-level flags (this
    // is expected not to have a party name)
    // Also de-duplicate flags instances where the groupId, if present, is the same
    if (this.flagsData) {
      this.filteredFlagsData =
        this.flagsData
        .filter((f) => f.flags.partyName !== null || f.pathToFlagsFormGroup === this.caseLevelCaseFlagsFieldId)
        .filter((value, index, partyLevelFlags) => !value.flags.groupId
          ? value
          : partyLevelFlags.findIndex((p) => p.flags.groupId === value.flags.groupId) === index);
    }
    // Add a FormControl for the selected flag location if there is at least one flags instance remaining after filtering
    if (this.filteredFlagsData && this.filteredFlagsData.length > 0) {
      const formControl = this.formGroup.get(this.selectedLocationControlName);

      if (!formControl) {
        this.formGroup.addControl(this.selectedLocationControlName, new FormControl(null));
      } else {
        // Needs to be setValue as they have different object references -- we use the pathToFlagsFormGroup key
        formControl.setValue(
          this.filteredFlagsData.find(item => item.pathToFlagsFormGroup === formControl.value?.pathToFlagsFormGroup)
        );
      }
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
    //check if the user has changed their location selection
    if (this.cachedLocation !== this.formGroup.get(this.selectedLocationControlName)?.value?.pathToFlagsFormGroup) {
      Object.keys(this.formGroup.controls).forEach((controlName) => {
        if (controlName !== this.selectedLocationControlName) {
          this.formGroup.removeControl(controlName);
        }
      });
    }
    // Return case flag field state, error messages, and selected FlagsWithFormGroupPath instance (i.e. flag location) to
    // the parent
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LOCATION,
      errorMessages: this.errorMessages,
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
      { title: '', description: SelectFlagLocationErrorMessage.FLAGS_NOT_CONFIGURED, fieldId: 'conditional-radios-list' });
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
  }

  public next() {
    this.onNext();

    if (this.errorMessages.length === 0) {
      super.next();
    }
  }
}
