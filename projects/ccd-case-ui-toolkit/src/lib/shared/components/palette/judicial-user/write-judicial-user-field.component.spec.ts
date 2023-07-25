import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { HmctsServiceDetail } from '../../../domain/case-flag';
import { CaseField, FieldType } from '../../../domain/definition';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { CaseFlagRefdataService, FormValidatorsService, JurisdictionService, SessionStorageService } from '../../../services';
import { IsCompoundPipe, PaletteUtilsModule } from '../utils';
import { WriteJudicialUserFieldComponent } from './write-judicial-user-field.component';
import createSpyObj = jasmine.createSpyObj;

const VALUE = {
  idamId: 'idam123',
  personalCode: '1234567'
};
const FIELD_ID = 'JudicialUserField';
const FIELD_TYPE: FieldType = {
  id: 'JudicialUser',
  type: 'Complex',
};
const IDAM_ID: CaseField ={
  id: 'idamId',
  label: 'IdamId',
  field_type: {id: 'Text', type: 'Text'}
} as CaseField;

const PERSONAL_CODE: CaseField = {
  id: 'personalCode',
  label: 'PersonalCode',
  field_type: {id: 'Text', type: 'Text'}
}as CaseField;

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
    title: 'Mr'
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
    title: 'Mr'
  }
];

const SERVICE_DETAILS = [
  {
    ccd_service_name: 'SSCS',
    org_unit: 'HMCTS',
    service_code: 'BBA3',
    service_id: 31
  }
] as HmctsServiceDetail[];

describe('WriteJudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<WriteJudicialUserFieldComponent>;
  let component: WriteJudicialUserFieldComponent;
  let jurisdictionService: jasmine.SpyObj<JurisdictionService>;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  let compoundPipe: jasmine.SpyObj<IsCompoundPipe>;
  let validatorsService: jasmine.SpyObj<FormValidatorsService>;
  let loadJudicialUserSpy: jasmine.Spy;
  let nativeElement: any;

  beforeEach(waitForAsync(() => {
    jurisdictionService = createSpyObj<JurisdictionService>('jurisdictionService', ['searchJudicialUsers', 'searchJudicialUsersByPersonalCodes']);
    jurisdictionService.searchJudicialUsers.and.returnValue(of(JUDICIAL_USERS));
    jurisdictionService.searchJudicialUsersByPersonalCodes.and.returnValue(of([JUDICIAL_USERS[1]]));
    sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify({cid: '1546518523959179', caseType: 'Benefit', jurisdiction: 'SSCS'}));
    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>('caseFlagRefdataService', ['getHmctsServiceDetailsByCaseType', 'getHmctsServiceDetailsByServiceName']);
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(of(SERVICE_DETAILS));
    caseFlagRefdataService.getHmctsServiceDetailsByServiceName.and.returnValue(of(SERVICE_DETAILS));
    compoundPipe = createSpyObj<IsCompoundPipe>('compoundPipe', ['transform']);
    compoundPipe.transform.and.returnValue(false);
    validatorsService = createSpyObj<FormValidatorsService>('validatorsService', ['addValidators']);

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        PaletteUtilsModule
      ],
      declarations: [WriteJudicialUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: JurisdictionService, useValue: jurisdictionService },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService },
        { provide: IsCompoundPipe, useValue: compoundPipe },
        { provide: FormValidatorsService, useValue: validatorsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteJudicialUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.formGroup = new FormGroup({});
    loadJudicialUserSpy = spyOn(component, 'loadJudicialUser').and.callThrough();
    spyOn(component, 'filterJudicialUsers').and.callThrough();
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create component', async() => {
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'col';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(
      By.css('.mat-autocomplete-panel')
    ).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('Jacky Collins');
    expect(component.jurisdiction).toEqual('SSCS');
    expect(component.caseType).toEqual('Benefit');
  });

  it('should display "No results found" if there are no matches for the search term', async() => {
    jurisdictionService.searchJudicialUsers.and.returnValue(of([]));
    const selectedJudicial = nativeElement.querySelector('#JudicialUserField');
    selectedJudicial.dispatchEvent(new Event('focusin'));
    selectedJudicial.value = 'abc';
    selectedJudicial.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const autocompleteOptions = fixture.debugElement.query(
      By.css('.mat-autocomplete-panel')
    ).nativeElement;
    expect(autocompleteOptions.children[0].textContent).toContain('No results found');
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

  it('should set jurisdiction and case type', () => {
    component.setJurisdictionAndCaseType();
    expect(component.jurisdiction).toEqual('SSCS');
    expect(component.caseType).toEqual('Benefit');
  });

  it('should search for judicial users', () => {
    component.jurisdiction = 'BBA3';
    component.caseType = 'Benefit';
    jurisdictionService.searchJudicialUsers.and.returnValue(of([JUDICIAL_USERS[0]]));
    // Subscribe to the observable to execute it and trigger calls to services
    let filteredJudicialUsers: JudicialUserModel[];
    component.filterJudicialUsers('jas').subscribe(judicialUsers => filteredJudicialUsers = judicialUsers);
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith('Benefit');
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
  });

  it('should use the judicial user\'s full name and email address for display', () => {
    const displayNameAndEmail = component.displayJudicialUser(JUDICIAL_USERS[0]);
    expect(displayNameAndEmail).toEqual('Jacky Collins (jacky.collins@judicial.com)');
  });
});
