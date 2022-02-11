import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../..';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseFlagState } from './domain';
import { CaseFlagFieldState } from './enums';

@Component({
  selector: 'ccd-write-case-flag-field',
  templateUrl: './write-case-flag-field.component.html',
	styleUrls: ['./write-case-flag-field.component.scss']
})
export class WriteCaseFlagFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public formGroup: FormGroup;
  public fieldState: number;
  public caseFlagFieldState = CaseFlagFieldState;
  public errorMessages: ErrorMessage[] = [];

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.registerControl(new FormGroup({}, {
      validators: (_: AbstractControl): {[key: string]: boolean} | null => {
        if (!this.isAtFinalState()) {
          // Return an error to mark the FormGroup as invalid if not at the final state
          return {notAtFinalState: true};
        }
        return null;
      }
    }), true) as FormGroup;
    // Set starting field state
    this.fieldState = CaseFlagFieldState.FLAG_TYPE;
  }

  public onCaseFlagStateEmitted(caseFlagState: CaseFlagState): void {
		console.log('FORM GROUP', this.formGroup.value);
    console.log('Case Flag State', caseFlagState);
    this.errorMessages = caseFlagState.errorMessages;
    if (this.errorMessages.length === 0) {
      // Validation succeeded, can proceed to next state
      this.proceedToNextState();
    }
  }

  public proceedToNextState(): void {
    if (!this.isAtFinalState()) {
      this.fieldState++;
    }

    // Deliberately not part of an if...else statement with the above because validation needs to be triggered as soon as
    // the form is at the final state
    if (this.isAtFinalState()) {
      // Trigger validation to clear the "notAtFinalState" error if now at the final state
      this.formGroup.updateValueAndValidity();
    }
  }

  public isAtFinalState(): boolean {
    // The filter removes the non-numeric keys emitted due to how TypeScript enums are transpiled (see
    // https://www.crojach.com/blog/2019/2/6/getting-enum-keys-in-typescript for an explanation)
    return this.fieldState === Object.keys(CaseFlagFieldState).filter(key => parseInt(key, 10) >= 0).length - 1;
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
}
