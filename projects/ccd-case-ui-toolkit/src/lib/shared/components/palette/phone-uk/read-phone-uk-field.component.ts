import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-phone-uk-field',
  template: `<span class="text-16">{{caseField.value}}</span>`
})
export class ReadPhoneUKFieldComponent extends AbstractFieldReadComponent {}
