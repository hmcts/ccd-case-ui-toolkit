import { Input } from '@angular/core';
import { AbstractFormFieldComponent } from './abstract-form-field.component';

export abstract class AbstractFieldWriteComponent extends AbstractFormFieldComponent {

  @Input()
  isExpanded = false;

  @Input()
  idPrefix = '';

  public id() {
    return this.idPrefix + this.caseField.id;
  }

  createElementId(elementId: string): string {
    return `${this.id()}_${elementId}`;
  }
}
