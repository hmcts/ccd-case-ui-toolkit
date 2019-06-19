import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AbstractAppConfig } from '../../../app.config';
import { AddressModel } from '../../domain/addresses';
import { HttpService } from '../http';
import { map } from 'rxjs/operators';
import 'rxjs/add/observable/of';

@Injectable()
export class AddressesService {

  static readonly DPA = 'DPA';

  static readonly UK = 'United Kingdom';

  static readonly RD06 = 'RD06';

  constructor(private http: HttpService, private appConfig: AbstractAppConfig) {
  }

  getAddressesForPostcode(postcode: string): Observable<Array<AddressModel>> {
    return this.http
      .get(this.appConfig.getPostcodeLookupUrl()
        .replace('${postcode}', postcode), undefined, false)
      .pipe(
        map(res => res.json().results))
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
    if (addressModel.AddressLine1 === '') {
      addressModel.AddressLine1 = addressModel.AddressLine2;
      addressModel.AddressLine2 = '';
    }
    if (addressModel.AddressLine2 === '') {
      addressModel.AddressLine2 = addressModel.AddressLine3;
      addressModel.AddressLine3 = '';
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

/**
 * Moving all this logic here into Address Parser class, so that it
 * will be easier for us when we move this parsing logic to into
 * `Shim` java service.
 */
class AddressParser {

  constructor() {
  }

  parse(address: any) {
    let classification = `${address.CLASSIFICATION_CODE}`;
    let addressModel = new AddressModel();
    addressModel.AddressLine1 = this.parseAddressLine1(classification, address);
    addressModel.AddressLine2 = this.parseAddressLine2(classification, address);
    addressModel.AddressLine3 = this.parseAddressLine3(classification, address);
    addressModel.PostCode = address.POSTCODE;
    addressModel.PostTown = address.POST_TOWN;
    addressModel.Country = AddressesService.UK;
    return addressModel;
  }

  private parseAddressLine1(classification: string, address: any) {
    let addressLine = '';
    if (classification === AddressesService.RD06) {
      addressLine =
        `${address.SUB_BUILDING_NAME} ${address.ORGANISATION_NAME} ${address.DEPARTMENT_NAME} ${address.PO_BOX_NUMBER}`;
    } else {
      addressLine =
        `${address.ORGANISATION_NAME}${this.prefixWithCommaIfPresent(address.BUILDING_NAME)}` +
        `${address.DEPARTMENT_NAME} ${address.PO_BOX_NUMBER}`;
    }
    return this.removeNonAddressValues(addressLine);
  }

  private parseAddressLine2(classification: string, address: any) {
    let addressLine = '';
    if (classification === AddressesService.RD06) {
      addressLine = `${address.BUILDING_NAME} `;
    } else {
      addressLine =
        `${address.SUB_BUILDING_NAME} ${address.BUILDING_NUMBER} ${address.THOROUGHFARE_NAME}`;
    }
    return this.removeNonAddressValues(addressLine);
  }

  private parseAddressLine3(classification: string, address: any) {
    let addressLine = '';
    if (classification === AddressesService.RD06) {
      addressLine =
        `${address.BUILDING_NUMBER} ${address.THOROUGHFARE_NAME}`;
    } else {
      addressLine =
        `${address.DEPENDENT_LOCALITY} ${address.DOUBLE_DEPENDENT_LOCALITY} ${address.DEPENDENT_THOROUGHFARE_NAME}`;
    }
    return this.removeNonAddressValues(addressLine);
  }

  private removeNonAddressValues(line: string) {
    line = line.replace(' null', ' ').replace('null ', ' ');
    line = this.removeUndefinedString(line);
    line = this.removeInitialComma(line);
    line = this.removeEmptySpaces(line);
    return line;
  };

  private removeUndefinedString(value: string) {
    return value.replace(new RegExp('undefined', 'gi'), '')
  }

  private removeEmptySpaces(value: string) {
    return value.replace(new RegExp(' +', 'gi'), ' ').trim();
  }

  private removeInitialComma(value: string) {
    return value.replace(new RegExp('^,', 'gi'), '');
  }

  private prefixWithCommaIfPresent(value: string) {
    return value ? ', ' + value : value;
  }

}
