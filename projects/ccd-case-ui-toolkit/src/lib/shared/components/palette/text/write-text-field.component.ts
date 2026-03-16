import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-text-field',
  templateUrl: './write-text-field.html',
  standalone: false
})
export class WriteTextFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public textControl: FormControl;

  public ngOnInit() {
    console.log('Initializing WriteTextFieldComponent with caseField: ', this.caseField);
    
    this.textControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
    // Apply default validators driven by CaseField metadata
    this.addValidators(this.caseField, this.textControl);

    // Example: add specific validation for a set of CaseField ids.
    // Add any additional ids to the array to apply the same validation.
    const validationTargetIds = ['individualFirstName', 'individualLastName', 'applicant1_individualFirstName', 
      'applicant2_individualFirstName', 'applicant1_individualLastName', 'applicant2_individualLastName', 'applicant1_soleTraderTradingAs', 'applicant2_soleTraderTradingAs'];

    if (this.caseField?.id && validationTargetIds.includes(this.caseField.id)) {
      // Allow letters, spaces, apostrophes and hyphens; limit to 100 chars
      this.textControl.addValidators([
        Validators.pattern(/^[A-Za-z\s'\-]+$/),
        Validators.maxLength(100)
      ]);
      this.textControl.updateValueAndValidity();
    }
    console.log('Text field initialized with value: ', this.caseField.value);
    console.log('FormControl value: ', this.textControl.value);
  }

  public onBlur($event) {
    $event.target.value = $event.target.value.trim();
  }
}
