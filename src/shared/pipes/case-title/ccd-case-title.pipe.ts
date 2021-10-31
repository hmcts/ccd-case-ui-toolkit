import { Pipe, PipeTransform } from '@angular/core';
import { PlaceholderService } from '../../directives/substitutor/services/placeholder.service';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';

@Pipe({
  name: 'ccdCaseTitle'
})
export class CcdCaseTitlePipe implements PipeTransform {
  constructor(private placeholderService: PlaceholderService, private fieldsUtils: FieldsUtils) {
  }
  transform(caseTitle: string, caseFields: CaseField[], values: any): any {
    const caseFieldValues = this.getReadOnlyAndFormFields(values, caseFields);
    const result = this.placeholderService.resolvePlaceholders(caseFieldValues, caseTitle);
    return result;
  }

  private getReadOnlyAndFormFields(formGroup, caseFields: CaseField[]): any {
    return this.fieldsUtils.mergeLabelCaseFieldsAndFormFields(caseFields, formGroup.getRawValue());
  }

}
