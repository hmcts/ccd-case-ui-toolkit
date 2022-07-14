import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { AddressModel } from '../../domain/addresses';
import { HttpService } from '../http';
import { AddressParser } from './address-parser';

@Injectable()
export class AddressesService {

  public static readonly DPA = 'DPA';

  public static readonly UK = 'United Kingdom';

  public static readonly RD06 = 'RD06';

  constructor(private readonly http: HttpService, private readonly appConfig: AbstractAppConfig) {
  }

  public getAddressesForPostcode(postcode: string): Observable<AddressModel[]> {
    return this.http
      .get(this.appConfig.getPostcodeLookupUrl()
        .replace('${postcode}', postcode), undefined, false)
      .pipe(
        map(res => res.results))
      .pipe(
        map(output => output.map(addresses =>
          this.format(new AddressParser().parse(addresses[AddressesService.DPA]))
        ))
      );
  }

  private format(addressModel: AddressModel) {
    return this.formatAddressLines(this.shiftAddressLinesUp(addressModel));
  }

  private formatAddressLines(addressModel: AddressModel) {
    ['AddressLine1', 'AddressLine2', 'AddressLine3', 'PostTown'].forEach(value => {
      addressModel[value] = this.toCapitalCase(addressModel[value]);
    });
    return addressModel;
  }

  private shiftAddressLinesUp(addressModel: AddressModel) {
    if (addressModel.AddressLine2 === '') {
      addressModel.AddressLine2 = addressModel.AddressLine3;
      addressModel.AddressLine3 = '';
    }
    if (addressModel.AddressLine1 === '') {
      addressModel.AddressLine1 = addressModel.AddressLine2;
      addressModel.AddressLine2 = '';
    }
    return addressModel;
  }

  private toCapitalCase(sentence: string) {
    sentence = sentence.toLowerCase();
    sentence.split(' ').forEach((value, index) => {
        sentence = sentence.replace(value, value.charAt(0).toUpperCase() + value.substr(1));
      }
    );
    return sentence;
  }
}
