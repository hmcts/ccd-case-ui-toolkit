import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HmctsServiceDetail } from '../../../domain/case-flag';
import { CaseField, FieldType } from '../../../domain/definition';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { CaseFlagRefdataService } from '../../../services/case-flag/case-flag-refdata.service';
import { HttpService } from '../../../services/http/http.service';
import { JurisdictionService } from '../../../services/jurisdiction/jurisdiction.service';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { PaletteUtilsModule } from '../utils';
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
  let httpService: HttpService;
  let jurisdictionService: any;
  let sessionStorageService: any;
  let caseFlagRefdataService: any;
  let activatedRoute: any;
  let nativeElement: any;

  beforeEach(waitForAsync(() => {
    httpService = jasmine.createSpyObj<HttpService>('httpService', ['get', 'post']);
    jurisdictionService = createSpyObj<JurisdictionService>('JurisdictionService', ['searchJudicialUsers', 'searchJudicialUsersByPersonalCodes']);
    jurisdictionService.searchJudicialUsers.and.returnValue(of(JUDICIAL_USERS));
    jurisdictionService.searchJudicialUsersByPersonalCodes.and.returnValue(of([JUDICIAL_USERS[1]]));
    sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify({cid: '1546518523959179', caseType: 'Benefit', jurisdiction: 'SSCS'}));
    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>('caseFlagRefdataService', ['getHmctsServiceDetailsByCaseType', 'getHmctsServiceDetailsByServiceName']);
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(of(SERVICE_DETAILS));
    caseFlagRefdataService.getHmctsServiceDetailsByServiceName.and.returnValue(of(SERVICE_DETAILS));
    activatedRoute = {
      snapshot: {
        params: {
          jid: 'BBA3'
        }
      }
    };
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        MatAutocompleteModule,
        PaletteUtilsModule
      ],
      declarations: [WriteJudicialUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: JurisdictionService, useValue: jurisdictionService },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteJudicialUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create', async() => {
    component.filteredJudicialUsers = JUDICIAL_USERS;
    fixture.detectChanges();
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

  it('should load judicial user', () => {
    component.loadJudicialUser('p1000001');
    expect(component.idamIdFormControl.value).toEqual('Jasmine Chiswell (jasmine.chiswell@judicial.com)');
    expect(component.personalCodeFormControl.value).toEqual('p1000001');
  });

  it('should set jurisdiction and case type', () => {
    component.setJurisdictionAndCaseType();
    expect(component.jurisdiction).toEqual('SSCS');
    expect(component.caseType).toEqual('Benefit');
  });

  it('should search for judicial users', () => {
    component.jurisdiction = 'BBA3';
    component.caseType = 'Benefit';
    fixture.detectChanges();
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith('Benefit');
    expect(jurisdictionService.searchJudicialUsers).toHaveBeenCalled();
    expect(component.idamIdFormControl.value).toEqual('Jasmine Chiswell (jasmine.chiswell@judicial.com)');
  });

  it('should set the form control values when a judicial user is selected', () => {
    component.onSelectionChange(JUDICIAL_USERS[1]);
    expect(component.idamIdFormControl.value).toEqual('Jasmine Chiswell (jasmine.chiswell@judicial.com)');
    expect(component.personalCodeFormControl.value).toEqual('p1000001');
  });

  it('should unsubscribe', () => {
    spyOn(component.sub, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.sub.unsubscribe).toHaveBeenCalled();
  });
});
