import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownComponent } from '../../../components/palette/markdown/markdown.component';
import { PlaceholderService } from '../../../directives/substitutor/services';
import { CaseField } from '../../../domain';
import { aCaseField } from '../../../fixture/shared.test.fixture';
import { PipesModule } from '../../../pipes';
import { FieldsUtils } from '../../../services/fields';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { WizardPage } from '../domain/wizard-page.model';
import { ConvertHrefToRouterService } from '../services';
import { CaseEditConfirmComponent } from './case-edit-confirm.component';

describe('CaseEditConfirmComponent', () => {
  let fixture: ComponentFixture<CaseEditConfirmComponent>;
  let component: CaseEditConfirmComponent;
  let de: DebugElement;

  let routerStub: any;
  let caseEditComponentStub: any;

  const firstPage = new WizardPage();

  const FORM_GROUP = new FormGroup({
    data: new FormGroup({PersonLastName: new FormControl('Khaleesi')})
  });
  routerStub = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  const caseField1: CaseField = aCaseField('TetsField1', 'TetsField1', 'Text', 'OPTIONAL', 1);
  const caseField2: CaseField = aCaseField('TetsField2', 'TetsField2', 'Text', 'OPTIONAL', 2);
  const caseField3: CaseField = aCaseField('TetsField3', 'TetsField3', 'Text', 'OPTIONAL', 3);
  let convertHrefToRouterService;

  beforeEach(waitForAsync(() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['updateHrefLink']);
    firstPage.id = 'first page';
    caseEditComponentStub = {
      form: FORM_GROUP,
      data: '',
      eventTrigger: {case_fields: [caseField1, caseField2, caseField3]},
      hasPrevious: () => true,
      getPage: () => firstPage,
      confirmation: {
        getCaseId: () => 'case1',
        getStatus: () => 'status1',
        getHeader: () => 'Header',
        getBody: () => 'A body with mark down'
      },
      caseDetails: {case_id: '1234567812345678', tabs: [{id: 'tab1', label: 'tabLabel1',
        fields: [caseField1, caseField2, caseField3]}], metadataFields: [],
        state: {id: '1', name: 'Incomplete Application', title_display: '# 1234567812345678: test'}},
    };
    TestBed
      .configureTestingModule({
        imports: [
          HttpClientTestingModule,
          ReactiveFormsModule,
          RouterTestingModule,
          PipesModule,
        ],
        declarations: [
          CaseEditConfirmComponent,
          MarkdownComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: CaseEditComponent, useValue: caseEditComponentStub },
          { provide: Router, useValue: routerStub },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
          FieldsUtils,
          PlaceholderService
        ]
      })
      .compileComponents();
    fixture = TestBed.createComponent(CaseEditConfirmComponent);
    component = fixture.componentInstance;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  beforeEach(() => {
  });

  it('should pass the right text to the ccd-markdown content ' +
    'input property inside #confirmation-header', () => {
    de = fixture.debugElement.query(By.css('#confirmation-header ccd-markdown'));
    const contentInputValue = de.componentInstance.content;

    expect(contentInputValue).toBeDefined();
    expect(contentInputValue.trim()).toEqual('Header');
  });

  it('should pass the right text to the ccd-markdown content ' +
    'input property inside #confirmation-body', () => {
    de = fixture.debugElement.query(By.css('#confirmation-body ccd-markdown'));
    const contentInputValue = de.componentInstance.content;

    expect(contentInputValue).toBeDefined();
    expect(contentInputValue).toEqual('A body with mark down');
  });

  it('should show valid title on the page', () => {
    const title = component.getCaseTitle();
    expect(title).toEqual('# 1234567812345678: test');
  });

  it('should return case fields count', () => {
    const caseFields: CaseField[] = component.caseFields;
    expect(caseFields.length).toBe(3);
  });
});

describe('CaseEditConfirmComponent', () => {
  let fixture: ComponentFixture<CaseEditConfirmComponent>;
  let component: CaseEditConfirmComponent;

  let routerStub: any;
  let caseEditCompStub: any;

  routerStub = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  beforeEach(waitForAsync(() => {
    caseEditCompStub = {
      eventTrigger: {case_fields: []},
    };
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          RouterTestingModule,
          PipesModule
        ],
        declarations: [
          CaseEditConfirmComponent,
          MarkdownComponent,
          // Mock
          MockRpxTranslatePipe
        ],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditCompStub},
          {provide: Router, useValue: routerStub},
          FieldsUtils,
          PlaceholderService
        ]
      })
      .compileComponents();
    fixture = TestBed.createComponent(CaseEditConfirmComponent);
    component = fixture.componentInstance;
  }));

  it('should call route when no confirmation provided', () => {
    expect(routerStub.navigate).toHaveBeenCalled();
  });
});
