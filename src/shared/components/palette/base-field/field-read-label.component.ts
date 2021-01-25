import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';

import { CaseField } from '../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-field-read-label',
  templateUrl: './field-read-label.html',
  styleUrls: [
    './field-read-label.scss'
  ]
})
export class FieldReadLabelComponent implements OnChanges {

  @Input()
  caseField: CaseField;

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
    }
  }

  private fixCaseField() {
    if (this.caseField && !(this.caseField instanceof CaseField)) {
      this.caseField = plainToClassFromExist(new CaseField(), this.caseField);
    }
  }
}
