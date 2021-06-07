import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { plainToClassFromExist } from 'class-transformer';

@Pipe({
  name: 'ccdCollectionTableCaseFieldsFilter'
})
export class CcdCollectionTableCaseFieldsFilterPipe implements PipeTransform {

  transform(objs: { [key: string]: any }[], caseField: CaseField, value: {}): CaseField {
    const fields: CaseField[] = objs.map((obj) => ({
      ...obj.value.caseField,
      type: obj.value.type.type ? obj.value.type.type : obj.value.type
    }));
    return plainToClassFromExist(new CaseField(), {
      id: caseField.id,
      label: caseField.label,
      display_context: 'READONLY',
      value,
      field_type: {
        id: caseField.id,
        type: 'Complex',
        complex_fields: fields,
      }
    });
  }
}
