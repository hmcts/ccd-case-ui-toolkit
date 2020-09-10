import { Component, Input } from '@angular/core';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { SimpleOrganisationModel } from '../../../domain/organisation';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ccd-write-organisation-complex-field',
  templateUrl: './write-organisation-complex-field.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class WriteOrganisationComplexFieldComponent extends AbstractFormFieldComponent {

  @Input()
  public selectedOrg$: BehaviorSubject<SimpleOrganisationModel>;

  constructor() {
    super();
  }

}
