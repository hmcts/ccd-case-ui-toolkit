import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { CaseField } from '../../../domain';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../domain/case-file-view';
import { CaseFileViewService, DocumentManagementService, LoadingService } from '../../../services';
import { mockDocumentManagementService } from '../../../services/document-management/document-management.service.mock';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;
  let mockCaseFileViewService: jasmine.SpyObj<CaseFileViewService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockSessionStorageService: jasmine.SpyObj<SessionStorageService>;
  const cidParam = '1234123412341234';
  let mockRoute: { params: Observable<{ cid: string }>, snapshot: { paramMap: SpyObj<any> } };

  const mockCaseFieldTrue = {
    acls: [
      {
        create: true,
        read: true,
        update: true,
        delete: false,
        role: 'caseworker-privatelaw-judge'
      }
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
    ]
  };
  const mockUser: string = JSON.stringify({ roles: ['caseworker-privatelaw-judge'] });

  beforeEach(waitForAsync(() => {
    mockRoute = {
      params: of({cid: cidParam}),
      snapshot: {
        paramMap: createSpyObj('paramMap', ['get']),
      }
    };
    mockRoute.snapshot.paramMap.get.and.returnValue(cidParam);

    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService',
      ['getCategoriesAndDocuments', 'updateDocumentCategory']
    );
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(of(null));

    mockLoadingService = createSpyObj<LoadingService>('LoadingService', ['register', 'unregister']);
    mockLoadingService.register.and.returnValue('loadingToken');
    mockLoadingService.unregister.and.returnValue(null);

    mockSessionStorageService = createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);
    mockSessionStorageService.getItem.and.returnValue(mockUser);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        CaseFileViewFieldComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseFileViewService, useValue: mockCaseFileViewService },
        { provide: DocumentManagementService, useValue: mockDocumentManagementService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: SessionStorageService, useValue: mockSessionStorageService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFieldComponent);
    component = fixture.componentInstance;
    component.caseField = new CaseField();
    component.caseField.acls = mockCaseFieldTrue.acls;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(mockCaseFileViewService.getCategoriesAndDocuments).toHaveBeenCalled();
    expect(component.getCategoriesAndDocumentsError).toBe(false);
    const nativeElement = fixture.debugElement.nativeElement;
    const errorMessageHeadingElement = nativeElement.querySelector('.govuk-heading-xl');
    expect(errorMessageHeadingElement).toBeNull();
    const errorMessageBodyElement = nativeElement.querySelector('.govuk-body');
    expect(errorMessageBodyElement).toBeNull();
    const caseFileViewHeadingElement = nativeElement.querySelector('.govuk-heading-l');
    expect(caseFileViewHeadingElement).toBeTruthy();
    const caseFileViewElement = nativeElement.querySelector('#case-file-view');
    expect(caseFileViewElement).toBeTruthy();
  });

  it('should display an error message if the service is unavilable to get categories and documents', () => {
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(throwError(new Error('Unable to retrieve data')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.getCategoriesAndDocumentsError).toBe(true);
    const nativeElement = fixture.debugElement.nativeElement;
    const errorMessageHeadingElement = nativeElement.querySelector('.govuk-heading-xl');
    expect(errorMessageHeadingElement).toBeTruthy();
    const errorMessageBodyElement = nativeElement.querySelector('.govuk-body');
    expect(errorMessageBodyElement).toBeTruthy();
    const caseFileViewHeadingElement = nativeElement.querySelector('.govuk-heading-l');
    expect(caseFileViewHeadingElement).toBeNull();
    const caseFileViewElement = nativeElement.querySelector('#case-file-view');
    expect(caseFileViewElement).toBeNull();
  });

  it('should set currentDocument when calling setMediaViewerFile', () => {
    const dummyNodeTreeDocument = new DocumentTreeNode();
    dummyNodeTreeDocument.name = 'dummy_document.pdf';
    dummyNodeTreeDocument.type = DocumentTreeNodeType.DOCUMENT;
    dummyNodeTreeDocument.document_filename = 'dummy_document.pdf';
    dummyNodeTreeDocument.document_binary_url = '/test/binary';

    component.setMediaViewerFile(dummyNodeTreeDocument);
    fixture.detectChanges();

    expect(component.currentDocument.document_filename).toEqual(dummyNodeTreeDocument.document_filename);
    expect(component.currentDocument.document_binary_url).toEqual(dummyNodeTreeDocument.document_binary_url);
  });

  it('should set allowMoving to true based on acl update being true', () => {
    component.caseField.acls = mockCaseFieldTrue.acls;
    fixture.detectChanges();
    expect(component.allowMoving).toBeTruthy();
  });

  it('should set allowMoving to false based on acl update being false', () => {
    component.caseField.acls = mockCaseFieldFalse.acls;
    fixture.detectChanges();
    expect(component.allowMoving).toBeFalsy();
  });

  it('should reset error messages when calling resetErrorMessages', () => {
    expect(component.errorMessages.length).toBe(0);
    component.errorMessages = ['Error 1', 'Error 2', 'Error 3'];
    expect(component.errorMessages.length).toBeGreaterThan(0);
    component.resetErrorMessages();
    expect(component.errorMessages.length).toBe(0);
  });

  it('should register loadingToken, call updateDocumentCategory and unregister loadingToken on finalize ' +
    'when calling moveDocument and successful', () => {
    const document = new DocumentTreeNode();
    Object.assign(document, {
      document: {
        name: 'name',
        type: DocumentTreeNodeType.DOCUMENT,
        children: [],
        document_filename: 'document_filename',
        document_binary_url: 'document_binary_url',
        attribute_path: 'attribute_path'
      },
      newCategory: 'newCategoryId'
    });

    const data = {
      document,
      newCategory: 'newCategoryId'
    };

    mockCaseFileViewService.updateDocumentCategory.and.returnValue(of({ response: true }));
    component.reloadPage = () => {};
    spyOn(component, 'reloadPage').and.callThrough();
    spyOn(component, 'resetErrorMessages').and.callThrough();

    component.moveDocument(data);

    expect(mockCaseFileViewService.updateDocumentCategory)
      // @ts-expect-error - component.caseVersion is a private property
      .toHaveBeenCalledWith(cidParam, component.caseVersion, data.document.attribute_path, data.newCategory);
    // @ts-expect-error - loadingService private property
    expect(component.loadingService.register).toHaveBeenCalled();
    // @ts-expect-error - loadingService private property
    expect(component.loadingService.unregister).toHaveBeenCalled();
    expect(component.resetErrorMessages).toHaveBeenCalled();
    expect(component.reloadPage).toHaveBeenCalled();
  });

  it('should set errorMessages after calling updateDocumentCategory and unregister loadingToken on finalize ' +
    'when calling moveDocument and it throws an error', () => {
    const document = new DocumentTreeNode();
    Object.assign(document, {
      document: {
        name: 'name',
        type: DocumentTreeNodeType.DOCUMENT,
        children: [],
        document_filename: 'document_filename',
        document_binary_url: 'document_binary_url',
        attribute_path: 'attribute_path'
      },
      newCategory: 'newCategoryId'
    });

    const data = {
      document,
      newCategory: 'newCategoryId'
    };

    expect(component.errorMessages.length).toBe(0);
    mockCaseFileViewService.updateDocumentCategory.and.returnValue(throwError({ response: 'error' }));
    component.reloadPage = () => {};
    component.moveDocument(data);
    expect(component.errorMessages.length).toBe(1);
  });

  it('should display the error messages', () => {
    component.errorMessages = ['Error 1', 'Error 2'];
    fixture.detectChanges();
    const listElements = fixture.debugElement.queryAll(By.css('#case-file-view-field-errors .govuk-error-summary__list li'));
    const errorMessagesFromElements = listElements.map(item => item.nativeElement.textContent);
    expect(component.errorMessages).toEqual(errorMessagesFromElements);
  });
});
