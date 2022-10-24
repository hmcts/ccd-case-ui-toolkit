import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AbstractAppConfig } from '../../../app.config';
import { CaseFileViewCategory, CaseFileViewDocument, CategoriesAndDocuments } from '../../domain/case-file-view';
import { HttpErrorService, HttpService } from '../http';
import { CaseFileViewService } from './case-file-view.service';

import createSpyObj = jasmine.createSpyObj;

describe('Case File View service', () => {
  const categoriesAndDocumentsUrl = '/categoriesAndDocuments';
  const caseRef = '1111222233334444';
  const dummyCategoriesAndDocuments = {
    case_version: 1,
    categories: [
      {
        category_id: 'C1',
        category_name: 'Category 1',
        category_order: 1,
        documents: [
          {
            document_url: '/test',
            document_filename: 'Test',
            document_binary_url: '/test/binary',
            attribute_path: '',
            upload_timestamp: ''
          } as CaseFileViewDocument
        ],
        sub_categories: [
          {
            category_id: 'S1',
            category_name: 'Sub-category 1',
            category_order: 1,
            documents: [],
            sub_categories: []
          } as CaseFileViewCategory
        ]
      } as CaseFileViewCategory
    ],
    uncategorised_documents: []
  } as CategoriesAndDocuments;
  let appConfig: jasmine.SpyObj<AbstractAppConfig>;
  let httpErrorService: jasmine.SpyObj<HttpErrorService>;
  let service: CaseFileViewService
  let httpMock: HttpTestingController;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getCategoriesAndDocumentsUrl']);
    appConfig.getCategoriesAndDocumentsUrl.and.returnValue(categoriesAndDocumentsUrl);
    // Although not used in any tests, HttpErrorService is a dependency (introduced by HttpService) so a mock is needed
    httpErrorService = createSpyObj<HttpErrorService>('httpErrorService', ['setError']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CaseFileViewService,
        HttpService,
        { provide: AbstractAppConfig, useValue: appConfig },
        { provide: HttpErrorService, useValue: httpErrorService }
      ]
    });
    // Note: TestBed.get() is deprecated in favour of TestBed.inject() (type-safe) from Angular 9
    service = TestBed.get(CaseFileViewService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no HTTP requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve the categories and documents for the given case reference', () => {
    service.getCategoriesAndDocuments(caseRef).subscribe({
      next: categoriesAndDocuments => expect(categoriesAndDocuments).toEqual(dummyCategoriesAndDocuments)
    });

    const req = httpMock.expectOne(`${categoriesAndDocumentsUrl}/${caseRef}`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyCategoriesAndDocuments);
  });

  it('should return null if categoriesAndDocumentsUrl in appConfig is null', () => {
    appConfig.getCategoriesAndDocumentsUrl.and.returnValue(null);
    service.getCategoriesAndDocuments(caseRef).subscribe({
      next: categoriesAndDocuments => expect(categoriesAndDocuments).toBeNull()
    });

    httpMock.expectNone(`${categoriesAndDocumentsUrl}/${caseRef}`);
  });
});
