import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  template: `<span style="white-space: pre-wrap">{{caseField.value}}</span>`
})
export class ReadTextAreaFieldComponent extends AbstractFieldReadComponent {}
