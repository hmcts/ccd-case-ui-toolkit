import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-number-field',
  template: `{{caseField.value}}`
})
export class ReadNumberFieldComponent extends AbstractFieldReadComponent {}
