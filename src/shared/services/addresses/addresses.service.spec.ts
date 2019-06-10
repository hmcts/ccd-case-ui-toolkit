import {AddressesService} from './addresses.service';
import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AbstractAppConfig} from "../../../app.config";
import {Observable} from "rxjs";
import {HttpService} from "../http";
import {Response, ResponseOptions} from "@angular/http";


describe('AddressesService', () => {

  let addressesService: AddressesService;
  let appConfig;
  let httpService;
  let httpTestingController: HttpTestingController;
  let validPostCode = 'SW1A 2AA';
  let injector: TestBed;
  let httpMock: HttpTestingController;
  const data: any = require('../../fixture/valid-postcode-results.json');

  beforeEach(() => {

    appConfig = jasmine.createSpyObj<AbstractAppConfig>('AppConfig', ['getPostcodeLookupUrl',
      'getPostcodeLookupApiKey']);
    httpService = jasmine.createSpyObj<HttpService>('HttpService', ['get']);
    appConfig.getPostcodeLookupUrl.and.returnValue('http://postcodeUrl/postcode=${postcode}&key=${key}');
    appConfig.getPostcodeLookupApiKey.and.returnValue('apikey');
    let postCodeResponse = new Response(<ResponseOptions>{body: JSON.stringify(data)});
    httpService.get.and.returnValue(Observable.of(postCodeResponse));
    // httpService.get.and.returnValue(Observable.of([]));
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressesService, {provide: AbstractAppConfig, useValue: appConfig}, {
        provide: HttpService,
        useValue: httpService
      }]
    });
    injector = getTestBed();
    addressesService = injector.get(AddressesService);
    httpMock = injector.get(HttpTestingController);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created with all the dependencies', () => {
    expect(addressesService).toBeTruthy();
  });

  it('should return atleast one addresses from a given postcode', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => { expect(addresses.length).toBeGreaterThan(1)});
  });

  it('should return all addresses from a given postcode location', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => { expect(addresses.length).toEqual(12)});
  });

  it('should return addresses with either addressLine1 or addressLine2 populated', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => {
      expect(
        addresses[0].AddressLine1.length > 0  || addresses[0].AddressLine2.length > 0
      ).toBe(true);
    });
  });

  it('should return addresses without null or undefined values ', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => {
      expect(addresses[0].AddressLine1).not.toContain("undefined");
      expect(addresses[0].AddressLine1).not.toContain("null");
      expect(addresses[0].AddressLine2).not.toContain("undefined");
      expect(addresses[0].AddressLine2).not.toContain("null");
    });

  });

  it('should return addresses with postcode value', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => { expect(addresses[0].PostCode.length).toBeGreaterThan(0)});
  });

  it('should return subscriber error when postcode service returns zero', () => {
    httpService.get.and.returnValue(Observable.of([]));
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => expect(addresses.length).toBe(1),
                     error=> expect(error).toBeTruthy());

  });

});
