import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { WizardPage } from '../domain/wizard-page.model';

@Injectable()
export class PageValidationService {
  constructor(private caseFieldService: CaseFieldService) {
  }

  isPageValid(page: WizardPage, editForm: FormGroup): boolean {
    return page.case_fields
      .filter(caseField => !this.caseFieldService.isReadOnly(caseField))
      .filter(caseField => !this.isHidden(caseField, editForm))
      .every(caseField => {
        let theControl = editForm.controls['data'].get(caseField.id);
        console.log('checking control', caseField.id, caseField)
        return this.checkDocumentField(caseField, theControl) && this.checkOptionalField(caseField, theControl);
      });
  }

  private checkDocumentField(caseField: CaseField, theControl: AbstractControl): boolean {
    if (caseField.field_type.id !== 'Document') {
      return true;
    }
    console.log('checking document')
    return !(this.checkMandatoryField(caseField, theControl));
  }

  private isHidden(caseField: CaseField, editForm: FormGroup) {
    const formFields = editForm.getRawValue();
    let condition = ShowCondition.getInstance(caseField.show_condition);
    return !condition.match(formFields.data);
  }

  private checkOptionalField(caseField: CaseField, theControl: AbstractControl): boolean {
    if (!theControl) {
      return this.caseFieldService.isOptional(caseField);
    }
    return theControl.valid || theControl.disabled;
  }

  private checkMandatoryField(caseField: CaseField, theControl: AbstractControl): boolean {
    return this.caseFieldService.isMandatory(caseField) && theControl === null;
  }
}
