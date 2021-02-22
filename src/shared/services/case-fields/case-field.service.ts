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

    this.logger.debug(field.id, 'field label =>' + field.label + ', field type =>' + field.field_type.id
      + ', display_context =>' + field.display_context.toUpperCase());

    return field.display_context.toUpperCase() === 'OPTIONAL';
  }

  public isReadOnly (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }

    this.logger.debug(field.id, 'field label =>' + field.label + ', field type =>' + field.field_type.id
      + ', display_context =>' + field.display_context.toUpperCase());

    return field.display_context.toUpperCase() === 'READONLY';
  }

  public isMandatory (field: CaseField) {
    if (!field || !field.display_context) {
      return false;
    }

    this.logger.debug(field.id, 'field label =>' + field.label + ', field type =>' + field.field_type.id
      + ', display_context =>' + field.display_context.toUpperCase());

    return field.display_context.toUpperCase() === 'MANDATORY';
  }

  public isLabel (field: CaseField) {
    if (!field || !field.field_type) {
      return false;
    }

    this.logger.debug(field.id, 'field label =>' + field.label + ', field type =>' + field.field_type.id
      + ', display_context =>' + field.display_context.toUpperCase());

    return field.field_type.type === 'Label';
  }
}
