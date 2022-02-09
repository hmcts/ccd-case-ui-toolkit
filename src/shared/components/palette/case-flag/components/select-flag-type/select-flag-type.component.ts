import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseFlagFieldState } from '../..';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagType } from '../../domain';

@Component({
  selector: 'ccd-select-flag-type',
  templateUrl: './select-flag-type.component.html',
  styleUrls: ['./select-flag-type.component.scss']
})
export class SelectFlagTypeComponent implements OnInit {

  @Input()
  public formGroup: FormGroup;
  
  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public flagTypes: FlagType[];
  public flagTypeSelected: string;
  public submitted = false;
  public errorMessages: ErrorMessage[];
  
  public ngOnInit(): void {
    this.flagTypes = this.getFlagTypes();
    this.flagTypes.forEach(flagType => {
      this.formGroup.addControl(flagType.id, new FormControl(''));
    });
    this.formGroup.addControl('otherFlagTypeDescription', new FormControl('', Validators.required));
  }

  public onFlagTypeChanged(event: any): void {
    this.flagTypeSelected = event.target.value;
  }

  public onNext(): void {
    this.submitted = true;
    this.errorMessages = [];
    this.formGroup.updateValueAndValidity();
    // Validate form
    this.validateForm();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }

  private validateForm(): boolean {
    if (!this.flagTypeSelected) {
      this.errorMessages.push({title: '', description: 'Please select a flag type', fieldId: ''})
      return false;
    }
    if (this.flagTypeSelected === 'other') {
      const otherFlagTypeDescription = this.formGroup.controls['otherFlagTypeDescription'].value;
      if (!otherFlagTypeDescription) {
        this.errorMessages.push({title: '', description: 'Please enter a flag type', fieldId: 'conditional-flag-type-other'});
        return false;
      }
      if (otherFlagTypeDescription.length > 80) {
        this.errorMessages.push({title: '', description: 'You can enter up to 80 characters only', fieldId: 'conditional-flag-type-other'});
        return false;
      }
    }

    return true;
  }

  private getFlagTypes(): FlagType[] {
    // TODO: Get the list of flag types using the API call in future sprints
    return [
      {id: 'urgent-case', name: 'Urgent case'},
      {id: 'vulnerable-user', name: 'Vulnerable user'},
      {id: 'other', name: 'Other'}
    ];
  }
}
