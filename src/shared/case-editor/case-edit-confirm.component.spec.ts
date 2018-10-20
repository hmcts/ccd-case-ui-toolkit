import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseEditComponent } from './case-edit.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CaseEditConfirmComponent } from './case-edit-confirm.component';
import { By } from '@angular/platform-browser';
import { WizardPage } from '../domain/wizard-page.model';
import { MarkdownModule } from '../markdown/markdown.module';
import { CaseReferencePipe } from '../utils/case-reference.pipe';

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

  beforeEach(async(() => {
    firstPage.id = 'first page';
    caseEditComponentStub = {
      'form': FORM_GROUP,
      'data': '',
      'eventTrigger': {'case_fields': []},
      'hasPrevious': () => true,
      'getPage': () => firstPage,
      'confirmation': {
        'getCaseId': () => 'case1',
        'getStatus': () => 'status1',
        'getHeader': () => 'Header',
        'getBody': () => 'A body with mark down'
      }
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
          // Mock
        ],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponentStub},
          {provide: Router, useValue: routerStub}
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
    caseEditCompStub = {};
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
          // Mock
        ],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditCompStub},
          {provide: Router, useValue: routerStub}
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
