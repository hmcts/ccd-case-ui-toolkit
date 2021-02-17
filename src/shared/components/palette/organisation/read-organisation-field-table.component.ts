import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { CaseField } from '../../../domain/definition';
import { switchMap } from 'rxjs/operators';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';
import { Observable, of } from 'rxjs';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../domain/organisation';

@Component({
  selector: 'ccd-read-organisation-field-table',
  templateUrl: './read-organisation-field-table.component.html',
  styleUrls: ['./organisation-field.scss']
})

export class ReadOrganisationFieldTableComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];

  public organisations$: Observable<OrganisationVm[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService, private organisationConverter: OrganisationConverter) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit()
    if (this.caseField.value && this.caseField.value.OrganisationID) {
      this.organisations$ = this.organisationService.getActiveOrganisations();
      this.selectedOrg$ = this.organisations$.pipe(
        switchMap((organisations: OrganisationVm[]) => of(
            this.organisationConverter.toSimpleOrganisationModel(
              organisations.find(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)
            )
          )
        )
      );
    }
  }
}
