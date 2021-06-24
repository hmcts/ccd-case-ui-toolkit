import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CaseEditConfirmComponent } from './case-edit-confirm.component';
import { By } from '@angular/platform-browser';
import { WizardPage } from '../domain/wizard-page.model';
import { MarkdownModule } from '../../markdown/markdown.module';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { CcdCaseTitlePipe } from '../../../pipes/case-title/ccd-case-title.pipe';
import { FieldsUtils } from '../../../services/fields';
import { PlaceholderService } from '../../../directives/substitutor/services';
import { CaseField } from '../../../domain';
import { aCaseField } from '../../../fixture/shared.test.fixture';

describe('CaseEditConfirmComponent', () => {
  let fixture: ComponentFixture<CaseEditConfirmComponent>;
  let component: CaseEditConfirmComponent;
  let de: DebugElement;

  let routerStub: any;
  let caseEditComponentStub: any;

  let firstPage = new WizardPage();

  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({'PersonLastName': new FormControl('Khaleesi')})
  });
  routerStub = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  const caseField1: CaseField = aCaseField('TetsField1', 'TetsField1', 'Text', 'OPTIONAL', 1);
  const caseField2: CaseField = aCaseField('TetsField2', 'TetsField2', 'Text', 'OPTIONAL', 2);
  const caseField3: CaseField = aCaseField('TetsField3', 'TetsField3', 'Text', 'OPTIONAL', 3);

  beforeEach(async(() => {
    firstPage.id = 'first page';
    caseEditComponentStub = {
      'form': FORM_GROUP,
      'data': '',
      'eventTrigger': {'case_fields': [caseField1, caseField2, caseField3]},
      'hasPrevious': () => true,
      'getPage': () => firstPage,
      'confirmation': {
        'getCaseId': () => 'case1',
        'getStatus': () => 'status1',
        'getHeader': () => 'Header',
        'getBody': () => 'A body with mark down'
      },
      'caseDetails': {'case_id': '1234567812345678', 'tabs': [{id: 'tab1', label: 'tabLabel1',
        fields: [caseField1, caseField2, caseField3]}], 'metadataFields': [],
        'state': {'id': '1', 'name': 'Incomplete Application', 'title_display': '# 1234567812345678: test'}},
    };
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          RouterTestingModule,
          MarkdownModule,
        ],
        declarations: [
          CaseEditConfirmComponent,
          CaseReferencePipe,
          CcdCaseTitlePipe
          // Mock
        ],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponentStub},
          {provide: Router, useValue: routerStub},
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

  it('should render a confirmation-header', () => {
    de = fixture.debugElement.query(By.css('#confirmation-header'));
    expect(de.nativeElement.textContent).toBeDefined();
    expect(de.nativeElement.textContent.trim()).toEqual('Header');
  });

  it('should render an confirmation-body', () => {
    de = fixture.debugElement.query(By.css('#confirmation-body'));
    expect(de.nativeElement.textContent).toBeDefined();
    expect(de.nativeElement.textContent.trim()).toEqual('A body with mark down');
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

  beforeEach(async(() => {
    caseEditCompStub = {
      'eventTrigger': {'case_fields': []},
    };
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          RouterTestingModule,
          MarkdownModule,
        ],
        declarations: [
          CaseEditConfirmComponent,
          CaseReferencePipe,
          CcdCaseTitlePipe
          // Mock
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

  beforeEach(() => {
  });

  it('should call route when no confirmation provided', () => {
    expect(routerStub.navigate).toHaveBeenCalled();
  });
});
