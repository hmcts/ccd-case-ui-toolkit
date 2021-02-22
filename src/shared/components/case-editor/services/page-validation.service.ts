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
        this.logger.log(caseField);
        let theControl = editForm.controls['data'].get(caseField.id);
        this.logger.log(theControl);
        let result = this.checkDocumentField(caseField, theControl) && this.checkOptionalField(caseField, theControl);
        this.logger.log('Page validation result => ' + result);
        return result;
      });
  }

  private checkDocumentField(caseField: CaseField, theControl: AbstractControl): boolean {
    if (caseField.field_type.id !== 'Document') {
      this.logger.log('checkDocumentField result => true');
      return true;
    }

    let result = !(this.checkMandatoryField(caseField, theControl));
    this.logger.log('checkDocumentField result => ' + result);
    return result;
  }

  private isHidden(caseField, formFields) {
    let condition = new ShowCondition(caseField.show_condition);
    let result = !condition.match(formFields.data);

    this.logger.log('isHidden result => ' + result);
    return result;
  }

  private checkOptionalField(caseField: CaseField, theControl: AbstractControl): boolean {
    if (theControl) {
      this.logger.log('isControlValid => ' + theControl.valid + ', isControlDisabled => ' +
        theControl.disabled);
    }

    let result = ((!theControl && this.caseFieldService.isOptional(caseField)) || theControl.valid || theControl.disabled);
    this.logger.log('checkOptionalField result => ' + result);
    return result;
  }

  private checkMandatoryField(caseField: CaseField, theControl: AbstractControl): boolean {
    let result = (this.caseFieldService.isMandatory(caseField) && theControl === null);
    this.logger.log('checkMandatoryField result => ' + result);
    return result;
  }
}
