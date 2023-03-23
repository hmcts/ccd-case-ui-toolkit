import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FocusElementDirective } from '../../../directives/focus-element';
import { AddressModel } from '../../../domain/addresses/address.model';
import { AddressesService } from '../../../services/addresses/addresses.service';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { AddressOption } from './address-option.model';

@Component({
  selector: 'ccd-write-address-field',
  templateUrl: 'write-address-field.html',
  styleUrls: ['write-address-field.scss']
})
export class WriteAddressFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnChanges {
  @ViewChild('writeComplexFieldComponent', { static: false })
  public writeComplexFieldComponent: WriteComplexFieldComponent;

  @ViewChildren(FocusElementDirective)
  public focusElementDirectives: QueryList<FocusElementDirective>;

  public addressesService: AddressesService;

  @Input()
  public formGroup: FormGroup;

  public addressFormGroup = new FormGroup({});
  public postcode: FormControl;
  public addressList: FormControl;

  public addressOptions: AddressOption[];

  public missingPostcode = false;

  constructor(addressesService: AddressesService, private readonly isCompoundPipe: IsCompoundPipe) {
    super();
    this.addressesService = addressesService;
  }

  public ngOnInit(): void {
    if (!this.isComplexWithHiddenFields()) {
      this.postcode = new FormControl('');
      this.addressFormGroup.addControl('postcode', this.postcode);
      this.addressList = new FormControl('');
      this.addressFormGroup.addControl('address', this.addressList);
    }
  }

  public findAddress() {
    if (!this.postcode.value) {
      this.missingPostcode = true;
    } else {
      this.missingPostcode = false;
      const postcode = this.postcode.value;
      this.caseField.value = null;
      this.addressOptions = [];
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
          console.log(`An error occurred retrieving addresses for postcode ${postcode}. ${error}`);
          this.addressOptions.unshift(
            new AddressOption(undefined, this.defaultLabel(this.addressOptions.length))
          );
        });
      this.addressList.setValue(undefined);
      this.refocusElement();
    }
  }

  public refocusElement(): void {
    if (this.focusElementDirectives && this.focusElementDirectives.length > 0) {
      this.focusElementDirectives.first.focus();
    }
  }

  public blankAddress() {
    this.caseField.value = new AddressModel();
    this.setFormValue();
  }

  public isComplexWithHiddenFields() {
    if (this.caseField.isComplex() && this.caseField.field_type.complex_fields
      && this.caseField.field_type.complex_fields.some(cf => cf.hidden === true)) {
      return true;
    }
  }

  public shouldShowDetailFields() {
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
      Object.keys(address).forEach((key) => {
        if (address[key] != null) {
          hasAddress = true;
        }
      });
    }
    return hasAddress;
  }

  public addressSelected() {
    this.caseField.value = this.addressList.value;
    this.setFormValue();
  }

  public ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    const change = changes['caseField'];
    if (change) {
      this.setFormValue();
    }
  }

  public buildIdPrefix(elementId: string): string {
    return `${this.idPrefix}_${elementId}`;
  }

  private defaultLabel(numberOfAddresses) {
    return numberOfAddresses === 0 ? 'No address found'
      : `${numberOfAddresses}${numberOfAddresses === 1 ? ' address ' : ' addresses '}found`;
  }

  private setFormValue() {
    if (this.writeComplexFieldComponent.complexGroup) {
      this.writeComplexFieldComponent.complexGroup.setValue(
        this.caseField.value
      );
    }
  }
}
