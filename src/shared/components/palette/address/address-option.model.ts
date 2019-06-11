import { AddressModel } from '../../../domain/addresses/address.model';
export class AddressOption {

  description: string;

  constructor (addressModel: AddressModel, description: string) {
    this.description = this.extractAddressLines(addressModel);
  }

  private prefixWithCommaIfPresent(value: string) {
    return value ? ', ' + value : value;
  }

  private extractAddressLines(addressModel: AddressModel) {
    return this.removeInitialCommaIfPresent(
      addressModel.AddressLine1
        +  this.prefixWithCommaIfPresent(addressModel.AddressLine2)
        +  this.prefixWithCommaIfPresent(addressModel.AddressLine3)
        + ', ' + addressModel.PostTown
    );
  }

  private removeInitialCommaIfPresent(value: string) {
    return value.replace(new RegExp("^,", "gi"),'');
  }

}
