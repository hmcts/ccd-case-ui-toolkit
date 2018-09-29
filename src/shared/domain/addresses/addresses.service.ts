import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../http/http.service';
import { AddressModel } from './address.model';
import { AppConfig } from '../../app.config';

@Injectable()
export class AddressesService {

  constructor(
    private http: HttpService,
    private appConfig: AppConfig
  ) {}

  getAddressesForPostcode(postcode: string): Observable<Array<AddressModel>> {
    return this.http
      .get(this.appConfig.getPostcodeLookupUrl().replace('${postcode}', postcode))
      .map(response => response.json());
  }
}
