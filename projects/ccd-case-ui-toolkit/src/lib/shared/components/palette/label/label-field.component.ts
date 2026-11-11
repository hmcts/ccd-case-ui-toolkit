import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-label-field',
  templateUrl: './label-field.html',
  standalone: false
})
export class LabelFieldComponent {
  @Input()
  public caseField: CaseField;

  @Input()
  public caseFields: CaseField[] = [];

  @Input()
  public formGroup: FormGroup = new FormGroup({});

  @Input()
  public labelCanBeTranslated = false;

}
