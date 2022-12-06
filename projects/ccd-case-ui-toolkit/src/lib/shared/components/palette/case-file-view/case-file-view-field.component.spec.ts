import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DocumentTreeNode, DocumentTreeNodeType } from '../../../domain/case-file-view';
import { CaseFileViewService, DocumentManagementService } from '../../../services';
import { mockDocumentManagementService } from '../../../services/document-management/document-management.service.mock';
import createSpyObj = jasmine.createSpyObj;
import { CaseFileViewFieldComponent } from './case-file-view-field.component';

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;
  let mockCaseFileViewService: jasmine.SpyObj<CaseFileViewService>;
  const mockSnapshot = {
    paramMap: createSpyObj('paramMap', ['get']),
  };
  const mockRoute = {
    params: of({cid: '1234123412341234'}),
    snapshot: mockSnapshot
  };

  beforeEach(async(() => {
    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService', ['getCategoriesAndDocuments']);
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(of(null));
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
        { provide: DocumentManagementService, useValue: mockDocumentManagementService }
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
