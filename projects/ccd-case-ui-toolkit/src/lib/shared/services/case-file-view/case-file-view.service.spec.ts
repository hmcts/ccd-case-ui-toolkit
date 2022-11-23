import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AbstractAppConfig } from '../../../app.config';
import { CaseFileViewCategory, CaseFileViewDocument, CategoriesAndDocuments } from '../../domain/case-file-view';
import { HttpError } from '../../domain/http';
import { AuthService } from '../auth';
import { HttpErrorService, HttpService } from '../http';
import { CaseFileViewService } from './case-file-view.service';

import createSpyObj = jasmine.createSpyObj;

describe('Case File View service', () => {
  const categoriesAndDocumentsUrl = '/categoriesAndDocuments';
  const documentDataUrl = '/documentData/caseref';
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
  const updatedCategoriesAndDocuments = {
    case_version: 2,
    categories: [
      {
        category_id: 'C2',
        category_name: 'Category 2',
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
            category_id: 'S2',
            category_name: 'Sub-category 2',
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
  let authService: jasmine.SpyObj<AuthService>;
  let service: CaseFileViewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getCategoriesAndDocumentsUrl', 'getDocumentDataUrl']);
    appConfig.getCategoriesAndDocumentsUrl.and.returnValue(categoriesAndDocumentsUrl);
    appConfig.getDocumentDataUrl.and.returnValue(documentDataUrl);
    // Although not used in any tests, AuthService is a dependency (introduced by HttpErrorService via HttpService)
    // so a mock is needed
    authService = createSpyObj<AuthService>('authService', ['signIn']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CaseFileViewService,
        HttpService,
        HttpErrorService,
        { provide: AbstractAppConfig, useValue: appConfig },
        { provide: AuthService, useValue: authService }
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

  it('should throw an error with the response mapped to an HttpError instance when the server returns a 400 error on GET', () => {
    let body: HttpError;

    service.getCategoriesAndDocuments('abc').subscribe({
      next: () => {},
      error: (error: HttpError) => body = error
    });

    const expectedResponse = {
      status: 400,
      error: 'Bad Request',
      message: 'Case ID is not valid'
    };

    const req = httpMock.expectOne(`${categoriesAndDocumentsUrl}/abc`);
    expect(req.request.method).toEqual('GET');
    req.flush(expectedResponse, {
      // Need to set expected Content-Type header because the HttpErrorService maps the error response properties to
      // an HttpError instance only if this is present
      headers: {
        'Content-Type': 'application/json'
      },
      status: 400,
      statusText: 'Bad Request'
    });
    expect(body.status).toBe(expectedResponse.status);
    expect(body.error).toEqual(expectedResponse.error);
    expect(body.message).toEqual(expectedResponse.message);
  });

  it('should throw an error with the response mapped to an HttpError instance when the server returns a 404 error on GET', () => {
    let body: HttpError;

    service.getCategoriesAndDocuments(caseRef).subscribe({
      next: () => {},
      error: (error: HttpError) => body = error
    });

    const expectedResponse = {
      status: 404,
      error: 'Not Found',
      message: 'Case not found'
    };

    const req = httpMock.expectOne(`${categoriesAndDocumentsUrl}/${caseRef}`);
    expect(req.request.method).toEqual('GET');
    req.flush(expectedResponse, {
      // Need to set expected Content-Type header because the HttpErrorService maps the error response properties to
      // an HttpError instance only if this is present
      headers: {
        'Content-Type': 'application/json'
      },
      status: 404,
      statusText: 'Not Found'
    });
    expect(body.status).toBe(expectedResponse.status);
    expect(body.error).toEqual(expectedResponse.error);
    expect(body.message).toEqual(expectedResponse.message);
  });

  it('should update the document category for the given parameters', () => {
    service.updateDocumentCategory(caseRef, 2, 'dummy', 'C2').subscribe({
      next: categoriesAndDocuments => expect(categoriesAndDocuments).toEqual(updatedCategoriesAndDocuments)
    });

    const req = httpMock.expectOne(`${documentDataUrl}/${caseRef}`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      case_version: 2,
      attribute_path: 'dummy',
      category_id: 'C2'
    });

    // Expect the updated categories and documents to be returned after PUT
    const expectedResponse = new HttpResponse({ status: 200, statusText: 'OK', body: updatedCategoriesAndDocuments });
    req.event(expectedResponse);
  });

  it('should return null if documentDataUrl in appConfig is null', () => {
    appConfig.getDocumentDataUrl.and.returnValue(null);
    service.updateDocumentCategory(caseRef, 2, 'dummy', 'C2').subscribe({
      next: categoriesAndDocuments => expect(categoriesAndDocuments).toBeNull()
    });

    httpMock.expectNone(`${documentDataUrl}/${caseRef}`);
  });

  it('should throw an error with the response mapped to an HttpError instance when the server returns a 400 error on PUT', () => {
    let body: HttpError;

    service.updateDocumentCategory(caseRef, 2, 'dummy', 'X2').subscribe({
      next: () => {},
      error: (error: HttpError) => body = error
    });

    const expectedResponse = {
      status: 400,
      error: 'Bad Request',
      message: '002 invalid categoryId'
    };

    const req = httpMock.expectOne(`${documentDataUrl}/${caseRef}`);
    expect(req.request.method).toEqual('PUT');
    req.flush(expectedResponse, {
      // Need to set expected Content-Type header because the HttpErrorService maps the error response properties to
      // an HttpError instance only if this is present
      headers: {
        'Content-Type': 'application/json'
      },
      status: 400,
      statusText: 'Bad Request'
    });
    expect(body.status).toBe(expectedResponse.status);
    expect(body.error).toEqual(expectedResponse.error);
    expect(body.message).toEqual(expectedResponse.message);
  });

  it('should throw an error with the response mapped to an HttpError instance when the server returns a 404 error on PUT', () => {
    let body: HttpError;

    service.updateDocumentCategory(caseRef, 2, 'dummy', 'C2').subscribe({
      next: () => {},
      error: (error: HttpError) => body = error
    });

    const expectedResponse = {
      status: 404,
      error: 'Not Found',
      message: '001 Non-extant case'
    };

    const req = httpMock.expectOne(`${documentDataUrl}/${caseRef}`);
    expect(req.request.method).toEqual('PUT');
    req.flush(expectedResponse, {
      // Need to set expected Content-Type header because the HttpErrorService maps the error response properties to
      // an HttpError instance only if this is present
      headers: {
        'Content-Type': 'application/json'
      },
      status: 404,
      statusText: 'Not Found'
    });
    expect(body.status).toBe(expectedResponse.status);
    expect(body.error).toEqual(expectedResponse.error);
    expect(body.message).toEqual(expectedResponse.message);
  });
});
