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

  constructor() {
    super();
  }

  ngOnInit() {
    if (this.caseField.value) {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(this.caseField.value.CaseReference),
      }));
    } else {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(),
      }));
    }
    this.caseReferenceControl = this.caseLinkGroup.controls['CaseReference'];
    this.caseReferenceControl.setValidators(this.caseReferenceValidator());
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
