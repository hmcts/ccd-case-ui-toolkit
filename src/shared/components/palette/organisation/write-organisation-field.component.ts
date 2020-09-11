import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup } from '@angular/forms';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../domain/organisation';
import { Observable, of, Subscription } from 'rxjs';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ccd-write-organisation-field',
  templateUrl: './write-organisation-field.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class WriteOrganisationFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  private EMPTY_SIMPLE_ORG: SimpleOrganisationModel = {'organisationIdentifier': '', 'name': '', 'address': ''};

  @Input()
  public organisationFormGroup: FormGroup;

  public searchOrgTextFormControl: FormControl;
  public organisationIDFormControl: FormControl;
  public organisationNameFormControl: FormControl;

  public organisations$: Observable<OrganisationVm[]>;
  public organisations: OrganisationVm[];

  public simpleOrganisations$: Observable<SimpleOrganisationModel[]>;

  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService, private organisationConverter: OrganisationConverter) {
    super();
  }

  ngOnInit() {
    this.searchOrgTextFormControl = new FormControl('');
    this.organisations$ = this.organisationService.getActiveOrganisations();
    this.organisations$.subscribe(organisations => this.organisations = organisations);
    this.organisationFormGroup = this.registerControl(new FormGroup({}));
    if (this.caseField.value && this.caseField.value.OrganisationID) {
      this.organisationIDFormControl = new FormControl(this.caseField.value.OrganisationID);
      this.organisationFormGroup.addControl('OrganisationID', this.organisationIDFormControl);
      this.organisationNameFormControl = new FormControl(this.caseField.value.OrganisationName);
      this.organisationFormGroup.addControl('OrganisationName', this.organisationNameFormControl);
      this.selectedOrg$ = this.organisations$.pipe(
        map(organisations =>
          organisations.filter(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)
                       .map(organisation => this.organisationConverter.toSimpleOrganisationModel(organisation))[0]),
      );
      this.searchOrgTextFormControl.disable();
    } else {
      this.organisationIDFormControl = new FormControl(null);
      this.organisationFormGroup.addControl('OrganisationID', this.organisationIDFormControl);
      this.organisationNameFormControl = new FormControl(null);
      this.organisationFormGroup.addControl('OrganisationName', this.organisationNameFormControl);
      this.selectedOrg$ = of(this.EMPTY_SIMPLE_ORG);
    }
  }

  onSearchOrg(orgSearchText) {
    if (orgSearchText && orgSearchText.length >= 2) {
      const lowerOrgSearchText = orgSearchText.toLowerCase();
      this.simpleOrganisations$ = of(this.organisations.filter(organisation => {
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
        .slice(0, 10));
    } else {
      this.simpleOrganisations$ = of([]);
    }
  }

  selectOrg(selectedOrg: SimpleOrganisationModel) {
    this.organisationIDFormControl.setValue(selectedOrg.organisationIdentifier);
    this.organisationNameFormControl.setValue(selectedOrg.name);
    this.selectedOrg$ = of(selectedOrg);
    this.simpleOrganisations$ = of([...[], selectedOrg]);
    this.searchOrgTextFormControl.setValue('');
    this.searchOrgTextFormControl.disable();
    this.caseField.value = {'OrganisationID': selectedOrg.organisationIdentifier, 'OrganisationName': selectedOrg.name};
    this.organisationFormGroup.setValue(this.caseField.value);
  }

  deSelectOrg(selectedOrg) {
    this.organisationIDFormControl.reset();
    this.organisationNameFormControl.reset();
    this.selectedOrg$ = of(this.EMPTY_SIMPLE_ORG);
    this.simpleOrganisations$ = of([]);
    this.searchOrgTextFormControl.setValue('');
    this.searchOrgTextFormControl.enable();
    this.caseField.value = {'OrganisationID': null, 'OrganisationName': null};
    this.organisationFormGroup.setValue(this.caseField.value);
  }
}
