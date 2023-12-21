import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-fixed-radio-list-field',
  template: '<span class="text-16">{{caseField.value | ccdFixedRadioList:caseField.field_type.fixed_list_items}}</span>',
})
export class ReadFixedRadioListFieldComponent extends AbstractFieldReadComponent { }
