import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-fixed-radio-list-field',
  template: '<span class="text-16">{{caseField.value | ccdFixedRadioList:caseField.field_type.fixed_list_items}}</span>',
})
export class ReadFixedRadioListFieldComponent extends AbstractFieldReadComponent { }
