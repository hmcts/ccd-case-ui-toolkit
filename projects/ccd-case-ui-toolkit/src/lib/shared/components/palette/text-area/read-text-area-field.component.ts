import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-text-area-field',
  template: `<span style="white-space: pre-wrap">{{ caseField.value }}</span>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ReadTextAreaFieldComponent extends AbstractFieldReadComponent {}
