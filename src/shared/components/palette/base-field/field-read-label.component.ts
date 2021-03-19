import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractFormFieldComponent } from './abstract-form-field.component';
import { AbstractFieldReadComponent } from './abstract-field-read.component';

@Component({
  selector: 'ccd-field-read-label',
  templateUrl: './field-read-label.html',
  styleUrls: [
    './field-read-label.scss'
  ]
})
export class FieldReadLabelComponent extends AbstractFieldReadComponent implements OnChanges {

  // EUI-3267. Flag for whether or not this can have a grey bar.
  public canHaveGreyBar = false;

  @Input()
  withLabel: boolean;

  public isLabel(): boolean {
    return this.caseField.field_type && this.caseField.field_type.type === 'Label';
  }

  public isComplex(): boolean {
    return this.caseField.isComplex();
  }

  public isCaseLink(): boolean {
    return this.caseField.isCaseLink();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['caseField'];
    if (change) {
      let cfNew = change.currentValue;
      if (!(cfNew instanceof CaseField)) {
        this.fixCaseField();
      }

      // EUI-3267.
      // Set up the flag for whether this can have a grey bar.
      this.canHaveGreyBar = !!this.caseField.show_condition;
    }
  }

  private fixCaseField() {
    if (this.caseField && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
  }
}
