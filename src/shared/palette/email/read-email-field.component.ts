import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-email-field',
  template: `
    <a *ngIf="!isFieldValueEmpty()" href=\"mailto:{{caseField.value}}\">{{caseField.value}}</a>
  `
})
export class ReadEmailFieldComponent extends AbstractFieldReadComponent {

  isFieldValueEmpty(): boolean {
    return (!this.caseField.value);
  }

}
