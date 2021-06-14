import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain';

@Pipe({
  name: 'ccdCYAPageLabelFilter'
})
export class CcdCYAPageLabelFilterPipe implements PipeTransform {

  public transform(caseFields: CaseField[]): CaseField[] {
    return caseFields.map((caseField: CaseField) => {

      if (caseField.field_type.complex_fields && caseField.field_type.complex_fields.length) {
        caseField.field_type.complex_fields = this.getNonLabelComplexFieldType(caseField.field_type.complex_fields);
      }

      return caseField;
    });
  }

  private getNonLabelComplexFieldType = (complexFields: CaseField[]): CaseField[] =>
    complexFields.filter((caseField: CaseField) => caseField.field_type.type !== 'Label');
}
