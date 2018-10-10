import { Component, Input } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { CaseField } from '../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-label-field',
  templateUrl: './label-field.html'
})
export class LabelFieldComponent extends AbstractFieldReadComponent {
  @Input()
  eventFields: CaseField[] = [];
}
