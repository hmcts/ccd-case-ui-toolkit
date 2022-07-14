import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-fixed-list-field',
  template: '<span class="text-16">{{caseField.value | ccdFixedList:caseField.list_items}}</span>',
})
export class ReadFixedListFieldComponent extends AbstractFieldReadComponent {

}
