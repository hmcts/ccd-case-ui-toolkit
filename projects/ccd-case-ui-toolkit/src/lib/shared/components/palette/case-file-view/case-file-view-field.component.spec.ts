import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../domain/case-file-view';
import { CaseFileViewService, DocumentManagementService, LoadingService } from '../../../services';
import { mockDocumentManagementService } from '../../../services/document-management/document-management.service.mock';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;
  let mockCaseFileViewService: jasmine.SpyObj<CaseFileViewService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  const mockSnapshot = {
    paramMap: createSpyObj('paramMap', ['get']),
  };
  const mockRoute = {
    params: of({cid: '1234123412341234'}),
    snapshot: mockSnapshot
  };

  beforeEach(waitForAsync(() => {
    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService', ['getCategoriesAndDocuments', 'updateDocumentCategory']);
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(of(null));

    mockLoadingService = createSpyObj<LoadingService>('LoadingService', ['register', 'unregister']);
    mockLoadingService.register.and.returnValue('loadingToken');
    mockLoadingService.unregister.and.returnValue(null);

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
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
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

  it('should display an error message if the update document category fails', () => {
    mockCaseFileViewService.updateDocumentCategory.and.returnValue(throwError(new Error('Unable to update document')));
    const data = {
      document: {
        attribute_path: '/some/path',
        newCategory: 'some new category'
      }
    };
    component.moveDocument(data);
    expect(component.updateDocumentCategoryError).toBe(true);
    expect(mockLoadingService.unregister).toHaveBeenCalled();
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const errorMessageHeadingElement = nativeElement.querySelector('.govuk-heading-m');
    expect(errorMessageHeadingElement).toBeTruthy();
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
});
