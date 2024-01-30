import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  public static readonly REQUIRED_ERROR_MESSAGE = 'Enter a Postcode';
  public static readonly INVALID_ERROR_MESSAGE = 'Enter a valid Postcode';

  public addressesService: AddressesService;

  @Input()
  public formGroup: FormGroup;

  public addressFormGroup = new FormGroup({});
  public postcode: FormControl;
  public addressList: FormControl;

  public addressOptions: AddressOption[];

  public errorMessage: string = WriteAddressFieldComponent.REQUIRED_ERROR_MESSAGE;

  public missingPostcode = false;
  public noAddressSelected = false;

  constructor(addressesService: AddressesService, private readonly isCompoundPipe: IsCompoundPipe) {
    super();
    this.addressesService = addressesService;
  }

  public ngOnInit(): void {
    if (!this.isComplexWithHiddenFields()) {
      this.postcode = new FormControl('', [Validators.required]);
      this.formGroup.addControl('postcode', this.postcode);
      this.addressList = new FormControl('');
      this.formGroup.addControl('address', this.addressList);
    }

    this.addressesService.getMandatoryError().subscribe((value: boolean) => {
      this.updateErrorsOnContinue(value);
    })
  }

  public findAddress() {
    this.noAddressSelected = false;
    if (!this.postcode.value) {
      this.errorMessage = WriteAddressFieldComponent.REQUIRED_ERROR_MESSAGE;
      this.missingPostcode = true;
    } else if (!this.postcode.value.match(/^(([A-Za-z]{1,2}[0-9][A-Za-z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?[0-9][A-Za-z]{2}|BFPO ?[0-9]{1,4}|(KY[0-9]|MSR|VG|AI)[ -]?[0-9]{4}|[A-Za-z]{2} ?[0-9]{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/)) {
      this.errorMessage = WriteAddressFieldComponent.INVALID_ERROR_MESSAGE;
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
    this.missingPostcode = false;
    this.noAddressSelected = false;
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
        if (address[key] !== null) {
          hasAddress = true;
        }
      });
    }
    return hasAddress;
  }

  public addressSelected() {
    this.caseField.value = this.addressList.value;
    this.setFormValue();
    this.noAddressSelected = false;
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

  private updateErrorsOnContinue(value: boolean): void {
    this.missingPostcode = value && !this.shouldShowDetailFields() && !this.addressOptions;
    this.noAddressSelected = value && !this.shouldShowDetailFields() && !!this.addressOptions;
    this.errorMessage = this.noAddressSelected ? 'Select an address' : this.errorMessage;
  }
}
