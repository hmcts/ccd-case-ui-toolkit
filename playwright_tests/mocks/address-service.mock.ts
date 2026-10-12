import { BehaviorSubject, of, throwError } from 'rxjs';
import { AddressesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/addresses/addresses.service';

const mandatoryAddressError = new BehaviorSubject(false);
export const addressesService: Pick<AddressesService, 'getMandatoryError' | 'getAddressesForPostcode'> = {
  getMandatoryError: () => mandatoryAddressError.asObservable(),
  getAddressesForPostcode: (postcode) => postcode === 'SW1A2AA' ? of([]) : postcode === 'SW1A3AA'
    ? throwError(() => ({ status: 503 })) : of([{
      AddressLine1: '1 Test Street',
      AddressLine2: '',
      AddressLine3: '',
      PostTown: 'London',
      County: '',
      PostCode: 'SW1A 1AA',
      Country: 'United Kingdom'
    } as any])
};
