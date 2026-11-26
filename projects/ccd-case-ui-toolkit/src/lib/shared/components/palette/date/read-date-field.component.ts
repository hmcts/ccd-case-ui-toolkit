import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-date-field',
  template: `<span class="text-16">{{caseField.value | ccdDate:'utc':caseField.dateTimeDisplayFormat}}</span>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ReadDateFieldComponent extends AbstractFieldReadComponent {
  public timeZone = 'utc';
}
