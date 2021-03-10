import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-dynamic-multi-select-list-field',
  templateUrl: './read-dynamic-multi-select-list-field.html',
  styleUrls: ['./read-dynamic-multi-select-list-field.component.scss']
})
export class ReadDynamicMultiSelectListFieldComponent extends AbstractFieldReadComponent {}
