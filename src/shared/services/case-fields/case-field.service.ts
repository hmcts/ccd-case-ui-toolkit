import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { LogService } from '../logging/log.service';

@Injectable()
export class CaseFieldService {
  constructor(private logger: LogService) {}

  public isOptional (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }

    let result = (field.display_context.toUpperCase() === 'OPTIONAL');
    this.logger.debug(field.id, 'isOptional result => ' + result);
    return result;
  }

  public isReadOnly (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }

    let result = (field.display_context.toUpperCase() === 'READONLY');
    this.logger.debug(field.id, 'isReadOnly result => ' + result);
    return result;
  }

  public isMandatory (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }

    let result = (field.display_context.toUpperCase() === 'MANDATORY');
    this.logger.debug(field.id, 'isMandatory result => ' + result);
    return result;
  }

  public isLabel (field: CaseField) {
    if (!field || !field.field_type) {
      return false;
    }

    let result = (field.field_type.type === 'Label');
    this.logger.debug(field.id, 'isLabel result => ' + result);
    return result;
  }
}
