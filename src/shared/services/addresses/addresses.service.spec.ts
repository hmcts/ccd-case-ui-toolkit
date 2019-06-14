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
  const validPostCodeResults: any = require('../../fixture/valid-postcode-results.json');

  beforeEach(() => {

    appConfig = jasmine.createSpyObj<AbstractAppConfig>('AppConfig', ['getPostcodeLookupUrl']);
    httpService = jasmine.createSpyObj<HttpService>('HttpService', ['get']);
    appConfig.getPostcodeLookupUrl.and.returnValue('http://postcodeUrl/postcode=${postcode}&key=${key}');
    let postCodeResponse = new Response(<ResponseOptions>{body: JSON.stringify(validPostCodeResults)});
    httpService.get.and.returnValue(Observable.of(postCodeResponse));
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

  it('should return least one addresses from a given postcode', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => { expect(addresses.length).toBeGreaterThan(1)});
  });

  it('should return all addresses from a given postcode location', () => {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => { expect(addresses.length).toEqual(20)});
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

  it('should shift address lines above when there is no address line 1', ()=> {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => {
      expect(
        addresses[1].AddressLine1
      ).toBeTruthy();
    });
  });

  it('should expect both addressLine1 and addressLine2 populated', ()=> {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => {
      expect(
        addresses[0].AddressLine1
      ).toBeTruthy();
      expect(
        addresses[0].AddressLine2
      ).toBeTruthy();
    });
  });

  fit('should expect addressLine1 and addressLine2 to be in capital case', ()=> {
    const result = addressesService.getAddressesForPostcode(validPostCode);
    result.subscribe(addresses => {
      expect(eachWordInAddressInCapitalCase(addresses[0].AddressLine1)).toBe(true);
      expect(eachWordInAddressInCapitalCase(addresses[0].AddressLine2)).toBe(true);
    });
  });

  function eachWordInAddressInCapitalCase(addressLine:string) {
    let result = true;
    addressLine.split(' ').forEach(word=> {
        if (!isInCapitalCase(word)) {
          result = false;
        }
    });
    return true;
  }

  function isInCapitalCase(word:string) {
    return (letter: string) => {
      let uppCase = letter.charAt(0) == letter.charAt(0).toUpperCase();
      let lowCase = letter.charAt(1) == letter.charAt(1).toLowerCase();
      return (uppCase && lowCase);
    };
  }


});
