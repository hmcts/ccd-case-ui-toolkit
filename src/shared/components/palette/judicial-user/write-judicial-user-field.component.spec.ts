import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField, FieldType } from '../../../domain/definition';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { HttpService } from '../../../services/http/http.service';
import { JurisdictionService } from '../../../services/jurisdiction/jurisdiction.service';
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
const IDAM_ID: CaseField = <CaseField>({
  id: 'idamId',
  label: 'IdamId',
  field_type: {id: 'Text', type: 'Text'}
});
const PERSONAL_CODE: CaseField = <CaseField>({
  id: 'personalCode',
  label: 'PersonalCode',
  field_type: {id: 'Text', type: 'Text'}
});
const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'Judicial User',
  display_context: 'OPTIONAL',
  field_type: {
    ...FIELD_TYPE,
    complex_fields: [IDAM_ID, PERSONAL_CODE]
  },
  value: VALUE,
  retain_hidden_value: true
});
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

describe('WriteJudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<WriteJudicialUserFieldComponent>;
  let component: WriteJudicialUserFieldComponent;
  let httpService: HttpService;
  let jurisdictionService: any;
  let activatedRoute: any;
  let nativeElement: any;

  beforeEach(async(() => {
    httpService = jasmine.createSpyObj<HttpService>('httpService', ['get', 'post']);
    jurisdictionService = createSpyObj<JurisdictionService>('JurisdictionService', ['searchJudicialUsers']);
    jurisdictionService.searchJudicialUsers.and.returnValue(of(JUDICIAL_USERS));
    activatedRoute = {
      snapshot: {
        params: {
          'jid': 'BBA3'
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
        { provide: JurisdictionService, useValue: jurisdictionService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteJudicialUserFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('abc', async() => {
    const inputElement = fixture.debugElement.query(By.css('input')); // Returns DebugElement
    inputElement.nativeElement.dispatchEvent(new Event('focusin'));
    inputElement.nativeElement.value = 'jac';
    inputElement.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const matOptions = document.querySelectorAll('mat-option');
    console.log('MAT OPTIONS', matOptions);

    expect(component.jurisdictionId).toEqual('BBA3');
  });

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
    expect(component.jurisdictionId).toEqual('BBA3');
  });

  it('should search for judicial users call searchJudicialUsers api', () => {
    component.jurisdictionId = 'BBA3';
    component.filter('Jac');
    expect(jurisdictionService.searchJudicialUsers).toHaveBeenCalledWith('Jac', 'BBA3');
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
