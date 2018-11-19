import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { CaseReferenceValidator } from './case-reference.validator';
import { FormValueService } from '../../../services/form/form-value.service'

@Component({
  selector: 'ccd-write-case-link-field',
  templateUrl: 'write-case-link-field.html'
})
export class WriteCaseLinkFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  caseReferenceControl: AbstractControl;
  caseLinkGroup: FormGroup;

  @ViewChild('writeComplexFieldComponent')
  writeComplexFieldComponent: WriteComplexFieldComponent;

  constructor(private formValueService: FormValueService) {
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
    this.caseReferenceControl.setValidators(CaseReferenceValidator(this.formValueService));
  }
}
