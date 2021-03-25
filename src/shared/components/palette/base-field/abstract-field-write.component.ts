import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain';
import { FormValidatorsService } from '../../../services';
import { AbstractFormFieldComponent } from './abstract-form-field.component';

export abstract class AbstractFieldWriteComponent extends AbstractFormFieldComponent implements OnChanges {

  @Input()
  isExpanded = false;

  @Input()
  idPrefix = '';

  public id() {
    return this.idPrefix + this.caseField.id;
  }

  public constructor() {
    super();
    this.fixCaseField();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['caseField'];
    if (change) {
      let cfNew = change.currentValue;
      if (!(cfNew instanceof CaseField)) {
        this.fixCaseField();
      }
    }
  }

  protected addValidators(caseField: CaseField, control: AbstractControl): void {
    FormValidatorsService.addValidators(caseField, control);
  }

  private fixCaseField() {
    if (this.caseField && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
  }
}
