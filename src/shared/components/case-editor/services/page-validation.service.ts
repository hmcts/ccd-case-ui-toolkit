import { Injectable } from '@angular/core';
import { WizardPage } from '../domain/wizard-page.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable()
export class PageValidationService {
  constructor(private caseFieldService: CaseFieldService) {}

  isPageValid(page: WizardPage, editForm: FormGroup): boolean {
    return page.case_fields
      .filter(caseField => !this.caseFieldService.isReadOnly(caseField))
      .filter(caseField => !this.isHidden(caseField, editForm.getRawValue()))
      .every(caseField => {
        let theControl = editForm.controls['data'].get(caseField.id);
        return this.checkDocumentField(caseField)
          && (this.caseFieldService.isOptional(caseField) || this.checkFormValidity(theControl));
      });
  }

  private checkDocumentField(caseField: CaseField): boolean {
    if (caseField.field_type.id !== 'Document') {
      return true;
    }

    return !this.caseFieldService.isMandatory(caseField);
  }

  private isHidden(caseField, formFields) {
    let condition = new ShowCondition(caseField.show_condition);
    return !condition.match(formFields.data);
  }

  private checkFormValidity(theControl: AbstractControl): boolean {
    return theControl != null && (theControl.valid || theControl.disabled);
  }
}
