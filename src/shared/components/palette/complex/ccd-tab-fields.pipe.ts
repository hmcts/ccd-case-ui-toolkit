import { Pipe, PipeTransform } from '@angular/core';
import { CaseTab } from '../../../domain/case-view';
import { CaseField } from '../../../domain/definition';
import { plainToClassFromExist } from 'class-transformer';

@Pipe({
  name: 'ccdTabFields'
})
export class CcdTabFieldsPipe implements PipeTransform {

  transform(tab: CaseTab): CaseField {
    const _value: any = tab.fields.reduce((acc: any, field: CaseField) => {
      return {...acc, [field.id]: field.value};
    }, {})
    return plainToClassFromExist(new CaseField(), {
      id: tab.id,
      label: tab.label,
      display_context: 'READONLY',
      _value,
      field_type: {
        id: tab.id,
        type: 'Complex',
        complex_fields: tab.fields
      }
    });
  }

}
