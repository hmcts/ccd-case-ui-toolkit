import { Component, Input } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-complex-field-table',
  templateUrl: './read-complex-field-table.html',
  styleUrls: ['./read-complex-field-table.scss']
})
export class ReadComplexFieldTableComponent extends AbstractFieldReadComponent {
  @Input()
  public caseFields: CaseField[] = [];
}
