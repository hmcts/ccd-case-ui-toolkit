import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-label-field',
  templateUrl: './label-field.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class LabelFieldComponent {
  @Input()
  public caseField: CaseField;

  @Input()
  public caseFields: CaseField[] = [];

  @Input()
  public labelCanBeTranslated = false;

}
