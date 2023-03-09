import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommonDataService, LovRefDataByServiceModel, LovRefDataModel } from './common-data-service';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CommonDataService
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

  afterEach(() => {
    // Verify that no HTTP requests are outstanding
    httpMock.verify();
  });
});
