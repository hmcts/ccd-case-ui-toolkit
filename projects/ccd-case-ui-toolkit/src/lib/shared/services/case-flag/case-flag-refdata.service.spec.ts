import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AbstractAppConfig } from '../../../app.config';
import { FlagType, HmctsServiceDetail } from '../../domain/case-flag';
import { HttpErrorService, HttpService } from '../http';
import { CaseFlagRefdataService } from './case-flag-refdata.service';
import { RefdataCaseFlagType } from './refdata-case-flag-type.enum';

import createSpyObj = jasmine.createSpyObj;

describe('Case Flag Refdata Service', () => {
  const caseFlagsRefdataApiUrl = '/refdata/commondata/caseflags/service-id=:sid';
  const locationRefApiUrl = '/refdata/location';
  const dummyFlagsData = {
    flags: [
      {
        FlagDetails: [
          {
            name: 'Party',
            hearingRelevant: false,
            flagComment: false,
            flagCode: 'CATGRY',
            isParent: true,
            Path: [''],
            childFlags: [
              {
                name: 'Potentially suicidal',
                hearingRelevant: true,
                flagComment: false,
                flagCode: 'PF0003',
                isParent: false,
                Path: ['Party'],
                childFlags: []
              },
              {
                name: 'Other',
                hearingRelevant: true,
                flagComment: true,
                flagCode: 'OT0001',
                isParent: false,
                Path: ['Party'],
                childFlags: []
              }
            ]
          }
        ] as FlagType[]
      }
    ]
  };
  const dummyServiceDetails = [
    {
      ccd_service_name: 'SSCS',
      org_unit: 'HMCTS',
      service_code: 'BBA3',
      service_id: 31
    }
  ] as HmctsServiceDetail[];
  let appConfig: jasmine.SpyObj<AbstractAppConfig>;
  let httpErrorService: jasmine.SpyObj<HttpErrorService>;
  let service: CaseFlagRefdataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getCaseFlagsRefdataApiUrl', 'getLocationRefApiUrl']);
    appConfig.getCaseFlagsRefdataApiUrl.and.returnValue(caseFlagsRefdataApiUrl);
    appConfig.getLocationRefApiUrl.and.returnValue(locationRefApiUrl);
    // Although not used in any tests, HttpErrorService is a dependency (introduced by HttpService) so a mock is needed
    httpErrorService = createSpyObj<HttpErrorService>('httpErrorService', ['setError']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CaseFlagRefdataService,
        HttpService,
        { provide: AbstractAppConfig, useValue: appConfig },
        { provide: HttpErrorService, useValue: httpErrorService }
      ]
    });
    // Note: TestBed.get() is deprecated in favour of TestBed.inject() (type-safe) from Angular 9
    service = TestBed.get(CaseFlagRefdataService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no HTTP requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve the Case Flags reference data for the given service ID', () => {
    service.getCaseFlagsRefdata('BBA3').subscribe({
      next: flagTypes => expect(flagTypes).toEqual(dummyFlagsData.flags[0].FlagDetails)
    });

    const req = httpMock.expectOne(caseFlagsRefdataApiUrl.replace(':sid', 'BBA3'));
    expect(req.request.method).toEqual('GET');
    req.flush(dummyFlagsData);
  });

  it('should retrieve the Case Flags reference data for the given service ID and flag type', () => {
    service.getCaseFlagsRefdata('BBA3', RefdataCaseFlagType.PARTY).subscribe({
      next: flagTypes => expect(flagTypes).toEqual(dummyFlagsData.flags[0].FlagDetails)
    });

    const req = httpMock.expectOne(`${caseFlagsRefdataApiUrl.replace(':sid', 'BBA3')}?flag-type=${RefdataCaseFlagType.PARTY}`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyFlagsData);
  });

  it('should retrieve the Case Flags reference data for the given service ID, flag type, and Welsh language versions required', () => {
    service.getCaseFlagsRefdata('BBA3', RefdataCaseFlagType.PARTY, true).subscribe({
      next: flagTypes => expect(flagTypes).toEqual(dummyFlagsData.flags[0].FlagDetails)
    });

    const req = httpMock.expectOne(
      `${caseFlagsRefdataApiUrl.replace(':sid', 'BBA3')}?flag-type=${RefdataCaseFlagType.PARTY}&welsh-required=Y`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyFlagsData);
  });

  it('should retrieve the Case Flags reference data for the given service ID and Welsh language versions not required', () => {
    service.getCaseFlagsRefdata('BBA3', null, false).subscribe({
      next: flagTypes => expect(flagTypes).toEqual(dummyFlagsData.flags[0].FlagDetails)
    });

    const req = httpMock.expectOne(`${caseFlagsRefdataApiUrl.replace(':sid', 'BBA3')}?welsh-required=N`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyFlagsData);
  });

  it('should return null if caseFlagsRefdataApiUrl in appConfig is null', () => {
    appConfig.getCaseFlagsRefdataApiUrl.and.returnValue(null);
    service.getCaseFlagsRefdata('BBA3').subscribe({
      next: flagTypes => expect(flagTypes).toBeNull()
    });

    httpMock.expectNone(caseFlagsRefdataApiUrl.replace(':sid', 'BBA3'));
  });

  it('should retrieve the HMCTS service details for the given service name', () => {
    service.getHmctsServiceDetailsByServiceName('SSCS').subscribe({
      next: serviceDetails => expect(serviceDetails).toEqual(dummyServiceDetails)
    });

    const req = httpMock.expectOne(`${locationRefApiUrl}/orgServices?ccdServiceNames=SSCS`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyServiceDetails);
  });

  it('should retrieve the HMCTS service details for all services', () => {
    service.getHmctsServiceDetailsByServiceName().subscribe({
      next: serviceDetails => expect(serviceDetails).toEqual(dummyServiceDetails)
    });

    const req = httpMock.expectOne(`${locationRefApiUrl}/orgServices`);
    expect(req.request.method).toEqual('GET');
    req.flush(dummyServiceDetails);
  });

  it('should return null if locationRefApiUrl in appConfig is null', () => {
    appConfig.getLocationRefApiUrl.and.returnValue(null);
    service.getHmctsServiceDetailsByServiceName('SSCS').subscribe({
      next: serviceDetails => expect(serviceDetails).toBeNull()
    });

    httpMock.expectNone(`${locationRefApiUrl}/orgServices?ccdServiceNames=SSCS`);
  });
});
