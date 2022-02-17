import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../domain/organisation';
import { Observable, of } from 'rxjs';
import { OrganisationService, OrganisationVm } from '../../../services/organisation';
import { map, switchMap } from 'rxjs/operators';
import { WindowService } from '../../../services';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-write-organisation-field',
  templateUrl: './write-organisation-field.component.html',
  styleUrls: ['./organisation-field.scss']
})
export class WriteOrganisationFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  private static readonly EMPTY_SIMPLE_ORG: SimpleOrganisationModel = {organisationIdentifier: '', name: '', address: ''};
  private static readonly MAX_RESULT_COUNT: number = 100;
  private static readonly ORGANISATION_ID: string = 'OrganisationID';
  private static readonly ORGANISATION_NAME: string = 'OrganisationName';
  private static readonly PRE_POPULATE_TO_USERS_ORGANISATION: string = 'PrepopulateToUsersOrganisation';
  private static readonly ORGANISATION_DETAILS: string = 'organisationDetails';
  private static readonly YES: string = 'YES';
  private static readonly MANDATORY: string = 'MANDATORY';
  public defaultOrg: any;

  public organisationFormGroup: FormGroup;
  public searchOrgTextFormControl: FormControl;
  public organisationIDFormControl: FormControl;
  public organisationNameFormControl: FormControl;

  public organisations$: Observable<OrganisationVm[]>;
  public searchOrgValue$: Observable<string>;
  public simpleOrganisations$: Observable<SimpleOrganisationModel[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private readonly organisationService: OrganisationService,
              private readonly organisationConverter: OrganisationConverter,
              private readonly windowService: WindowService) {
    super();
    this.defaultOrg = JSON.parse(this.windowService.getSessionStorage(WriteOrganisationFieldComponent.ORGANISATION_DETAILS));
  }

  public ngOnInit(): void {
    this.organisations$ = this.organisationService.getActiveOrganisations();

    this.searchOrgTextFormControl = new FormControl('');
    this.searchOrgValue$ = this.searchOrgTextFormControl.valueChanges;
    this.searchOrgValue$.subscribe(value => this.onSearchOrg(value));

    this.organisationFormGroup = this.registerControl(new FormGroup({}), true) as FormGroup;
    if (this.parent.controls && this.parent.controls.hasOwnProperty(WriteOrganisationFieldComponent.PRE_POPULATE_TO_USERS_ORGANISATION)
      && this.parent.controls[WriteOrganisationFieldComponent.PRE_POPULATE_TO_USERS_ORGANISATION].value
      && this.parent.controls[WriteOrganisationFieldComponent.PRE_POPULATE_TO_USERS_ORGANISATION].value.toUpperCase()
      === WriteOrganisationFieldComponent.YES) {
      if (this.caseField && !this.caseField.value) {
        this.caseField.value = {
          OrganisationID: this.defaultOrg ? this.defaultOrg.organisationIdentifier : null,
          OrganisationName: this.defaultOrg ? this.defaultOrg.name : null
        };
      }
      this.preSelectDefaultOrg();
    } else {
      if (this.caseField && this.caseField.value && this.caseField.value.OrganisationID) {
        this.preSelectDefaultOrg();
      } else {
        this.preSelectEmptyOrg();
      }
    }

    // Ensure that all sub-fields inherit the same value for retain_hidden_value as this parent; although an
    // Organisation field uses the Complex type, it is meant to be treated as one field
    if (this.caseField && this.caseField.field_type.type === 'Complex') {
      for (const organisationSubField of this.caseField.field_type.complex_fields) {
        organisationSubField.retain_hidden_value = this.caseField.retain_hidden_value;
      }
    }
  }

  private preSelectDefaultOrg(): void {
    this.instantiateOrganisationFormGroup(this.caseField.value.OrganisationID, this.caseField.value.OrganisationName);
    this.selectedOrg$ = this.organisations$.pipe(
      map(organisations =>
        organisations.filter(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)
          .map(organisation => this.organisationConverter.toSimpleOrganisationModel(organisation))[0]),
    );
    if (this.caseField.value && this.caseField.value.OrganisationID) {
      this.searchOrgTextFormControl.disable();
    }
  }

  private preSelectEmptyOrg(): void {
    this.instantiateOrganisationFormGroup(null, null);
    this.selectedOrg$ = of(WriteOrganisationFieldComponent.EMPTY_SIMPLE_ORG);
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

  // The way the search works divide into two phases
  // 1. go through collection of org items one by one by doing the comparsion of search string using includes to all the address fields
  // 2. split the search string into arrays and apply the each array item into the address fields
  // 3. both step 1, 2 will go until max count result reaches, and finally combine both result sets into final collection
  public searchOrg(organisations: OrganisationVm[], lowerOrgSearchText: string): SimpleOrganisationModel[] {
    let partMatchingResultSet = [], withSpaceMatchingResultSet = [];
    const MAX_RESULT_COUNT = WriteOrganisationFieldComponent.MAX_RESULT_COUNT
    organisations.filter((organisation) => {
      if ( partMatchingResultSet.length < MAX_RESULT_COUNT && this.searchCriteria(organisation, lowerOrgSearchText)) {
        partMatchingResultSet.push(organisation);
      }
    });
    organisations.filter((org) => {
      const matchingOrg = [...partMatchingResultSet, ...withSpaceMatchingResultSet]
                          .find(item => item.organisationIdentifier === org.organisationIdentifier)
      if (!matchingOrg && [...partMatchingResultSet, ...withSpaceMatchingResultSet].length < MAX_RESULT_COUNT
        && this.searchWithSpace(org, lowerOrgSearchText)
      ) {
        withSpaceMatchingResultSet.push(org);
      }
    });
    return [...partMatchingResultSet, ...withSpaceMatchingResultSet].map((organisation) =>
      this.organisationConverter.toSimpleOrganisationModel(organisation)
    );
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

  private searchWithSpace(organisation: OrganisationVm, lowerOrgSearchText: string): boolean {
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

  public selectOrg(selectedOrg: SimpleOrganisationModel): void {
    this.organisationIDFormControl.setValue(selectedOrg.organisationIdentifier);
    this.organisationNameFormControl.setValue(selectedOrg.name);
    this.selectedOrg$ = of(selectedOrg);
    this.simpleOrganisations$ = of([...[], selectedOrg]);
    this.searchOrgTextFormControl.setValue('');
    this.searchOrgTextFormControl.disable();
    this.caseField.value = {
      OrganisationID: selectedOrg.organisationIdentifier,
      OrganisationName: selectedOrg.name
    };
    this.organisationFormGroup.setValue(this.caseField.value);
  }

  public deSelectOrg(): void {
    this.organisationIDFormControl.reset();
    this.organisationNameFormControl.reset();
    this.selectedOrg$ = of(WriteOrganisationFieldComponent.EMPTY_SIMPLE_ORG);
    this.simpleOrganisations$ = of([]);
    this.searchOrgTextFormControl.setValue('');
    this.searchOrgTextFormControl.enable();
    this.caseField.value = {OrganisationID: null, OrganisationName: null};
    this.organisationFormGroup.setValue(this.caseField.value);
  }

}
