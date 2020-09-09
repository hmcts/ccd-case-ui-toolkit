import { Component, Input } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-read-organisation-field-table',
  templateUrl: './read-organisation-field-table.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class ReadOrganisationFieldTableComponent extends AbstractFieldReadComponent {

  @Input()
  caseFields: CaseField[] = [];

}
