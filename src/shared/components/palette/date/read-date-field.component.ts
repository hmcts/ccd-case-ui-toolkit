import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-date-field',
  template: `<span class="text-16">{{caseField.value | ccdDate:timeZone:caseField.dateTimeDisplayFormat}}</span>`
})
export class ReadDateFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public timeZone = 'utc';
  ngOnInit() {
    if (this.caseField.value && this.caseField.value.includes('T')) {
      // when the value includes a time separator, stop the value from editing time
      this.timeZone = 'local';
    } else {
      this.timeZone = 'utc';
    }
  }
}
