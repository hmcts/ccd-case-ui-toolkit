import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AbstractAppConfig } from '../../../app.config';
import { AddressModel } from '../../domain/addresses';
import { HttpService } from '../http';
import {map} from "rxjs/operators";
import 'rxjs/add/observable/of';

@Injectable()
export class AddressesService {

  constructor(
    private http: HttpService,
    private appConfig: AbstractAppConfig
  ) {}

  getAddressesForPostcode(postcode: string): Observable<Array<AddressModel>> {
    return this.http
      .get(this.appConfig.getPostcodeLookupUrl()
        .replace('${postcode}', postcode))
      .pipe(
        map(res=> res.json().results)
       ).pipe(
        map(output => output.map(addresses=>
            AddressesService.mapToAddressModel(addresses["DPA"]))
      ));
  }

  static mapToAddressModel(address:any) {
    const addressModel = new AddressModel();
    let addressLine = AddressesService.tidyEmptyValues(
      `${address.ORGANISATION_NAME} ${address.DEPARTMENT_NAME} ${address.PO_BOX_NUMBER}`)
    if (addressLine != '') addressModel.AddressLine1 = addressLine;
    addressModel.AddressLine2 = AddressesService.tidyEmptyValues(
      `${address.BUILDING_NAME} ${address.SUB_BUILDING_NAME} ${address.BUILDING_NUMBER} ${address.THOROUGHFARE_NAME}`);
    addressModel.AddressLine3 = AddressesService.tidyEmptyValues(
      `${address.DEPENDENT_LOCALITY} ${address.DOUBLE_DEPENDENT_LOCALITY} ${address.DEPENDENT_THOROUGHFARE_NAME}`);
    addressModel.PostCode = address.POSTCODE;
    addressModel.PostTown = address.POST_TOWN;
    addressModel.Country = 'UK';
    return addressModel;
  }

  static tidyEmptyValues(line: String) {
    return line
      .replace(" null", ' ')
      .replace("null ", ' ')
      .replace(new RegExp("undefined","gi"), '')
      .replace(new RegExp(" +", "gi"), ' ')
      .trim()
      .replace(new RegExp("^,", "gi"),'');
  };

}

