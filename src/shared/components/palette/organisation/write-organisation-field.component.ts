import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  private static readonly ORGANISATION_ID: string = 'OrganisationID';
  private static readonly ORGANISATION_NAME: string = 'OrganisationName';
  private static readonly PRE_POPULATE_TO_USERS_ORGANISATION: string = 'PrepopulateToUsersOrganisation';
  private static readonly ORGANISATION_DETAILS: string = 'organisationDetails';
  private static readonly YES: string = 'YES';
  private static readonly MANDATORY: string = 'MANDATORY';
  private readonly defaultOrg: any;

  public organisationFormGroup: FormGroup;
  public searchOrgTextFormControl: FormControl;
  public organisationIDFormControl: FormControl;
  public organisationNameFormControl: FormControl;

  public organisations$: Observable<OrganisationVm[]>;
  public searchOrgValue$: Observable<string>;
  public simpleOrganisations$: Observable<SimpleOrganisationModel[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(private organisationService: OrganisationService,
              private organisationConverter: OrganisationConverter,
              private windowService: WindowService) {
    super();
    this.defaultOrg = JSON.parse(this.windowService.getSessionStorage(WriteOrganisationFieldComponent.ORGANISATION_DETAILS));
  }

  public ngOnInit() {
    this.organisations$ = this.organisationService.getActiveOrganisations();

    this.searchOrgTextFormControl = new FormControl('');
    this.searchOrgValue$ = this.searchOrgTextFormControl.valueChanges;
    this.searchOrgValue$.subscribe(value => this.onSearchOrg(value));

    this.organisationFormGroup = this.registerControl(new FormGroup({}), true) as FormGroup;
    if (this.parent.controls && this.parent.controls.hasOwnProperty(WriteOrganisationFieldComponent.PRE_POPULATE_TO_USERS_ORGANISATION)
      && this.parent.controls[WriteOrganisationFieldComponent.PRE_POPULATE_TO_USERS_ORGANISATION].value
      && this.parent.controls[WriteOrganisationFieldComponent.PRE_POPULATE_TO_USERS_ORGANISATION].value.toUpperCase()
      === WriteOrganisationFieldComponent.YES) {
      if (this.caseField && this.caseField.value === undefined) {
        this.caseField.value = {
          'OrganisationID': this.defaultOrg.organisationIdentifier,
          'OrganisationName': this.defaultOrg.name
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
  }

  private preSelectDefaultOrg() {
    this.organisationIDFormControl = new FormControl(this.caseField.value.OrganisationID);
    this.addOrganisationValidators();
    this.organisationFormGroup.addControl(WriteOrganisationFieldComponent.ORGANISATION_ID, this.organisationIDFormControl);
    this.organisationNameFormControl = new FormControl(this.caseField.value.OrganisationName);
    this.organisationFormGroup.addControl(WriteOrganisationFieldComponent.ORGANISATION_NAME, this.organisationNameFormControl);
    this.selectedOrg$ = this.organisations$.pipe(
      map(organisations =>
        organisations.filter(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)
          .map(organisation => this.organisationConverter.toSimpleOrganisationModel(organisation))[0]),
    );
    this.searchOrgTextFormControl.disable();
  }

  private preSelectEmptyOrg() {
    this.organisationIDFormControl = new FormControl(null);
    this.addOrganisationValidators();
    this.organisationFormGroup.addControl(WriteOrganisationFieldComponent.ORGANISATION_ID, this.organisationIDFormControl);
    this.organisationNameFormControl = new FormControl(null);
    this.organisationFormGroup.addControl(WriteOrganisationFieldComponent.ORGANISATION_NAME, this.organisationNameFormControl);
    this.selectedOrg$ = of(WriteOrganisationFieldComponent.EMPTY_SIMPLE_ORG);
  }

  private addOrganisationValidators() {
    if (this.caseField.field_type.complex_fields) {
      const organisationIdField = this.caseField.field_type.complex_fields
        .find(field => field.id === WriteOrganisationFieldComponent.ORGANISATION_ID);
      if (organisationIdField && organisationIdField.display_context === WriteOrganisationFieldComponent.MANDATORY) {
        const validators = [Validators.required];
        this.organisationIDFormControl.setValidators(validators);
      }
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
    this.caseField.value = {
      'OrganisationID': selectedOrg.organisationIdentifier,
      'OrganisationName': selectedOrg.name
    };
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
