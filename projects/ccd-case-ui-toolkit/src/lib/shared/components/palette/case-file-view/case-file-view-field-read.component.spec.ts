import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField } from '../../../domain';
import { CaseFileViewService, DocumentManagementService, LoadingService } from '../../../services';
import { mockDocumentManagementService } from '../../../services/document-management/document-management.service.mock';
import { CaseFileViewFieldReadComponent } from './case-file-view-field-read.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseFileViewFieldReadComponent', () => {
  let component: CaseFileViewFieldReadComponent;
  let fixture: ComponentFixture<CaseFileViewFieldReadComponent>;
  let mockCaseFileViewService: jasmine.SpyObj<CaseFileViewService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  const mockSnapshot = {
    paramMap: createSpyObj('paramMap', ['get']),
  };
  const mockRoute = {
    params: of({ cid: '1234123412341234' }),
    snapshot: mockSnapshot
  };
  const mockCaseFieldTrue = {
    acls: [
      {
        create: true,
        read: true,
        update: true,
        delete: false,
        role: 'caseworker-privatelaw-judge'
      },
      {
        create: true,
        read: true,
        update: true,
        delete: false,
        role: 'caseworker-privatelaw-la'
      },

    ]
  };

  const mockCaseFieldFalse = {
    acls: [
      {
        create: true,
        read: true,
        update: false,
        delete: false,
        role: 'caseworker-privatelaw-judge'
      },
      {
        create: true,
        read: true,
        update: false,
        delete: false,
        role: 'caseworker-privatelaw-la'
      },

    ]
  };

  beforeEach(() => {
    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService', ['getCategoriesAndDocuments']);
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(of(null));

    mockLoadingService = createSpyObj<LoadingService>('LoadingService', ['register', 'unregister']);
    mockLoadingService.register.and.returnValue('loadingToken');
    mockLoadingService.unregister.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        CaseFileViewFieldReadComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseFileViewService, useValue: mockCaseFileViewService },
        { provide: DocumentManagementService, useValue: mockDocumentManagementService },
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFieldReadComponent);
    component = fixture.componentInstance;
  });

  it('should set allowMoving to true based on acl update being true', () => {
    component.caseField = new CaseField();
    component.caseField.acls = mockCaseFieldTrue.acls;

    fixture.detectChanges();
    expect(component.allowMoving).toBeTruthy()
  });

  it('should set allowMoving to false based on acl update being false', () => {
    component.caseField = new CaseField();
    component.caseField.acls = mockCaseFieldFalse.acls;

    fixture.detectChanges();
    expect(component.allowMoving).toBeFalsy()
  });
});