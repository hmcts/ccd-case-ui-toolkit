import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition';
import { WizardPage } from '../../case-editor/domain';

@Pipe({
  name: 'ccdPageFields'
})
export class CcdPageFieldsPipe implements PipeTransform {

  transform(page: WizardPage, dataFormGroup: FormGroup): CaseField {
    const complex_fields: CaseField[] = Object.keys(dataFormGroup.controls).map(key => {
      const control: AbstractControl = dataFormGroup.controls[key];
      return control['caseField'] as CaseField;
    }).filter(field => {
      return !!page.case_fields.find(pcf => pcf.id === field.id);
    });
    const rawValue: any = dataFormGroup.value;
    const value: any = page.case_fields.reduce((acc: any, field: CaseField) => {
      const fieldValue: any = rawValue[field.id] || field.value;
      return {...acc, [field.id]: fieldValue};
    }, {})
    return plainToClassFromExist(new CaseField(), {
      id: page.id,
      label: page.label,
      display_context: 'READONLY',
      value,
      field_type: {
        id: page.id,
        type: 'Complex',
        complex_fields
      }
    });
  }

}
