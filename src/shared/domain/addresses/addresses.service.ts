import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { AddressModel } from './address.model';
import { HttpService } from '../../http';

@Injectable()
export class AddressesService {

  constructor(
    private http: HttpService,
    private appConfig: AbstractAppConfig
  ) {}

  getAddressesForPostcode(postcode: string): Observable<Array<AddressModel>> {
    return this.http
      .get(this.appConfig.getPostcodeLookupUrl().replace('${postcode}', postcode))
      .pipe(
        map(response => response.json())
      );
  }
}
