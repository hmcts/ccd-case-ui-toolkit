import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Constants } from '../../../commons/constants';
import { HmctsServiceDetail } from '../../../domain/case-flag';
import { CaseField, CaseType, CaseTypeLite, FieldType, Jurisdiction } from '../../../domain/definition';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { CaseFlagRefdataService, FieldsUtils, FormValidatorsService, JurisdictionService, SessionStorageService } from '../../../services';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { FirstErrorPipe, IsCompoundPipe, PaletteUtilsModule } from '../utils';
import { WriteJudicialUserFieldComponent } from './write-judicial-user-field.component';
import createSpyObj = jasmine.createSpyObj;
import { CaseNotifier } from '../../case-editor';
import { MockComponent } from 'ng2-mock-component';
import { getMockCaseNotifier } from '../../case-editor/services/case.notifier.spec';

const VALUE = {
  idamId: 'idam123',
  personalCode: '1234567'
};
const FIELD_ID = 'JudicialUserField';
const FIELD_TYPE: FieldType = {
  id: 'JudicialUser',
  type: 'Complex',
};
const IDAM_ID: CaseField = {
  id: 'idamId',
  label: 'IdamId',
  field_type: { id: 'Text', type: 'Text' }
} as CaseField;

const PERSONAL_CODE: CaseField = {
  id: 'personalCode',
  label: 'PersonalCode',
  field_type: { id: 'Text', type: 'Text' }
} as CaseField;

const CASE_FIELD: CaseField = {
  id: FIELD_ID,
  label: 'Judicial User',
  display_context: 'OPTIONAL',
  field_type: {
    ...FIELD_TYPE,
    complex_fields: [IDAM_ID, PERSONAL_CODE]
  },
  value: VALUE,
  retain_hidden_value: true
} as CaseField;

const JUDICIAL_USERS: JudicialUserModel[] = [
  {
    emailId: 'jacky.collins@judicial.com',
    fullName: 'Jacky Collins',
    idamId: '38eb0c5e-29c7-453e-b92d-f2029aaed6c1',
    isJudge: 'Y',
    isMagistrate: 'Y',
    isPanelMember: 'Y',
    knownAs: 'Hearing Judge',
    personalCode: 'p1000000',
    surname: 'Collins',
    title: 'Mrs'
  },
  {
    emailId: 'jasmine.chiswell@judicial.com',
    fullName: 'Jasmine Chiswell',
    idamId: '38eb0c5e-29c7-453e-b92d-f2029aaed6c2',
    isJudge: 'Y',
    isMagistrate: 'Y',
    isPanelMember: 'Y',
    knownAs: 'Lead Judge',
    personalCode: 'p1000001',
    surname: 'Chiswell',
    title: 'Mrs'
  },
  {
    emailId: null,
    fullName: 'No Email',
    idamId: '38eb0c5e-29c7-453e-b92d-f2029aaed6c3',
    isJudge: 'Y',
    isMagistrate: 'Y',
    isPanelMember: 'Y',
    knownAs: 'Lead Judge',
    personalCode: 'p1000002',
    surname: 'Email',
    title: 'Mr'
  },
  {
    emailId: 'no.name@judicial.com',
    fullName: null,
    idamId: '38eb0c5e-29c7-453e-b92d-f2029aaed6c4',
    isJudge: 'Y',
    isMagistrate: 'Y',
    isPanelMember: 'Y',
    knownAs: 'Lead Judge',
    personalCode: 'p1000003',
    surname: 'Name',
    title: 'Mr'
  },
  {
    emailId: null,
    fullName: null,
    idamId: '38eb0c5e-29c7-453e-b92d-f2029aaed6c4',
    isJudge: 'Y',
    isMagistrate: 'Y',
    isPanelMember: 'Y',
    knownAs: 'Lead Judge',
    personalCode: 'p1000004',
    surname: 'Nothing',
    title: 'Mr'
  }
];

const SERVICE_DETAILS = [
  {
    ccd_service_name: 'CIVIL',
    org_unit: 'HMCTS',
    service_code: 'BBA3',
    service_id: 31
  }
] as HmctsServiceDetail[];

const CASE_TYPE_JUF: CaseType = {
  id: 'CTJUF',
  name: 'Case type Judicial User Field',
  description: '',
  states: [],
  events: [],
  case_fields: [],
  jurisdiction: null
};

const JURISDICTION_JUF: Jurisdiction = {
  id: 'JUF',
  name: 'Jurisdiction Judicial User Field',
  description: '',
  caseTypes: [CASE_TYPE_JUF],
};

@Pipe({
    name: 'ccdFirstError',
    pure: false,
    standalone: false
})
class MockFirstErrorPipe implements PipeTransform {
  transform(value: ValidationErrors, args?: string): string {
    const keys = Object.keys(value);
    return keys[0] === 'required' ? `${args || 'Field'} is required` : value[keys[0]];
  }
}

describe('WriteJudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<WriteJudicialUserFieldComponent>;
  let component: WriteJudicialUserFieldComponent;
  let jurisdictionService: jasmine.SpyObj<JurisdictionService>;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  let compoundPipe: jasmine.SpyObj<IsCompoundPipe>;
  let validatorsService: jasmine.SpyObj<FormValidatorsService>;
  let loadJudicialUserSpy: jasmine.Spy;
  let filterJudicialUsersSpy: jasmine.Spy;
  let nativeElement: any;
  let mockCaseNotifier: any;

  beforeEach(waitForAsync(() => {
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['searchJudicialUsers', 'searchJudicialUsersByPersonalCodes', 'getSelectedJurisdiction']);
    jurisdictionService.searchJudicialUsers.and.returnValue(of(JUDICIAL_USERS));
    jurisdictionService.searchJudicialUsersByPersonalCodes.and.returnValue(of([JUDICIAL_USERS[1]]));
    jurisdictionService.getSelectedJurisdiction.and.returnValue(of(JURISDICTION_JUF));
    sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: '1546518523959179', caseType: 'CIVIL', jurisdiction: 'CIVIL' }));
    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>('caseFlagRefdataService', ['getHmctsServiceDetailsByCaseType', 'getHmctsServiceDetailsByServiceName']);
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(of(SERVICE_DETAILS));
    caseFlagRefdataService.getHmctsServiceDetailsByServiceName.and.returnValue(of(SERVICE_DETAILS));
    compoundPipe = createSpyObj<IsCompoundPipe>('compoundPipe', ['transform']);
    compoundPipe.transform.and.returnValue(false);
    mockCaseNotifier = getMockCaseNotifier();
    validatorsService = createSpyObj<FormValidatorsService>('validatorsService', ['addValidators']);
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        PaletteUtilsModule
      ],
      declarations: [WriteJudicialUserFieldComponent, MockFirstErrorPipe, MockFieldLabelPipe, MockComponent({ selector: 'ccd-field-read', inputs: ['caseField'] })],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: JurisdictionService, useValue: jurisdictionService },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService },
        { provide: IsCompoundPipe, useValue: compoundPipe },
        { provide: FormValidatorsService, useValue: validatorsService },
        { provide: FirstErrorPipe, useValue: MockFirstErrorPipe },
        { provide: CaseNotifier, useValue: mockCaseNotifier }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WriteJudicialUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.formGroup = new FormGroup({});

    loadJudicialUserSpy = spyOn(component, 'loadJudicialUser').and.callThrough();
    filterJudicialUsersSpy = spyOn(component, 'filterJudicialUsers').and.callThrough();
    spyOn(FieldsUtils, 'addCaseFieldAndComponentReferences').and.callThrough();
    spyOn(component.formGroup, 'setControl').and.callThrough();
    spyOn(component, 'setupValidation').and.callThrough();
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create component', async () => {
    expect(component.formGroup.setControl).toHaveBeenCalledWith(`${FIELD_ID}_judicialUserControl`, component.judicialUserControl);
    expect(FieldsUtils.addCaseFieldAndComponentReferences).toHaveBeenCalledWith(
      component.judicialUserControl, component.caseField, component);
    expect(component.setupValidation).toHaveBeenCalled();
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'col';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('Jacky Collins (jacky.collins@judicial.com)');
    expect(component.jurisdiction).toEqual('CIVIL');
    expect(component.caseType).toEqual('CIVIL');
  });

  it('should set validation for the component when the field is not mandatory', () => {
    const idamIdField = component.complexGroup.get('idamId');
    const personalCodeField = component.complexGroup.get('personalCode');
    const judicialUserField = component.judicialUserControl;
    spyOn(idamIdField, 'clearValidators').and.callThrough();
    spyOn(personalCodeField, 'clearValidators').and.callThrough();
    spyOn(judicialUserField, 'setValidators').and.callThrough();
    component.setupValidation();
    expect(idamIdField.clearValidators).toHaveBeenCalled();
    expect(personalCodeField.clearValidators).toHaveBeenCalled();
    expect(judicialUserField.setValidators).not.toHaveBeenCalled();
  });

  it('should set validation for the component when the field is mandatory', () => {
    const idamIdField = component.complexGroup.get('idamId');
    const personalCodeField = component.complexGroup.get('personalCode');
    const judicialUserField = component.judicialUserControl;
    spyOn(idamIdField, 'clearValidators').and.callThrough();
    spyOn(personalCodeField, 'clearValidators').and.callThrough();
    spyOn(judicialUserField, 'setValidators').and.callThrough();
    CASE_FIELD.display_context = Constants.MANDATORY;
    component.setupValidation();
    expect(idamIdField.clearValidators).toHaveBeenCalled();
    expect(personalCodeField.clearValidators).toHaveBeenCalled();
    expect(judicialUserField.setValidators).toHaveBeenCalledWith(Validators.required);
  });

  it('should display "No results found" if there are no matches for the search term', async () => {
    jurisdictionService.searchJudicialUsers.and.returnValue(of([]));
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'abc';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('No results found');
  });

  it('should return undefined if an error occurred searching for judicial users', async () => {
    jurisdictionService.searchJudicialUsers.and.returnValue(throwError(new Error('An error occurred')));
    filterJudicialUsersSpy.calls.reset();
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'col';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.filterJudicialUsers).toHaveBeenCalledWith('col');
    let filteredJudicialUsers: JudicialUserModel[];
    component.filteredJudicialUsers$.subscribe(judicialUsers => filteredJudicialUsers = judicialUsers);
    expect(filteredJudicialUsers).toEqual(undefined);
  });

  it('should display "Invalid search term" if an error occurred searching for judicial users', async () => {
    jurisdictionService.searchJudicialUsers.and.returnValue(throwError(new Error('An error occurred')));
    filterJudicialUsersSpy.calls.reset();
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = '123';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.filterJudicialUsers).toHaveBeenCalledWith('123');
    expect(component.invalidSearchTerm).toBe(true);
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('Invalid search term');
  });

  it('should allow the user to search for a judicial user after an error has occurred', async () => {
    jurisdictionService.searchJudicialUsers.and.returnValue(throwError(new Error('An error occurred')));
    filterJudicialUsersSpy.calls.reset();
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = '123';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.filterJudicialUsers).toHaveBeenCalledWith('123');
    expect(component.invalidSearchTerm).toBe(true);
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('Invalid search term');
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[0]]));
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'col';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.filterJudicialUsers).toHaveBeenCalledWith('col');
    expect(component.invalidSearchTerm).toBe(false);
    expect(autocompleteOptions.children[0].textContent).toContain('Jacky Collins (jacky.collins@judicial.com)');
  });

  it('should load judicial user', () => {
    // The caseField.value.personalCode property is present, so loadJudicialUser() should be called
    expect(component.loadJudicialUser).toHaveBeenCalledWith('1234567');
    expect(jurisdictionService.searchJudicialUsersByPersonalCodes).toHaveBeenCalledWith(['1234567']);
    expect(component.judicialUserControl.value).toEqual(JUDICIAL_USERS[1]);
  });

  it('should not load judicial user', () => {
    // The caseField.value.personalCode property is not present, so loadJudicialUser() should not be called
    component.caseField.value.personalCode = null;
    loadJudicialUserSpy.calls.reset();
    component.ngOnInit();
    expect(component.loadJudicialUser).not.toHaveBeenCalled();
  });

  it('should not do anything if loadJudicialUser() is called with a null personalCode', () => {
    jurisdictionService.searchJudicialUsersByPersonalCodes.calls.reset();
    component.judicialUserControl.setValue(null);
    component.loadJudicialUser(null);
    expect(jurisdictionService.searchJudicialUsersByPersonalCodes).not.toHaveBeenCalled();
    expect(component.judicialUserControl.value).toBeNull();
  });

  it('should set jurisdiction and case type', () => {
    expect(component.jurisdiction).toEqual('CIVIL');
    expect(component.caseType).toEqual('CIVIL');
  });

  it('should search for judicial users for the specified case type ID', () => {
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.calls.reset();
    jurisdictionService.searchJudicialUsers.calls.reset();
    component.jurisdiction = 'BBA3';
    component.caseType = 'CIVIL';
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[0]]));
    // Subscribe to the observable to execute it and trigger calls to services
    let filteredJudicialUsers: JudicialUserModel[];
    component.filterJudicialUsers('jas').subscribe(judicialUsers => filteredJudicialUsers = judicialUsers);
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith('CIVIL');
    expect(caseFlagRefdataService.getHmctsServiceDetailsByServiceName).not.toHaveBeenCalled();
    expect(jurisdictionService.searchJudicialUsers).toHaveBeenCalled();
    expect(filteredJudicialUsers).toEqual([JUDICIAL_USERS[0]]);
  });

  it('should search for judicial users for the specified jurisdiction if lookup by case type ID failed', () => {
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.calls.reset();
    jurisdictionService.searchJudicialUsers.calls.reset();
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(throwError(new Error('Unknown case type ID')));
    component.jurisdiction = 'BBA3';
    component.caseType = 'CIVIL';
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[0]]));
    // Subscribe to the observable to execute it and trigger calls to services
    let filteredJudicialUsers: JudicialUserModel[];
    component.filterJudicialUsers('jas').subscribe(judicialUsers => filteredJudicialUsers = judicialUsers);
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith('CIVIL');
    expect(caseFlagRefdataService.getHmctsServiceDetailsByServiceName).toHaveBeenCalledWith('BBA3');
    expect(jurisdictionService.searchJudicialUsers).toHaveBeenCalled();
    expect(filteredJudicialUsers).toEqual([JUDICIAL_USERS[0]]);
  });

  it('should set the caseField value and FormControl values when a judicial user is selected', () => {
    component.onSelectionChange({
      source: {
        value: JUDICIAL_USERS[1]
      }
    });
    expect(component.caseField.value).toEqual({
      idamId: '38eb0c5e-29c7-453e-b92d-f2029aaed6c2',
      personalCode: 'p1000001'
    });
    expect(component.complexGroup.get('idamId').value).toEqual('38eb0c5e-29c7-453e-b92d-f2029aaed6c2');
    expect(component.complexGroup.get('personalCode').value).toEqual('p1000001');
    expect(component.judicialUserSelected).toBe(true);
  });

  it('should use the judicial user\'s full name and email address for display', () => {
    const displayNameAndEmail = component.displayJudicialUser(JUDICIAL_USERS[0]);
    expect(displayNameAndEmail).toEqual('Jacky Collins (jacky.collins@judicial.com)');
  });

  it('should not display anything if the judicial user is falsy', () => {
    const displayNameAndEmail = component.displayJudicialUser(null);
    expect(displayNameAndEmail).toBeUndefined();
  });

  it('should show nothing for the user\'s full name and/or email in the JudicialUser field if these are not available', () => {
    let displayNameAndEmail = component.displayJudicialUser(JUDICIAL_USERS[2]);
    expect(displayNameAndEmail).toEqual('No Email');
    displayNameAndEmail = component.displayJudicialUser(JUDICIAL_USERS[3]);
    expect(displayNameAndEmail).toEqual(' (no.name@judicial.com)');
    displayNameAndEmail = component.displayJudicialUser(JUDICIAL_USERS[4]);
    expect(displayNameAndEmail).toEqual('');
  });

  it('should show nothing for the user\'s full name and/or email in the autocomplete list if these are not available', async () => {
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[2]]));
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'ema';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toEqual(' No Email ');
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[3]]));
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'nam';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    // Extra space before email address is expected; it would normally be preceded by the user's full name
    expect(autocompleteOptions.children[0].textContent).toEqual('  (no.name@judicial.com) ');
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[4]]));
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'not';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(autocompleteOptions.children[0].textContent.trim()).toEqual('');
  });

  it('should clear the field if the user searches for a judicial user but makes no selection', async () => {
    const judicialUserField = component.judicialUserControl;
    spyOn(judicialUserField, 'setValue').and.callThrough();
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[0]]));
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'col';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('Jacky Collins (jacky.collins@judicial.com)');
    selectedJudicial.dispatchEvent(new InputEvent('blur'));
    expect(judicialUserField.setValue).toHaveBeenCalledWith(null);
  });

  it('should not clear the field if the user searches for a judicial user, makes no selection but did previously', async () => {
    // Simulate the user having made a selection already
    component.onSelectionChange({
      source: {
        value: JUDICIAL_USERS[1]
      }
    });
    expect(component.judicialUserSelected).toBe(true);
    const judicialUserField = component.judicialUserControl;
    spyOn(judicialUserField, 'setValue').and.callThrough();
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[0]]));
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'col';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(By.css('.mat-autocomplete-panel')).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('Jacky Collins (jacky.collins@judicial.com)');
    selectedJudicial.dispatchEvent(new InputEvent('blur'));
    expect(judicialUserField.setValue).not.toHaveBeenCalledWith(null);
  });

  it('should clear the CaseField value, and idamId and personalCode values if the user clears the judicial user field', async () => {
    component.caseField.value = {
      idamId: 'Test',
      personalCode: 'Test'
    };
    const idamIdField = component.complexGroup.get('idamId');
    const personalCodeField = component.complexGroup.get('personalCode');
    spyOn(idamIdField, 'setValue').and.callThrough();
    spyOn(personalCodeField, 'setValue').and.callThrough();
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = '';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    selectedJudicial.dispatchEvent(new InputEvent('blur'));
    expect(component.caseField.value).toBeNull();
    expect(idamIdField.setValue).toHaveBeenCalledWith(null);
    expect(personalCodeField.setValue).toHaveBeenCalledWith(null);
  });

  it('should display an error message if there is a validation error', () => {
    component.errors = {
      required: true
    };
    fixture.detectChanges();
    const errorMessageElement = fixture.debugElement.query(By.css('.error-message')).nativeElement;
    expect(errorMessageElement.textContent).toContain('Judicial User is required');
  });

});
