import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-fixed-list-field',
  template: '<span class="text-16">{{caseField.value | ccdFixedList:caseField.items}}</span>',
})
export class ReadFixedListFieldComponent extends AbstractFieldReadComponent {
}
