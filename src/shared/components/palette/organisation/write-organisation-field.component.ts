import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup } from '@angular/forms';
import { SimpleOrganisationModel } from '../../../domain/organisation/simple-organisation.model';
import { OrganisationConverter } from '../../../domain/organisation/organisation-converter';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';

@Component({
  selector: 'ccd-write-organisation-field',
  templateUrl: './write-organisation-field.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class WriteOrganisationFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  public organisationFormGroup: FormGroup;

  public searchOrgText: FormControl;
  public organisationID: FormControl;
  public organisationName: FormControl;

  public organisations$: Observable<OrganisationVm[]>;
  public organisations: OrganisationVm[];

  public simpleOrganisations: SimpleOrganisationModel[];

  public selectedOrg$: BehaviorSubject<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService, private organisationConverter: OrganisationConverter) {
    super();
  }

  ngOnInit() {
    this.searchOrgText = new FormControl('');
    this.organisations$ = this.organisationService.getActiveOrganisations();
    this.organisations$.subscribe(organisations => this.organisations = organisations);

    this.organisationFormGroup = this.registerControl(new FormGroup({}));

    this.organisationID = new FormControl('');
    this.organisationFormGroup.addControl('OrganisationID', this.organisationID);
    this.organisationName = new FormControl('');
    this.organisationFormGroup.addControl('OrganisationName', this.organisationName);
    this.selectedOrg$ = new BehaviorSubject<SimpleOrganisationModel>({'organisationIdentifier': '', 'name': '', 'address': ''})
  }

  onSearchOrg(orgSearchText) {
    if (orgSearchText && orgSearchText.length >= 2) {
      const lowerOrgSearchText = orgSearchText.toLowerCase();
      this.simpleOrganisations = this.organisations.filter(organisation => {
          if (organisation.postCode && organisation.postCode.toLowerCase().includes(lowerOrgSearchText)) {
            return true;
          }
          // noinspection RedundantIfStatementJS
          if (organisation.name && organisation.name.toLowerCase().includes(lowerOrgSearchText)) {
            return true;
          }
          return false;
        })
        .map(organisation => this.organisationConverter.toSimpleOrganisationModel(organisation))
        .slice(0, 10);
    } else {
      this.simpleOrganisations = [];
    }
  }

  selectOrg(selectedOrg: SimpleOrganisationModel) {
    this.organisationID.setValue(selectedOrg.organisationIdentifier);
    this.organisationName.setValue(selectedOrg.name);
    this.selectedOrg$.next(selectedOrg);
    this.simpleOrganisations = [...[], selectedOrg];
    this.searchOrgText.setValue('');
  }

  deSelectOrg(selectedOrg) {
    this.organisationID.setValue('');
    this.organisationName.setValue('');
    this.selectedOrg$.next({'organisationIdentifier': '', 'name': '', 'address': ''})
    this.simpleOrganisations = [];
    this.searchOrgText.setValue('');
  }
}
