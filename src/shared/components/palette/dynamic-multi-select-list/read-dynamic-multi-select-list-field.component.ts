import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-dynamic-multi-select-list-field',
  templateUrl: './read-dynamic-multi-select-list-field.html',
  styleUrls: ['./multi-select-list.scss']
})
export class ReadDynamicMultiSelectListFieldComponent extends AbstractFieldReadComponent {}
