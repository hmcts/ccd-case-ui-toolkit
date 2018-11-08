import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-phone-uk-field',
  template: `{{caseField.value}}`
})
export class ReadPhoneUKFieldComponent extends AbstractFieldReadComponent {}
