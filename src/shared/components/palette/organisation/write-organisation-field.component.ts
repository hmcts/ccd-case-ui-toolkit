import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../domain/organisation';
import { CaseField } from '../../../domain/definition';
import { Observable, of } from 'rxjs';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'ccd-write-organisation-field',
  templateUrl: './write-organisation-field.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class WriteOrganisationFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  private static readonly EMPTY_SIMPLE_ORG: SimpleOrganisationModel = {'organisationIdentifier': '', 'name': '', 'address': ''};
  private static readonly MAX_RESULT_COUNT: number = 100;
  private static readonly ORGANISATION_ID: string = 'OrganisationID';
  private static readonly ORGANISATION_NAME: string = 'OrganisationName';

  public organisationFormGroup: FormGroup;
  public searchOrgTextFormControl: FormControl;
  public organisationIDFormControl: FormControl;
  public organisationNameFormControl: FormControl;

  public organisations$: Observable<OrganisationVm[]>;
  public searchOrgValue$: Observable<string>;
  public simpleOrganisations$: Observable<SimpleOrganisationModel[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService, private organisationConverter: OrganisationConverter) {
    super();
  }

  public ngOnInit() {
    this.organisations$ = this.organisationService.getActiveOrganisations();

    this.searchOrgTextFormControl = new FormControl('');
    this.searchOrgValue$ = this.searchOrgTextFormControl.valueChanges;
    this.searchOrgValue$.subscribe(value => this.onSearchOrg(value));

    this.organisationFormGroup = this.registerControl(new FormGroup({}), true) as FormGroup;
    if (this.caseField && this.caseField.value && this.caseField.value.OrganisationID) {
      this.instantiateOrganisationFormGroup(this.caseField.value.OrganisationID, this.caseField.value.OrganisationName);
      this.selectedOrg$ = this.organisations$.pipe(
        map(organisations =>
          organisations.filter(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)
                       .map(organisation => this.organisationConverter.toSimpleOrganisationModel(organisation))[0]),
      );
      this.searchOrgTextFormControl.disable();
    } else {
      this.instantiateOrganisationFormGroup(null, null);
      this.selectedOrg$ = of(WriteOrganisationFieldComponent.EMPTY_SIMPLE_ORG);
    }

    // Ensure that all sub-fields inherit the same value for retain_hidden_value as this parent; although an
    // Organisation field uses the Complex type, it is meant to be treated as one field
    if (this.caseField && this.caseField.field_type.type === 'Complex') {
      for (const organisationSubField of this.caseField.field_type.complex_fields) {
        organisationSubField.retain_hidden_value = this.caseField.retain_hidden_value;
      }
    }
  }

  private instantiateOrganisationFormGroup(orgIDState: any, orgNameState: any): void {
    this.organisationIDFormControl = new FormControl(orgIDState);
    this.addOrganisationValidators(this.caseField, this.organisationIDFormControl);
    this.organisationFormGroup.addControl(WriteOrganisationFieldComponent.ORGANISATION_ID, this.organisationIDFormControl);
    this.organisationNameFormControl = new FormControl(orgNameState);
    this.organisationFormGroup.addControl(WriteOrganisationFieldComponent.ORGANISATION_NAME, this.organisationNameFormControl);
  }

  private addOrganisationValidators(caseField: CaseField, control: AbstractControl): void {
    if (caseField.field_type && caseField.field_type.complex_fields) {
      const organisationIdField = caseField.field_type.complex_fields
        .find(field => field.id === WriteOrganisationFieldComponent.ORGANISATION_ID);
      this.addValidators(organisationIdField, control);
    }
  }

  public onSearchOrg(orgSearchText: string): void {
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
