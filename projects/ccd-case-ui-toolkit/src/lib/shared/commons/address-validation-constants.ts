import { Injectable } from '@angular/core';

@Injectable()
export class AddressValidationConstants {
  public static readonly REGEX_POSTCODE = /^(([A-Za-z]{1,2}\d[A-Za-z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) *\d[A-Za-z]{2}|BFPO *\d{1,4}|(KY\d|MSR|VG|AI)[ -]?\d{4}|[A-Za-z]{2} *\d{2}|GE *CX|GIR *0A{2}|SAN *TA1)$/;
}
