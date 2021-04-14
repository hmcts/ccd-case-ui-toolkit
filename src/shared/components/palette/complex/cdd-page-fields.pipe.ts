import { Pipe, PipeTransform } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition';
import { WizardPage } from '../../case-editor/domain';

@Pipe({
  name: 'ccdPageFields'
})
export class CcdPageFieldsPipe implements PipeTransform {

  transform(tab: WizardPage): CaseField {
    const value: any = tab.case_fields.reduce((acc: any, field: CaseField) => {
      return {...acc, [field.id]: field.value};
    }, {})
    let caseField = plainToClassFromExist(new CaseField(), {
      id: tab.id,
      label: tab.label,
      display_context: 'READONLY',
      value,
      field_type: {
        id: tab.id,
        type: 'Complex',
        complex_fields: tab.case_fields
      }
    });
    return caseField;
  }

}
