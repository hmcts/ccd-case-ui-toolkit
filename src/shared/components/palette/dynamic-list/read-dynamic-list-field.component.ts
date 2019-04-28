import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-dynamic-list-field',
  template: '<span *ngIf="caseField.value" class="text-16">{{caseField.value.default.code | ccdDynamicList:caseField.value.dynamic_list_items}}</span>',
})
export class ReadDynamicListFieldComponent extends AbstractFieldReadComponent {}
