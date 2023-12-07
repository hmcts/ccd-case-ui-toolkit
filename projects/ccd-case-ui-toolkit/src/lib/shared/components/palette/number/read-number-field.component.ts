import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-number-field',
  template: `<span class="text-16">{{caseField.value | ccdCaseReference}}</span>`
})
export class ReadNumberFieldComponent extends AbstractFieldReadComponent {}
