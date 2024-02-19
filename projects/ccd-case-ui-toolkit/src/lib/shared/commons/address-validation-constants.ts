import { Injectable } from '@angular/core';

@Injectable()
export class AddressValidationConstants {
  // allow alpha-numeric characters and spaces possibly between a connecting - character
  // this applies validation while allowing partial postcodes
  public static readonly REGEX_POSTCODE = /^([A-Za-z0-9]-*| )+$/;
}
