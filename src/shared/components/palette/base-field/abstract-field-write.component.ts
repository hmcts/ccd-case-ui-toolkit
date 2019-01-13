import { Input } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractControl } from '@angular/forms';

export class AbstractFieldWriteComponent {
  @Input()
  caseField: CaseField;

  @Input()
  isExpanded = false;

  @Input()
  registerControl: <T extends AbstractControl> (control: T) => T;

  @Input()
  idPrefix = '';

  @Input()
  mask: any = false;

  public id() {
    return this.idPrefix + this.caseField.id;
  }
}
