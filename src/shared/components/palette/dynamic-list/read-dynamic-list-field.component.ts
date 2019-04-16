import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-dynamic-list-field',
  template: '<span class="text-16">{{caseField.value | ccdDynamicList:caseField.field_type.dynamic_list_items}}</span>',
})
export class ReadDynamicListFieldComponent extends AbstractFieldReadComponent {}
