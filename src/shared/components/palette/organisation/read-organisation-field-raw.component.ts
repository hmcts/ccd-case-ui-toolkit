import { Component, Input } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-read-organisation-field-raw',
  templateUrl: './read-organisation-field-raw.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class ReadOrganisationFieldRawComponent extends AbstractFieldReadComponent {

  @Input()
  caseFields: CaseField[] = [];

}
