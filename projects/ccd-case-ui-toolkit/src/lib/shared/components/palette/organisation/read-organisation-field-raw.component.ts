import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CaseField } from '../../../domain/definition';
import { OrganisationConverter } from '../../../domain/organisation/organisation-converter';
import { SimpleOrganisationModel } from '../../../domain/organisation/simple-organisation.model';
import { OrganisationService, OrganisationVm } from '../../../services/organisation/organisation.service';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-organisation-field-raw',
  templateUrl: './read-organisation-field-raw.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class ReadOrganisationFieldRawComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  public caseFields: CaseField[] = [];

  public organisations$: Observable<OrganisationVm[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private readonly organisationService: OrganisationService, private readonly organisationConverter: OrganisationConverter) {
    super();
  }

  public ngOnInit(): void {
    super.ngOnInit();
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
