import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { FieldsUtils } from '../../../services/fields';
import { WizardPage } from '../domain/wizard-page.model';

@Injectable()
export class PageValidationService {
  constructor(private readonly caseFieldService: CaseFieldService) { }

  public getInvalidFields(page: WizardPage, editForm: FormGroup): CaseField[] {
    const failingCaseFields = [];
    page.case_fields
      .filter((caseField) => !this.caseFieldService.isReadOnly(caseField))
      .filter((caseField) => !this.isHidden(caseField, editForm))
      .forEach((caseField) => {
        const theControl = FieldsUtils.isCaseFieldOfType(caseField, ['JudicialUser'])
          ? editForm.controls.data.get(`${caseField.id}_judicialUserControl`)
          : editForm.controls.data.get(caseField.id);
        if (!(this.checkDocumentField(caseField, theControl) && this.checkOptionalField(caseField, theControl))) {
          failingCaseFields.push(caseField);
        }
      });
    return failingCaseFields;
  }

  public isHidden(caseField: CaseField, editForm: FormGroup, path?: string): boolean {
    const formFields = editForm.getRawValue();
    const condition = ShowCondition.getInstance(caseField.show_condition);
    if (path && path.indexOf(`_${caseField.id}_`) === -1) {
      path = `${path}${caseField.id}`;
    }
    return !condition.match(formFields.data, path);
  }

  private checkDocumentField(caseField: CaseField, theControl: AbstractControl): boolean {
    if (caseField.field_type.id !== 'Document') {
      return true;
    }
    return !(this.checkMandatoryField(caseField, theControl));
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
