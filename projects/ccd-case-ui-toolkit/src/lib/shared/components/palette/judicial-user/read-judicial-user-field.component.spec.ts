import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField, FieldType } from '../../../domain/definition';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { HttpService } from '../../../services/http/http.service';
import { JurisdictionService } from '../../../services/jurisdiction/jurisdiction.service';
import { ReadJudicialUserFieldComponent } from './read-judicial-user-field.component';
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
const IDAM_ID: CaseField = {
  id: 'idamId',
  label: 'IdamId',
  field_type: {id: 'Text', type: 'Text'}
} as CaseField;

const PERSONAL_CODE: CaseField = {
  id: 'personalCode',
  label: 'PersonalCode',
  field_type: {id: 'Text', type: 'Text'}
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

describe('ReadJudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<ReadJudicialUserFieldComponent>;
  let component: ReadJudicialUserFieldComponent;
  let httpService: HttpService;
  let jurisdictionService: any;
  let nativeElement: any;

  beforeEach(async(() => {
    httpService = createSpyObj<HttpService>('HttpService', ['get', 'post']);
    jurisdictionService = createSpyObj<JurisdictionService>('JurisdictionService', ['searchJudicialUsersByPersonalCodes']);
    jurisdictionService.searchJudicialUsersByPersonalCodes.and.returnValue(of(JUDICIAL_USERS));
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      declarations: [ReadJudicialUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: JurisdictionService, useValue: jurisdictionService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadJudicialUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and set judicial user', () => {
    expect(component.judicialUser).toEqual(JUDICIAL_USERS[0]);
  });

  it('should unsubscribe', () => {
    spyOn(component.sub, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.sub.unsubscribe).toHaveBeenCalled();
  });
});
