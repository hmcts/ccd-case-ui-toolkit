import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-date-field',
  template: `<span class="text-16">{{caseField.value | ccdDate:timeZone:caseField.dateTimeDisplayFormat}}</span>`
})
export class ReadDateFieldComponent extends AbstractFieldReadComponent implements OnInit{
  public timeZone = 'utc';

  public ngOnInit(): void {
    super.ngOnInit();
    if (this.caseField?.field_type.id === 'DateTime') {
      this.timeZone = 'local';
    }
  }
}
