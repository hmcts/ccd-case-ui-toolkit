import { Component, Input } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-label-field',
  templateUrl: './label-field.html'
})
export class LabelFieldComponent {
  @Input()
  caseField: CaseField;

  @Input()
  eventFields: CaseField[] = [];
}
