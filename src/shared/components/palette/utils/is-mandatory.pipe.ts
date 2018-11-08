import { Pipe, PipeTransform } from '@angular/core';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { CaseField } from '../../../domain/definition/case-field.model';

@Pipe({
  name: 'ccdIsMandatory'
})
export class IsMandatoryPipe implements PipeTransform {

  constructor(private  caseFieldService: CaseFieldService) {};

  transform(field: CaseField): boolean {
    return this.caseFieldService.isMandatory(field);
  }
}
