import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  public errorMessages: ErrorMessage[];
  public flagLocationNotSelectedErrorMessage: SelectFlagLocationErrorMessage;
  public filteredFlagsData: Flags[];
  public readonly selectedLocationControlName = 'selectedLocation';
  public nextClicked = false;

  public ngOnInit(): void {
    this.flagLocationTitle = CaseFlagWizardStepTitle.SELECT_FLAG_LOCATION;
    this.flagLocationNotSelectedErrorMessage = SelectFlagLocationErrorMessage.FLAG_LOCATION_NOT_SELECTED;

    // Filter out any flags instances that don't have a party name
    if (this.flagsData) {
      this.filteredFlagsData = this.flagsData.filter(f => f.partyName != null);
    }

    // Add a FormControl for the selected flag location if there is at least one flags instance remaining after filtering
    if (this.filteredFlagsData) {
      this.formGroup.addControl(this.selectedLocationControlName, new FormControl(null, Validators.required));
    }
  }

  public onChange(): void {
    this.nextClicked = false;
    // Need to clear error messages (for now) because the error message summary in the parent component isn't checking
    // the validity of the FormGroup used by its children... although this isn't being emitted to the parent!
    // TODO Change parent component to check FormGroup validity instead of error messages array length
    this.errorMessages = [];
  }

  public onNext(): void {
    this.nextClicked = true;
    this.errorMessages = [];
    if (this.formGroup.get(this.selectedLocationControlName).invalid) {
      this.errorMessages.push({
        title: '',
        description: SelectFlagLocationErrorMessage.FLAG_LOCATION_NOT_SELECTED,
        fieldId: 'conditional-radios-list'
      });
    }
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LOCATION, errorMessages: this.errorMessages });
  }
}
