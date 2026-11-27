import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-text-area-field',
  template: `<span class="text-area-value">{{ caseField.value }}</span>`,
  styleUrls: ['./read-text-area-field.component.scss'],
  standalone: false
})
export class ReadTextAreaFieldComponent extends AbstractFieldReadComponent {}
