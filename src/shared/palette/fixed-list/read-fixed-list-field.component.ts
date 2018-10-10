import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-fixed-list-field',
  template: '{{caseField.value | ccdFixedList:caseField.field_type.fixed_list_items}}',
})
export class ReadFixedListFieldComponent extends AbstractFieldReadComponent {}
