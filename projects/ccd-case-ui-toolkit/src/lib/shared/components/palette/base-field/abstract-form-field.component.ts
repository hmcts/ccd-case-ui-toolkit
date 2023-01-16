import { Directive, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';


type FormContainer = FormGroup | FormArray;

@Directive()
export abstract class AbstractFormFieldComponent {
  @Input()
  public caseField: CaseField;

  @Input()
  public formGroup: FormGroup;

  @Input()
  public parent?: FormContainer;

  @Input()
  public idPrefix = '';

  public id() {
    return this.idPrefix + this.caseField.id;
  }

  protected registerControl<T extends AbstractControl>(control: T, replace = false): AbstractControl {
    const container: FormContainer = this.parent || this.formGroup;
    if (!container) {
      return control;
    }
    const existing = container.controls[this.caseField.id];
    if (existing) {
      if (replace) {
        // Set the validators on the replacement with what already exists.
        control.setValidators(existing.validator);
      } else {
        return existing;
      }
    }
    this.addValidators(this.caseField, control);
    FieldsUtils.addCaseFieldAndComponentReferences(control, this.caseField, this);
    return this.addControlToParent(control, container, replace);
  }

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    // No validators by default, override this method to add validators to the form control
  }

  private addControlToParent(control: AbstractControl, parent: FormContainer, replace: boolean): AbstractControl {
    if (parent instanceof FormArray) {
      return this.addControlToFormArray(control, parent, replace);
    }
    return this.addControlToFormGroup(control, parent, replace);
  }

  private addControlToFormArray(control: AbstractControl, parent: FormArray, replace: boolean): AbstractControl {
    const index = parseInt(this.caseField.id, 10);
    if (replace && !isNaN(index)) {
      parent.setControl(index, control);
    } else {
      parent.push(control);
    }
    return control;
  }

  private addControlToFormGroup(control: AbstractControl, parent: FormGroup, replace: boolean): AbstractControl {
    if (!replace) {
      parent.addControl(this.caseField.id, control);
      return control;
    }
    if (this.caseField.field_type && this.caseField.field_type.id === 'CaseLink'
        && this.caseField.field_type.type === 'Complex'
        && this.caseField.field_type.complex_fields.some(cf => cf.id === 'CaseReference')
        && this.caseField.id !== 'caseLinks') {
      parent.setControl('CaseReference', control['controls']['CaseReference']);
    } else {
      parent.setControl(this.caseField.id, control);
    }
    return control;
  }
}
