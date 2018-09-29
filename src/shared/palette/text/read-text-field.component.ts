import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  template: `{{caseField.value}}`
})
export class ReadTextFieldComponent extends AbstractFieldReadComponent {}
