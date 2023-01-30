import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';
import { CaseField } from '../../../domain/definition/case-field.model';

import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { AbstractFormFieldComponent } from './abstract-form-field.component';

@Directive()
export abstract class AbstractFieldWriteComponent extends AbstractFormFieldComponent implements OnChanges {

  @Input()
  public isExpanded = false;

  @Input()
  public isInSearchBlock = false;

  public constructor() {
    super();
    this.fixCaseField();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['caseField'];
    if (change) {
      const cfNew = change.currentValue;
      if (!(cfNew instanceof CaseField)) {
        this.fixCaseField();
      }
    }
  }

  public createElementId(elementId: string): string {
    return `${this.id()}_${elementId}`;
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
