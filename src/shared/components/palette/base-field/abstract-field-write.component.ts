import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractFormFieldComponent } from './abstract-form-field.component';
import { CaseField } from '../../../domain';
import { plainToClassFromExist } from 'class-transformer';

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

  private fixCaseField() {
    if (this.caseField && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
  }
}
