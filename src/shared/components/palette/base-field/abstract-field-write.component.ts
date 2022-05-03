import { Input, Directive } from '@angular/core';
import { AbstractFormFieldComponent } from './abstract-form-field.component';

@Directive()
export abstract class AbstractFieldWriteComponent extends AbstractFormFieldComponent {

  @Input()
  isExpanded = false;

  @Input()
  idPrefix = '';

  public id() {
    return this.idPrefix + this.caseField.id;
  }
}
