import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommonDataService, LovRefDataByServiceModel, LovRefDataModel } from './common-data-service';
import { ServiceOrg } from '../../domain/case-view/service-org-response.model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CommonDataService', () => {
  let service: CommonDataService;
  let httpMock: HttpTestingController;

  const dummyRefData: LovRefDataModel[] = [
    {
      key: 'dummyOne',
      value_en: 'Dummy Ref Data 1',
      value_cy: '',
      hint_text_en: 'dummy ref data reason 1',
      hint_text_cy: '',
      lov_order: 1,
      parent_key: null,
      category_key: 'DummyRefData1',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      key: 'dummyTwo',
      value_en: 'Dummy Ref Data 2',
      value_cy: '',
      hint_text_en: 'dummy ref data reason 2',
      hint_text_cy: '',
      lov_order: 1,
      parent_key: null,
      category_key: 'DummyRefData2',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
    }
  ];
  const dummyLovRefDataByServiceModel: LovRefDataByServiceModel = {
    list_of_values: dummyRefData
  };
  const serviceOrgData: ServiceOrg[] = [
    {
      business_are: 'area',
      ccd_case_types: 'case Type',
      ccd_service_name: 'case name',
      jurisdiction: 'Civil',
      last_update: '22/08/1999',
      org_unit: 'unit',
      service_code: 'code',
      service_description: 'description',
      service_id: 39,
      service_short_description: 'short descr',
      sub_business_area: 'buss area'

    }
  ]

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        CommonDataService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(CommonDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get ref data', () => {
    service.getRefData('/refData').subscribe({
      next: lovRefDataByServiceModel => expect(lovRefDataByServiceModel).toEqual(dummyLovRefDataByServiceModel)
    });

    const req = httpMock.expectOne('/refData');
    expect(req.request.method).toEqual('GET');
    req.flush(dummyLovRefDataByServiceModel);
  });

  it('should get ServiceOrgData', () => {
    service.getServiceOrgData('/refdata/location/orgServices?ccdCaseType=39').subscribe({
      next: lovRefDataByServiceModel => expect(lovRefDataByServiceModel).toEqual(serviceOrgData)
    });

    const req = httpMock.expectOne('/refdata/location/orgServices?ccdCaseType=39');
    expect(req.request.method).toEqual('GET');
    req.flush(serviceOrgData);
  });

  it('should get null if you pass null as url', () => {
    service.getRefData(null).subscribe(result => {
      expect(result).toBe(null);
    });
  });

  it('should get null if you pass null as url', () => {
    service.getServiceOrgData(null).subscribe(result => {
      expect(result).toBe(null);
    });
  });

  afterEach(() => {
    // Verify that no HTTP requests are outstanding
    httpMock.verify();
  });
});
