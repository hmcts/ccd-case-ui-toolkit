import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Jurisdiction } from '../../domain';
import { HttpErrorService, HttpService } from '../http';
import { SessionStorageService } from '../session/session-storage.service';
import { CachedJurisdictionService } from './cached-jurisdiction.service';

import createSpyObj = jasmine.createSpyObj;

describe('CachedJurisdictionService', () => {
  const endpointUrl = '/aggregated/caseworkers/:uid/jurisdictions?access=read';
  const dummyJurisdictionsData = [
    {
      id: 'TEST1',
      name: 'Test1',
      description: 'Test jurisdiction 1',
      caseTypes: []
    },
    {
      id: 'TEST2',
      name: 'Test2',
      description: 'Test jurisdiction 2',
      caseTypes: []
    }
  ] as Jurisdiction[];
  let httpErrorService: jasmine.SpyObj<HttpErrorService>;
  let service: CachedJurisdictionService;
  let httpMock: HttpTestingController;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;

  beforeEach(() => {
    sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'setItem']);
    // Although not used in any tests, HttpErrorService is a dependency (introduced by HttpService) so a mock is needed
    httpErrorService = createSpyObj<HttpErrorService>('httpErrorService', ['setError']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CachedJurisdictionService,
        HttpService,
        { provide: HttpErrorService, useValue: httpErrorService },
        { provide: SessionStorageService, useValue: sessionStorageService }
      ]
    });
    service = TestBed.inject(CachedJurisdictionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no HTTP requests are outstanding
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve the jurisdictions if they are not cached and store them in session storage', () => {
    sessionStorageService.getItem.and.returnValue(null);
    service.getCachedJurisdictions(endpointUrl).subscribe({
      next: (jurisdictions) => {
        expect(jurisdictions).toEqual(dummyJurisdictionsData);
        expect(sessionStorageService.setItem).toHaveBeenCalledWith(endpointUrl, JSON.stringify(jurisdictions));
      }
    });
    const req = httpMock.expectOne(endpointUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyJurisdictionsData);
  });

  it('should return the cached jurisdictions and not make the API call to retrieve them', () => {
    sessionStorageService.getItem.and.returnValue(JSON.stringify(dummyJurisdictionsData));
    service.getCachedJurisdictions(endpointUrl).subscribe({
      next: (jurisdictions) => {
        expect(jurisdictions).toEqual(dummyJurisdictionsData);
        // Call to retrieve jurisdictions from session storage expected twice - once to check they exist, once to return them
        expect(sessionStorageService.getItem).toHaveBeenCalledTimes(2);
        expect(sessionStorageService.setItem).not.toHaveBeenCalled();
      }
    });
    httpMock.expectNone(endpointUrl);
  });

  it('should not cache jurisdictions in session storage if an error occurred with the API call', () => {
    sessionStorageService.getItem.and.returnValue(null);
    service.getCachedJurisdictions(endpointUrl).subscribe({
      next: (_) => {},
      error: (_) => expect(sessionStorageService.setItem).not.toHaveBeenCalled()
    });
    const req = httpMock.expectOne(endpointUrl);
    req.error(new ProgressEvent('error'), { status: 401 });
  });
});
