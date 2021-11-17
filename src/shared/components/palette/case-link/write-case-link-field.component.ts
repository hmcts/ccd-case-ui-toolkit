import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';

import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';

@Component({
  selector: 'ccd-write-case-link-field',
  templateUrl: 'write-case-link-field.html'
})
export class WriteCaseLinkFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  caseReferenceControl: AbstractControl;
  caseLinkGroup: FormGroup;

  @ViewChild('writeComplexFieldComponent')
  writeComplexFieldComponent: WriteComplexFieldComponent;

  public ngOnInit(): void {
    if (this.caseField.value) {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(this.caseField.value.CaseReference),
      }), true) as FormGroup;
    } else {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(),
      }), true) as FormGroup;
    }
    this.caseReferenceControl = this.caseLinkGroup.controls['CaseReference'];
    this.caseReferenceControl.setValidators(this.caseReferenceValidator());

    // Ensure that all sub-fields inherit the same value for retain_hidden_value as this parent; although a CaseLink
    // field uses the Complex type, it is meant to be treated as one field
    if (this.caseField && this.caseField.field_type.type === 'Complex') {
      for (const caseLinkSubField of this.caseField.field_type.complex_fields) {
        caseLinkSubField.retain_hidden_value = this.caseField.retain_hidden_value;
      }
    }
  }

  private caseReferenceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value) {
        if ( this.validCaseReference(control.value) ) {
          return null;
        }
        return {'error': 'Please use a valid 16 Digit Case Reference'};
      }
      return null;
    };
  }

  validCaseReference(valueString: string): boolean {
    if (!valueString )  {
      return false;
    }
    return new RegExp('^\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b$').test(valueString.trim());
  }
}
