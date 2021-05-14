import { Pipe, PipeTransform } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';

import { CaseTab } from '../../../domain/case-view';
import { CaseField } from '../../../domain/definition';

@Pipe({
  name: 'ccdTabFields'
})
export class CcdTabFieldsPipe implements PipeTransform {

  transform(tab: CaseTab): CaseField {
    const value: any = tab.fields.reduce((acc: any, field: CaseField) => {
      return {...acc, [field.id]: field.value};
    }, {})
    return plainToClassFromExist(new CaseField(), {
      id: tab.id,
      label: tab.label,
      display_context: 'READONLY',
      value,
      field_type: {
        id: tab.id,
        type: 'Complex',
        complex_fields: tab.fields
      }
    });
  }

}
