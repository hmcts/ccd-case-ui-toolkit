import { AddressModel } from '../../domain/addresses/address.model';
import { AddressType } from './address-type.enum';

/**
 * Moving all this logic here into Address Parser class, so that it
 * will be easier for us when we move this parsing logic to into
 * `Shim` java service.
 */
 export class AddressParser {
  public parse(address: any) {
    const classification = `${address.CLASSIFICATION_CODE}`;
    const addressModel = new AddressModel();
    addressModel.AddressLine1 = this.parseAddressLine1(classification, address);
    addressModel.AddressLine2 = this.parseAddressLine2(classification, address);
    addressModel.AddressLine3 = this.parseAddressLine3(classification, address);
    addressModel.PostCode = address.POSTCODE;
    addressModel.PostTown = address.POST_TOWN;
    addressModel.Country = AddressType.UK;
    return addressModel;
  }

  private parseAddressLine1(classification: string, address: any) {
    let addressLine;
    if (classification === AddressType.RD06) {
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
    let addressLine;
    if (classification === AddressType.RD06) {
      addressLine = `${address.BUILDING_NAME} `;
    } else {
      addressLine =
        `${address.SUB_BUILDING_NAME} ${address.BUILDING_NUMBER} ${address.THOROUGHFARE_NAME}`;
    }
    return this.removeNonAddressValues(addressLine);
  }

  private parseAddressLine3(classification: string, address: any) {
    let addressLine;
    if (classification === AddressType.RD06) {
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
  }

  private removeUndefinedString(value: string) {
    return value.replace(new RegExp('undefined', 'gi'), '');
  }

  private removeEmptySpaces(value: string) {
    return value.replace(new RegExp(' +', 'gi'), ' ').trim();
  }

  private removeInitialComma(value: string) {
    return value.replace(new RegExp('^,', 'gi'), '');
  }

  private prefixWithCommaIfPresent(value: string) {
    return value ? `, ${value}` : value;
  }
}
