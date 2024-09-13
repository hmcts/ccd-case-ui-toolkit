import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-text-area-field',
  template: `<span class="text-16" style="white-space: pre-wrap">{{caseField.value | rpxTranslate}}</span>`
})
export class ReadTextAreaFieldComponent extends AbstractFieldReadComponent {}
