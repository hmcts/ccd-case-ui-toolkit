import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';

@Injectable()
export class CaseFieldService {

  public isOptional (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }
    return field.display_context.toUpperCase() === 'OPTIONAL';
  }

  public isReadOnly (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }
    return field.display_context.toUpperCase() === 'READONLY';
  }

  public isMandatory (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }
    return field.display_context.toUpperCase() === 'MANDATORY';
  }
}
