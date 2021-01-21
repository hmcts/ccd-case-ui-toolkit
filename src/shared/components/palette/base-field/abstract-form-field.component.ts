import { Input } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { FieldsUtils } from '../../../services';

type RegisterFunc = <T extends AbstractControl> (control: T) => T;

export abstract class AbstractFormFieldComponent {
  @Input()
  caseField: CaseField;

  @Input()
  formGroup: FormGroup;

  protected registerControl<T extends AbstractControl>(control: T): AbstractControl {
      FieldsUtils.addCaseFieldAndComponentReferences(control, this.caseField, this)
      if (!this.formGroup) {
        return control;
      }
      if (this.formGroup.controls[this.caseField.id]) {
        return this.formGroup.get(this.caseField.id);
      }
      this.addValidators(this.caseField, control);
      this.formGroup.addControl(this.caseField.id, control);
      return control;
  }

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    // No validators by default, override this method to add validators to the form control
  }
}
