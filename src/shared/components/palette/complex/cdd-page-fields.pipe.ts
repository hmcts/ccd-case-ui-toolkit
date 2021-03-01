import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { plainToClassFromExist } from 'class-transformer';
import { WizardPage } from '../../case-editor/domain';

@Pipe({
  name: 'ccdPageFields'
})
export class CcdPageFieldsPipe implements PipeTransform {

  transform(tab: WizardPage): CaseField {
    const _value: any = tab.case_fields.reduce((acc: any, field: CaseField) => {
      return {...acc, [field.id]: field.value};
    }, {})
    let caseField = plainToClassFromExist(new CaseField(), {
      id: tab.id,
      label: tab.label,
      display_context: 'READONLY',
      _value,
      field_type: {
        id: tab.id,
        type: 'Complex',
        complex_fields: tab.case_fields
      }
    });
    return caseField;
  }

}
