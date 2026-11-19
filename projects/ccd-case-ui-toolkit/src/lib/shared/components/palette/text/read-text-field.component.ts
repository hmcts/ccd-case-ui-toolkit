import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-text-field',
  template: `<span class="text-16">{{ caseField.value }}</span>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ReadTextFieldComponent extends AbstractFieldReadComponent {}
