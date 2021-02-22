import { Injectable } from '@angular/core';
import { WizardPage } from '../domain/wizard-page.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { LogService } from '../../../services/logging/log.service';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable()
export class PageValidationService {
  constructor(private caseFieldService: CaseFieldService, private logger: LogService) {}

  isPageValid(page: WizardPage, editForm: FormGroup): boolean {
    return page.case_fields
      .filter(caseField => !this.caseFieldService.isReadOnly(caseField))
      .filter(caseField => !this.isHidden(caseField, editForm.getRawValue()))
      .every(caseField => {
        this.logger.debug(caseField.id, 'Validating for field => ' + caseField.id);
        let theControl = editForm.controls['data'].get(caseField.id);
        let result = this.checkDocumentField(caseField, theControl) && this.checkOptionalField(caseField, theControl);
        this.logger.debug(caseField.id, 'Page validation result => ' + result);
        return result;
      });
  }

  private checkDocumentField(caseField: CaseField, theControl: AbstractControl): boolean {
    this.logger.debug(caseField.id, 'Checking document field for field_type => ' + caseField.field_type.id);

    if (caseField.field_type.id !== 'Document') {
      return true;
    }
    return !(this.checkMandatoryField(caseField, theControl));
  }

  private isHidden(caseField, formFields) {
    let condition = new ShowCondition(caseField.show_condition);
    this.logger.debug(caseField.id, 'isHidden for field_type => ' + caseField.field_type.id
      + ', condition => ' + caseField.show_condition + ', formFields data => ' + formFields.data);
    return !condition.match(formFields.data);
  }

  private checkOptionalField(caseField: CaseField, theControl: AbstractControl): boolean {
    this.logger.debug(caseField.id, 'theControl => ' + theControl);

    if (theControl !== null && theControl !== undefined) {
      this.logger.debug(caseField.id, 'isControlValid => ' + theControl.valid
        + ', isControlDisabled => ' + theControl.disabled + ', checkOptionalField result => '
        + ((!theControl && this.caseFieldService.isOptional(caseField)) || theControl.valid || theControl.disabled));
    }

    return (!theControl && this.caseFieldService.isOptional(caseField)) || theControl.valid || theControl.disabled;
  }

  private checkMandatoryField(caseField: CaseField, theControl: AbstractControl): boolean {
    this.logger.debug(caseField.id, 'theControl => ' + theControl + ', checkMandatoryField result => '
      + (this.caseFieldService.isMandatory(caseField) && theControl === null));
    return this.caseFieldService.isMandatory(caseField) && theControl === null;
  }
}
