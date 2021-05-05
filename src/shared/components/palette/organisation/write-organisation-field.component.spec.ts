import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { WriteOrganisationFieldComponent } from './write-organisation-field.component';
import { MarkdownModule } from '../../markdown';
import { OrganisationConverter } from '../../../domain/organisation';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { OrganisationService } from '../../../services/organisation';
import { CaseField, FieldType } from '../../../domain/definition';

describe('WriteOrganisationFieldComponent', () => {
  let component: WriteOrganisationFieldComponent;
  let fixture: ComponentFixture<WriteOrganisationFieldComponent>;
  const mockOrganisationService = jasmine.createSpyObj<OrganisationService>('OrganisationService', ['getActiveOrganisations']);

  const ORGANISATIONS = [{
    organisationIdentifier: 'O111111',
    name: 'Woodford solicitor',
    addressLine1: '12',
    addressLine2: 'Nithdale Role',
    addressLine3: '',
    townCity: 'Liverpool',
    county: 'Merseyside',
    country: 'UK',
    postCode: 'L15 5AX'
  }, {
    organisationIdentifier: 'O222222',
    name: 'Broker solicitor',
    addressLine1: '33',
    addressLine2: 'The square',
    addressLine3: 'Apps street',
    townCity: 'Swindon',
    county: 'Wiltshire',
    country: 'UK',
    postCode: 'SN1 3EB'
  }, {
    organisationIdentifier: 'O333333',
    name: 'The Ethical solicitor',
    addressLine1: 'Davidson House',
    addressLine2: '33',
    addressLine3: 'The square',
    townCity: 'Reading',
    county: 'Berkshire',
    country: 'UK',
    postCode: 'RG11EB'
  }, {
    organisationIdentifier: 'O444444',
    name: 'The SN1 solicitor',
    addressLine1: 'Davidson House',
    addressLine2: '44',
    addressLine3: 'The square',
    townCity: 'Reading',
    county: 'Berkshire',
    country: 'UK',
    postCode: 'RG11EX'
  }];
  const organisationID = new CaseField();

  const VALUE = {
    OrganisationID: 'Org1234',
    OrganisationName: 'Test Organisation'
  };
  const FIELD_ID = 'NewOrganisation';
  const FIELD_TYPE: FieldType = {
    id: 'Organisation',
    type: 'Complex',
  };
  const ORGANISATION_ID: CaseField = <CaseField>({
    id: 'OrganisationID',
    label: 'Organisation ID',
    field_type: {id: 'Text', type: 'Text'}
  });
  const ORGANISATION_NAME: CaseField = <CaseField>({
    id: 'OrganisationName',
    label: 'Name',
    field_type: {id: 'Text', type: 'Text'}
  });

  const CASE_FIELD: CaseField = <CaseField>({
    id: FIELD_ID,
    label: 'New Organisation',
    display_context: 'OPTIONAL',
    field_type: {
      ...FIELD_TYPE,
      complex_fields: [ORGANISATION_ID, ORGANISATION_NAME]
    },
    value: VALUE,
    retain_hidden_value: true
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MarkdownModule,
        ReactiveFormsModule
      ],
      declarations: [
        WriteOrganisationFieldComponent,
        WriteOrganisationComplexFieldComponent
      ],
      providers: [
        {provide: OrganisationService, useValue: mockOrganisationService},
        OrganisationConverter
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOrganisationFieldComponent);
    component = fixture.componentInstance;
    mockOrganisationService.getActiveOrganisations.and.returnValue(of([]));
    component.organisations$ = of(ORGANISATIONS);

    organisationID.id = 'OrganisationID';
    organisationID.display_context = 'MANDATORY';
    organisationID.field_type = {
      id: 'Text',
      type: 'Text'
    };
    const organisationName = new CaseField();
    organisationName.id = 'OrganisationName';
    organisationName.field_type = {
      id: 'Text',
      type: 'Text'
    };
    component.caseField = new CaseField();
    component.caseField.field_type = {
      id: 'Organisation',
      type: 'Organisation'
    };
    component.caseField.field_type.complex_fields = [
      organisationID,
      organisationName
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    component.organisations$ = of([]);
    expect(component).toBeTruthy();
  });

  it('should be invalid control if organisation ID is null when OrganisationID is MANDATORY', () => {
    component.organisations$ = of([]);
    organisationID.display_context = 'MANDATORY';
    component.ngOnInit();
    component.organisationIDFormControl.setValue(null);
    fixture.detectChanges();
    expect(component.organisationIDFormControl.invalid).toBeTruthy();
  });

  it('should be valid control if organisation ID is set when OrganisationID is MANDATORY', () => {
    component.organisations$ = of([]);
    organisationID.display_context = 'MANDATORY';
    component.ngOnInit();
    component.organisationIDFormControl.setValue('TEST12345');
    fixture.detectChanges();
    expect(component.organisationIDFormControl.valid).toBeTruthy();
  });

  it('should be valid control if organisation ID is null when OrganisationID is OPTIONAL', () => {
    component.organisations$ = of([]);
    organisationID.display_context = 'OPTIONAL';
    component.ngOnInit();
    component.organisationIDFormControl.setValue(null);
    fixture.detectChanges();
    expect(component.organisationIDFormControl.valid).toBeTruthy();
  });

  it('should pre-select organisation', () => {
    component.caseField = new CaseField();
    component.caseField.field_type = {
      ...FIELD_TYPE,
      complex_fields: [ORGANISATION_ID, ORGANISATION_NAME]
    }
    component.caseField.value = {'OrganisationID': 'O333333', 'OrganisationName': 'The Ethical solicitor'};
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.searchOrgTextFormControl.disabled).toBeTruthy();
    component.selectedOrg$.toPromise().then(selectedOrg => {
      expect(selectedOrg.address).toEqual('Davidson House<br>33<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EB<br>')
    });
  });

  it('should not search org if enter characters less than 2', () => {
    component.onSearchOrg('a');
    component.simpleOrganisations$.toPromise().then(orgs => {
      expect(orgs.length).toEqual(0);
    });
  });

  it('should search org if enter characters equal and greater than 2', () => {
    component.organisations$ = of(ORGANISATIONS);
    component.onSearchOrg('SN');
    component.simpleOrganisations$.toPromise().then(orgs => {
      expect(orgs.length).toEqual(2);
    });
  });

  it('should replace space', () => {
    const postCode = component.trimAll('L15 5AA');
    expect(postCode).toBeTruthy('L155AA');
  });

  it('should search organisation with post code', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'l15 5ax');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O111111');
    expect(searchedOrg[0].name).toEqual('Woodford solicitor');
    expect(searchedOrg[0].address).toEqual('12<br>Nithdale Role<br>Liverpool<br>Merseyside<br>UK<br>L15 5AX<br>');
  });

  it('should search organisation using post code without space', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'l155ax');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O111111');
    expect(searchedOrg[0].name).toEqual('Woodford solicitor');
    expect(searchedOrg[0].address).toEqual('12<br>Nithdale Role<br>Liverpool<br>Merseyside<br>UK<br>L15 5AX<br>');
  });

  it('should search organisation using post code with/without space', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'rg1 1eb');
    expect(searchedOrg.length).toEqual(2);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O333333');
    expect(searchedOrg[0].name).toEqual('The Ethical solicitor');
    expect(searchedOrg[0].address).toEqual('Davidson House<br>33<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EB<br>');
    expect(searchedOrg[1].organisationIdentifier).toEqual('O444444');
    expect(searchedOrg[1].name).toEqual('The SN1 solicitor');
    expect(searchedOrg[1].address).toEqual('Davidson House<br>44<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EX<br>');
  });

  it('should search organisation using post code and org name', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'sn1');
    expect(searchedOrg.length).toEqual(2);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O222222');
    expect(searchedOrg[0].name).toEqual('Broker solicitor');
    expect(searchedOrg[0].address).toEqual('33<br>The square<br>Apps street<br>Swindon<br>Wiltshire<br>UK<br>SN1 3EB<br>');
    expect(searchedOrg[1].organisationIdentifier).toEqual('O444444');
    expect(searchedOrg[1].name).toEqual('The SN1 solicitor');
    expect(searchedOrg[1].address).toEqual('Davidson House<br>44<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EX<br>');
  });

  it('should search organisation using org name', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'broker');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O222222');
    expect(searchedOrg[0].name).toEqual('Broker solicitor');
    expect(searchedOrg[0].address).toEqual('33<br>The square<br>Apps street<br>Swindon<br>Wiltshire<br>UK<br>SN1 3EB<br>');
  });

  it('should search organisation using address 1', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, '12');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O111111');
    expect(searchedOrg[0].name).toEqual('Woodford solicitor');
    expect(searchedOrg[0].address).toEqual('12<br>Nithdale Role<br>Liverpool<br>Merseyside<br>UK<br>L15 5AX<br>');
  });

  it('should search organisation using address 2', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, '44');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O444444');
    expect(searchedOrg[0].name).toEqual('The SN1 solicitor');
    expect(searchedOrg[0].address).toEqual('Davidson House<br>44<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EX<br>');
  });

  it('should search organisation using address 3', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'apps');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O222222');
    expect(searchedOrg[0].name).toEqual('Broker solicitor');
    expect(searchedOrg[0].address).toEqual('33<br>The square<br>Apps street<br>Swindon<br>Wiltshire<br>UK<br>SN1 3EB<br>');
  });

  it('should search organisation using town city', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'swindon');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O222222');
    expect(searchedOrg[0].name).toEqual('Broker solicitor');
    expect(searchedOrg[0].address).toEqual('33<br>The square<br>Apps street<br>Swindon<br>Wiltshire<br>UK<br>SN1 3EB<br>');
  });

  it('should search organisation using county', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'merseyside');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O111111');
    expect(searchedOrg[0].name).toEqual('Woodford solicitor');
    expect(searchedOrg[0].address).toEqual('12<br>Nithdale Role<br>Liverpool<br>Merseyside<br>UK<br>L15 5AX<br>');
  });

  it('should search organisation using country', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'uk');
    expect(searchedOrg.length).toEqual(4);
  });

  it('should search organisation using both org name and postcode', () => {
    const SIMILAR_ORGANISATION = [{
      organisationIdentifier: 'O555555',
      name: 'Smith LLP',
      addressLine1: 'Davidson House',
      addressLine2: '55',
      addressLine3: 'The square',
      townCity: 'Reading',
      county: 'Berkshire',
      country: 'UK',
      postCode: 'RG11EY'
    }, {
      organisationIdentifier: 'O666666',
      name: 'KMG solicitor',
      addressLine1: '69',
      addressLine2: 'Bay Crescent',
      addressLine3: '',
      townCity: 'Liverpool',
      county: 'Merseyside',
      country: 'UK',
      postCode: 'LA1 4RA'
    }];
    const ORGANISATION_FOR_SEARCH = [...ORGANISATIONS, ...SIMILAR_ORGANISATION];
    const searchedOrg = component.searchOrg(ORGANISATION_FOR_SEARCH, 'smith la1');
    expect(searchedOrg.length).toEqual(2);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O555555');
    expect(searchedOrg[0].name).toEqual('Smith LLP');
    expect(searchedOrg[0].address).toEqual('Davidson House<br>55<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EY<br>');
    expect(searchedOrg[1].organisationIdentifier).toEqual('O666666');
    expect(searchedOrg[1].name).toEqual('KMG solicitor');
    expect(searchedOrg[1].address).toEqual('69<br>Bay Crescent<br>Liverpool<br>Merseyside<br>UK<br>LA1 4RA<br>');
  });

  it('should search organisation using both org name and postcode split with n space', () => {
    const SIMILAR_ORGANISATION = [{
      organisationIdentifier: 'O555555',
      name: 'Smith LLP',
      addressLine1: 'Davidson House',
      addressLine2: '55',
      addressLine3: 'The square',
      townCity: 'Reading',
      county: 'Berkshire',
      country: 'UK',
      postCode: 'RG11EY'
    }, {
      organisationIdentifier: 'O666666',
      name: 'KMG solicitor',
      addressLine1: '69',
      addressLine2: 'Bay Crescent',
      addressLine3: '',
      townCity: 'Liverpool',
      county: 'Merseyside',
      country: 'UK',
      postCode: 'LA1 4RA'
    }];
    const ORGANISATION_FOR_SEARCH = [...ORGANISATIONS, ...SIMILAR_ORGANISATION];
    const searchedOrg = component.searchOrg(ORGANISATION_FOR_SEARCH, 'smith               la1');
    expect(searchedOrg.length).toEqual(2);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O555555');
    expect(searchedOrg[0].name).toEqual('Smith LLP');
    expect(searchedOrg[0].address).toEqual('Davidson House<br>55<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EY<br>');
    expect(searchedOrg[1].organisationIdentifier).toEqual('O666666');
    expect(searchedOrg[1].name).toEqual('KMG solicitor');
    expect(searchedOrg[1].address).toEqual('69<br>Bay Crescent<br>Liverpool<br>Merseyside<br>UK<br>LA1 4RA<br>');
  });

  it('should search organisation if search text is end with space', () => {
    const SIMILAR_ORGANISATION = [{
      organisationIdentifier: 'O555555',
      name: 'Smith LLP',
      addressLine1: 'Davidson House',
      addressLine2: '55',
      addressLine3: 'The square',
      townCity: 'Reading',
      county: 'Berkshire',
      country: 'UK',
      postCode: 'RG11EY'
    }, {
      organisationIdentifier: 'O666666',
      name: 'KMG solicitor',
      addressLine1: '69',
      addressLine2: 'Bay Crescent',
      addressLine3: '',
      townCity: 'Liverpool',
      county: 'Merseyside',
      country: 'UK',
      postCode: 'LA1 4RA'
    }];
    const ORGANISATION_FOR_SEARCH = [...ORGANISATIONS, ...SIMILAR_ORGANISATION];
    const searchedOrg = component.searchOrg(ORGANISATION_FOR_SEARCH, 'smith ');
    expect(searchedOrg.length).toEqual(1);
    expect(searchedOrg[0].organisationIdentifier).toEqual('O555555');
    expect(searchedOrg[0].name).toEqual('Smith LLP');
    expect(searchedOrg[0].address).toEqual('Davidson House<br>55<br>The square<br>Reading<br>Berkshire<br>UK<br>RG11EY<br>');
  });

  it('should return organisation if nothing match', () => {
    const searchedOrg = component.searchOrg(ORGANISATIONS, 'atos');
    expect(searchedOrg.length).toEqual(0);
  });

  it('should select organisation', () => {
    component.organisationIDFormControl = new FormControl(null);
    component.organisationFormGroup.addControl('OrganisationID', component.organisationIDFormControl);
    component.organisationNameFormControl = new FormControl(null);
    component.organisationFormGroup.addControl('OrganisationName', component.organisationNameFormControl);
    const selectedOrg = {
      organisationIdentifier: 'O111111',
      name: 'Woodford solicitor',
      address: '12<br>Nithdale Role<br>Liverpool<br>Merseyside<br>UK<br>L15 5AX<br>'
    }
    component.selectOrg(selectedOrg);
    expect(component.searchOrgTextFormControl.value).toEqual('');
    expect(component.searchOrgTextFormControl.disabled).toBeTruthy();
    expect(component.caseField.value).toEqual({'OrganisationID': 'O111111', 'OrganisationName': 'Woodford solicitor'});
  });

  it('should deselect organisation', () => {
    component.organisationIDFormControl = new FormControl(null);
    component.organisationFormGroup.addControl('OrganisationID', component.organisationIDFormControl);
    component.organisationNameFormControl = new FormControl(null);
    component.organisationFormGroup.addControl('OrganisationName', component.organisationNameFormControl);
    component.deSelectOrg();
    expect(component.searchOrgTextFormControl.value).toEqual('');
    expect(component.searchOrgTextFormControl.enabled).toBeTruthy();
    expect(component.caseField.value).toEqual({'OrganisationID': null, 'OrganisationName': null});
  });

  it('should set retain_hidden_value to true for all sub-fields that are part of an Organisation field', () => {
    component.caseField = CASE_FIELD;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.caseField.field_type.complex_fields.length).toEqual(2);
    expect(component.caseField.field_type.complex_fields[0].retain_hidden_value).toEqual(true);
    expect(component.caseField.field_type.complex_fields[1].retain_hidden_value).toEqual(true);
  });
});
