import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { AddressModel } from '../../../domain/addresses/address.model';
import { AddressOption } from './address-option.model';
import { AddressesService } from '../../../services/addresses/addresses.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IsCompoundPipe } from '../utils/is-compound.pipe';

@Component({
  selector: 'ccd-write-address-field',
  templateUrl: 'write-address-field.html',
  styleUrls: ['write-address-field.scss']
})
export class WriteAddressFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnChanges {

  @ViewChild('writeComplexFieldComponent')
  writeComplexFieldComponent: WriteComplexFieldComponent;

  addressesService: AddressesService;

  @Input()
  formGroup: FormGroup;

  addressFormGroup = new FormGroup({});
  postcode: FormControl;
  addressList: FormControl;

  addressOptions: AddressOption[];

  missingPostcode = false

  constructor (addressesService: AddressesService, private isCompoundPipe: IsCompoundPipe) {
    super();
    this.addressesService = addressesService;
  }

  ngOnInit(): void {
    if (!this.isComplexWithHiddenFields()) {
      this.postcode = new FormControl('');
      this.addressFormGroup.addControl('postcode', this.postcode);
      this.addressList = new FormControl('');
      this.addressFormGroup.addControl('address', this.addressList);
    }
  }

  findAddress() {

    if (!this.postcode.value) {
      this.missingPostcode = true;
    } else {
      this.missingPostcode = false;
      const postcode = this.postcode.value;
      this.caseField.value = null;
      this.addressOptions = new Array();
      this.addressesService.getAddressesForPostcode(postcode.replace(' ', '').toUpperCase()).subscribe(
        result => {
          result.forEach(
            address => {
              this.addressOptions.push(new AddressOption(address, null));
            }
          );
          this.addressOptions.unshift(
            new AddressOption(undefined, this.defaultLabel(this.addressOptions.length))
          );
        }, (error) => {
          console.log(`An error occurred retrieving addresses for postcode ${postcode}. ` + error);
          this.addressOptions.unshift(
            new AddressOption(undefined, this.defaultLabel(this.addressOptions.length))
          );
        });
      this.addressList.setValue(undefined);
      setTimeout(() => {
        if (document.getElementById(this.createId('addressList') + '')) {
          document.getElementById(this.createId('addressList') + '').focus();
        }
      }, 1000);
    }
  }

  blankAddress() {
    this.caseField.value = new AddressModel();
    this.setFormValue();
  }

  isComplexWithHiddenFields() {
    if (this.caseField.field_type.type === 'Complex' && this.caseField.field_type.complex_fields
      && this.caseField.field_type.complex_fields.some(cf => cf.hidden === true )) {
      return true;
    }
  }

  shouldShowDetailFields() {
    if (this.isComplexWithHiddenFields()) {
      return true;
    }
    if (this.isExpanded) {
      return true;
    }
    if (!this.writeComplexFieldComponent || !this.writeComplexFieldComponent.complexGroup) {
      return false;
    }
    const address = this.writeComplexFieldComponent.complexGroup.value;
    let hasAddress = false;
    if (address) {
      Object.keys(address).forEach(function (key) {
        if (address[key] != null) {
          hasAddress = true;
        }
      });
    }
    return hasAddress;
  }

  addressSelected() {
    this.caseField.value = this.addressList.value;
    this.setFormValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['caseField']) {
      this.setFormValue();
    }
  }

  createId(elementId: string): string {
    return this.id() + '_' + elementId ;
  }

  private defaultLabel(numberOfAddresses) {
    return numberOfAddresses === 0 ? 'No address found'
      : numberOfAddresses + (numberOfAddresses === 1 ? ' address ' : ' addresses ') + 'found';
  }

  private setFormValue() {
    if (this.writeComplexFieldComponent.complexGroup) {
      this.writeComplexFieldComponent.complexGroup.setValue(
        this.caseField.value
      );
    }
  }
}
