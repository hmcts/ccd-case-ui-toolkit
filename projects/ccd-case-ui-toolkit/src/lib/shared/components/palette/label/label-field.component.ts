import { Component, Input } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';

@Component({
  selector: 'ccd-label-field',
  templateUrl: './label-field.html'
})
export class LabelFieldComponent {
  @Input()
  public caseField: CaseField;

  @Input()
  public caseFields: CaseField[] = [];

  @Input()
  public markdownUseHrefAsRouterLink?: boolean;
}
