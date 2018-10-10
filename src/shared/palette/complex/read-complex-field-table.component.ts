import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-complex-field-table',
  templateUrl: './read-complex-field-table.html',
  styleUrls: ['./read-complex-field-table.scss']
})
export class ReadComplexFieldTableComponent extends AbstractFieldReadComponent {}
