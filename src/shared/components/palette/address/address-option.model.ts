import { AddressModel } from '../../../domain/addresses/address.model';
export class AddressOption {

  value: AddressModel;
  description: string;

  constructor (addressModel: AddressModel, description: string) {
    this.value = addressModel;
    this.description = (description == null)
        ? this.value.AddressLine1
            +  this.prefixWithCommaIfPresent(this.value.AddressLine2)
              +  this.prefixWithCommaIfPresent(this.value.AddressLine3)
                + ', ' + this.value.PostTown
                  : description;
  }

  private prefixWithCommaIfPresent(value: string) {
    return value ? ', ' + value : value;
  }

}
