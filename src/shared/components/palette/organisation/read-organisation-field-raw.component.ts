import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { CaseField } from '../../../domain/definition';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../domain/organisation';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ccd-read-organisation-field-raw',
  templateUrl: './read-organisation-field-raw.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class ReadOrganisationFieldRawComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];

  public organisations$: Observable<OrganisationVm[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService, private organisationConverter: OrganisationConverter) {
    super();
  }

  ngOnInit(): void {
    if (this.caseField.value && this.caseField.value.OrganisationID) {
      this.organisations$ = this.organisationService.getActiveOrganisations();
      this.selectedOrg$ = this.organisations$.pipe(
        switchMap((organisations: OrganisationVm[]) => of(this.organisationConverter.toSimpleOrganisationModel(
          organisations.find(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)))
        )
      );
    }
  }
}
