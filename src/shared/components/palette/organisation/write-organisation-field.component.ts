import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup } from '@angular/forms';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../domain/organisation';
import { Observable, of } from 'rxjs';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';
import { map, switchMap } from 'rxjs/operators';
import { WindowService } from '../../../services';

@Component({
  selector: 'ccd-write-organisation-field',
  templateUrl: './write-organisation-field.component.html',
  styleUrls: ['./organisation-field.scss'],
  providers: [WindowService]
})
export class WriteOrganisationFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  private static readonly EMPTY_SIMPLE_ORG: SimpleOrganisationModel = {'organisationIdentifier': '', 'name': '', 'address': ''};
  private static readonly MAX_RESULT_COUNT = 100;

  public organisationFormGroup: FormGroup;
  public searchOrgTextFormControl: FormControl;
  public organisationIDFormControl: FormControl;
  public organisationNameFormControl: FormControl;

  public organisations$: Observable<OrganisationVm[]>;
  public searchOrgValue$: Observable<string>;
  public simpleOrganisations$: Observable<SimpleOrganisationModel[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService, private organisationConverter: OrganisationConverter, private windowService: WindowService) {
    super();
    const selectedOrg = JSON.parse(this.windowService.getLocalStorage('organisation-preselected-value'));
    if (selectedOrg) {
      this.caseField.value = {'OrganisationID': selectedOrg.organisationIdentifier, 'OrganisationName': selectedOrg.name};
    }
  }

  ngOnInit() {
    this.organisations$ = this.organisationService.getActiveOrganisations();

    this.searchOrgTextFormControl = new FormControl('');
    this.searchOrgValue$ = this.searchOrgTextFormControl.valueChanges;
    this.searchOrgValue$.subscribe(value => this.onSearchOrg(value));

    this.organisationFormGroup = this.registerControl(new FormGroup({}), true) as FormGroup;
    if (this.caseField && this.caseField.value && this.caseField.value.OrganisationID) {
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
      this.selectedOrg$ = of(WriteOrganisationFieldComponent.EMPTY_SIMPLE_ORG);
      this.windowService.removeLocalStorage('organisation-preselected-value');
    }
  }

  public onSearchOrg(orgSearchText) {
    if (orgSearchText && orgSearchText.length >= 2) {
      const lowerOrgSearchText = orgSearchText.toLowerCase();
      this.simpleOrganisations$ = this.organisations$.pipe(
        switchMap(organisations => of(
          this.searchOrg(organisations, lowerOrgSearchText)
          )
        )
      );
    } else {
      this.simpleOrganisations$ = of([]);
    }
  }

  public searchOrg(organisations: OrganisationVm[], lowerOrgSearchText: string): SimpleOrganisationModel[] {
    return organisations.filter(organisation => {
        return this.searchCriteria(organisation, lowerOrgSearchText) || this.searchWithSpace(organisation, lowerOrgSearchText);
      })
      .map(organisation => this.organisationConverter.toSimpleOrganisationModel(organisation))
      .slice(0, WriteOrganisationFieldComponent.MAX_RESULT_COUNT);
  }

  private searchCriteria(organisation: OrganisationVm, lowerOrgSearchText: string): boolean {
    if (organisation.postCode && organisation.postCode.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.postCode && this.trimAll(organisation.postCode).toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.postCode && organisation.postCode.toLowerCase().includes(this.trimAll(lowerOrgSearchText))) {
      return true;
    }
    if (organisation.name && organisation.name.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.addressLine1 && organisation.addressLine1.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.addressLine2 && organisation.addressLine2.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.addressLine3 && organisation.addressLine3.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.townCity && organisation.townCity.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    if (organisation.county && organisation.county.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    // noinspection RedundantIfStatementJS
    if (organisation.country && organisation.country.toLowerCase().includes(lowerOrgSearchText)) {
      return true;
    }
    return false;
  }

  private searchWithSpace(organisation: OrganisationVm, lowerOrgSearchText: string) {
    const searchTextArray: string[] = lowerOrgSearchText.split(/\s+/g);
    for (const singleSearchText of searchTextArray) {
      if (singleSearchText && this.searchCriteria(organisation, singleSearchText)) {
        return true;
      }
    }
  }

  public trimAll(oldText: string): string {
    return oldText.replace(/\s+/g, '');
  }

  public selectOrg(selectedOrg: SimpleOrganisationModel) {
    this.organisationIDFormControl.setValue(selectedOrg.organisationIdentifier);
    this.organisationNameFormControl.setValue(selectedOrg.name);
    this.selectedOrg$ = of(selectedOrg);
    this.simpleOrganisations$ = of([...[], selectedOrg]);
    this.searchOrgTextFormControl.setValue('');
    this.searchOrgTextFormControl.disable();
    this.caseField.value = {'OrganisationID': selectedOrg.organisationIdentifier, 'OrganisationName': selectedOrg.name};
    this.organisationFormGroup.setValue(this.caseField.value);
  }

  public deSelectOrg(selectedOrg) {
    this.organisationIDFormControl.reset();
    this.organisationNameFormControl.reset();
    this.selectedOrg$ = of(WriteOrganisationFieldComponent.EMPTY_SIMPLE_ORG);
    this.simpleOrganisations$ = of([]);
    this.searchOrgTextFormControl.setValue('');
    this.searchOrgTextFormControl.enable();
    this.caseField.value = {'OrganisationID': null, 'OrganisationName': null};
    this.organisationFormGroup.setValue(this.caseField.value);
  }

}
