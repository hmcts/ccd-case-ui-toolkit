import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-number-field',
  template: `<span class="text-16">{{caseField.value | ccdCaseReference}}</span>`
})
export class ReadNumberFieldComponent extends AbstractFieldReadComponent {}
