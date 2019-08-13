import { AddressModel } from '../../../domain/addresses/address.model';
export class AddressOption {

  description: string;

  value: AddressModel;

  constructor (addressModel: AddressModel, description: string) {
    if (description == null) {
      this.value = addressModel;
      this.description = this.getDescription();
    } else {
      this.description = description;
    }
  }

  private getDescription() {
    return this.removeInitialCommaIfPresent(
      (this.value.AddressLine1 === undefined ? '' : this.value.AddressLine1)
      +  this.prefixWithCommaIfPresent(this.value.AddressLine2)
      +  this.prefixWithCommaIfPresent(this.value.AddressLine3)
      + ', ' + this.value.PostTown
    );
  }

  private prefixWithCommaIfPresent(value: string) {
    return value ? ', ' + value : value;
  }

  private removeInitialCommaIfPresent(value: string) {
    return value.replace(new RegExp('^,', 'gi'), '');
  }

}
