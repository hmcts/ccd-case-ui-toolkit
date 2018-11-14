import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-date-field',
  template: `{{caseField.value | ccdDate}}`
})
export class ReadDateFieldComponent extends AbstractFieldReadComponent {}
