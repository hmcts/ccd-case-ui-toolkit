import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteAddressFieldComponent } from './write-address-field.component';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { By } from '@angular/platform-browser';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AddressesService } from '../../../services/addresses/addresses.service';
import { AddressModel } from '../../../domain/addresses/address.model';
import { of } from 'rxjs';
import { FieldLabelPipe } from '../utils/field-label.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';
import { IsCompoundPipe } from '../utils/is-compound.pipe';

describe('WriteAddressFieldComponent', () => {

  const CASE_FIELD_LABEL = 'Case Field Label';
  const $TITLE = By.css('h3');

  const $POSTCODE_LOOKUP = By.css('#postcodeLookup');
  const $POSTCODE_LOOKUP_INPUT = By.css('#postcodeInput');
  const $POSTCODE_LOOKUP_FIND = By.css('#postcodeLookup > button');
  const $POSTCODE_LOOKUP_ERROR_MESSAGE = By.css('.error-message');

  const $SELECT_ADDRESS = By.css('#selectAddress');
  const $ADDRESS_LIST = By.css('#selectAddress > #addressList');

  const $MANUAL_LINK = By.css('.manual-link');
  const $ADDRESS_COMPLEX_FIELD = By.css('ccd-write-complex-type-field');

  @Component({
    selector: `ccd-host-component`,
    template: `<ccd-write-address-field [caseField]="caseField" [registerControl]="registerControl"></ccd-write-address-field>`
  })
  class TestHostComponent {
    @ViewChild(WriteAddressFieldComponent)
    public componentUnderTest: WriteAddressFieldComponent;

    caseField = caseField(null);

    registerControl = () => {};
  }

  @Component({
    selector: `ccd-write-complex-type-field`,
    template: ``
  })
  class MockWriteComplexFieldComponent {

    @Input()
    caseField: CaseField;

    @Input()
    registerControl: (control: FormControl) => AbstractControl;

    @Input()
    idPrefix = '';

    @Input()
    ignoreMandatory = false;

    @Input()
    renderLabel: boolean;

    complexGroup = {
      value : {},
      setValue: (value) => { this.complexGroup.value = value; }
    };

  }

  let addressesService: AddressesService;
  let testHostComponent: TestHostComponent;
  let debugElement: DebugElement;
  let fixture: ComponentFixture<TestHostComponent>;

  function caseField(address: AddressModel) {
    return {
      id: 'caseFieldId',
      label: CASE_FIELD_LABEL,
      field_type: { id: 'FieldTypeId', type: 'Complex' },
      value: address
    };
  }

  function buildAddress(entryNo: number): AddressModel {
    const address = new AddressModel();
    address.AddressLine1 = 'AddressLine1-' + entryNo;
    address.AddressLine2 = 'AddressLine2-' + entryNo;
    address.AddressLine3 = 'AddressLine3-' + entryNo;
    address.PostTown = 'PostTown-' + entryNo;
    address.County = 'County-' + entryNo;
    address.PostCode = 'PostCode-' + entryNo;
    address.Country = 'Country-' + entryNo;
    return address;
  }

  function queryPostcode() {
    let postcodeField = fixture.debugElement.query($POSTCODE_LOOKUP_INPUT).nativeElement;
    postcodeField.value = 'P05T CDE';
    postcodeField.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    debugElement.query($POSTCODE_LOOKUP_FIND).triggerEventHandler('click', null);
    fixture.detectChanges();
  }

  beforeEach(async(() => {

    addressesService = new AddressesService(null, null);

    TestBed
      .configureTestingModule({
        imports: [
          ConditionalShowModule,
          ReactiveFormsModule,
        ],
        declarations: [
          WriteAddressFieldComponent,
          TestHostComponent,
          FieldLabelPipe,
          // Mocks
          MockWriteComplexFieldComponent,
        ],
        providers: [
          IsCompoundPipe,
          { provide: AddressesService, useValue: addressesService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    testHostComponent.caseField.value = null;

    debugElement = fixture.debugElement;
    fixture.detectChanges();

  }));

  it('should render only title, lookup component and manual link when address not set', () => {

    expect(debugElement.query($TITLE).nativeElement.innerHTML).toEqual(CASE_FIELD_LABEL);
    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeTruthy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeTruthy();

  });

  it('should render only address lines if field is search ', () => {
    testHostComponent.componentUnderTest.isExpanded = true; // false by default
    fixture.detectChanges();

    expect(debugElement.query($TITLE).nativeElement.innerHTML).toEqual(CASE_FIELD_LABEL);
    expect(debugElement.query($POSTCODE_LOOKUP)).toBeFalsy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

  });

  it('should render only title, lookup component and manual link when writeComplexFieldComponent is null', () => {
    testHostComponent.componentUnderTest.writeComplexFieldComponent = null;
    fixture.detectChanges();
    expect(debugElement.query($TITLE).nativeElement.innerHTML).toEqual(CASE_FIELD_LABEL);
    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeTruthy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeTruthy();

  });

  it('should render only title, lookup component and address when address set', () => {

    const address = new AddressModel();
    address.AddressLine1 = 'Address Line 1';
    address.AddressLine2 = 'Address Line 2';
    address.AddressLine3 = 'Address Line 3';
    address.PostTown = 'PostTown';
    address.County = 'County';
    address.PostCode = 'PostCode';
    address.Country = 'Country';

    testHostComponent.caseField = caseField(address);
    fixture.detectChanges();

    expect(debugElement.query($TITLE).nativeElement.innerHTML).toEqual(CASE_FIELD_LABEL);
    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value).toEqual(address);

  });

  it('should render a single option of \'No address found\' when no addresses are returned from AddressesService', () => {

    spyOn(addressesService, 'getAddressesForPostcode').and.returnValue(of([]));

    queryPostcode();

    expect(debugElement.query($MANUAL_LINK)).toBeTruthy();
    expect(addressesService.getAddressesForPostcode).toHaveBeenCalledWith('P05TCDE');
    expect(debugElement.query($SELECT_ADDRESS)).toBeTruthy();
    expect(debugElement.query($ADDRESS_LIST).children.length).toEqual(1);
    expect(debugElement.query($ADDRESS_LIST).children[0].nativeElement.innerHTML.trim()).toEqual('No address found');

  });

  it('should render a default \'summary item\' and 3 address options when 3 addresses are returned from AddressesService', () => {

    const address2 = buildAddress(2);
    address2.AddressLine2 = '';
    const address3 = buildAddress(3);
    address3.AddressLine3 = '';

    spyOn(addressesService, 'getAddressesForPostcode').and.returnValue(
      of([buildAddress(1), address2, address3])
    );

    queryPostcode();

    expect(addressesService.getAddressesForPostcode).toHaveBeenCalledWith('P05TCDE');
    expect(debugElement.query($MANUAL_LINK)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeTruthy();
    expect(debugElement.query($ADDRESS_LIST).children.length).toEqual(4);
    expect(debugElement.query($ADDRESS_LIST).children[0].nativeElement.innerHTML.trim()).toEqual('3 addresses found');

    expect(debugElement.query($ADDRESS_LIST).children[1].nativeElement.innerHTML.trim()).toEqual(
      'AddressLine1-1, AddressLine2-1, AddressLine3-1, PostTown-1'
    );
    expect(debugElement.query($ADDRESS_LIST).children[2].nativeElement.innerHTML.trim()).toEqual(
      'AddressLine1-2, AddressLine3-2, PostTown-2'
    );
    expect(debugElement.query($ADDRESS_LIST).children[3].nativeElement.innerHTML.trim()).toEqual(
      'AddressLine1-3, AddressLine2-3, PostTown-3'
    );

  });

  it('should populate the address with the option selected, removing the \'manual link\'', () => {

    const selectedAddress = buildAddress(1);
    testHostComponent.componentUnderTest.addressList.setValue(selectedAddress);
    testHostComponent.componentUnderTest.addressSelected();

    fixture.detectChanges();

    expect(debugElement.query($TITLE).nativeElement.innerHTML).toEqual(CASE_FIELD_LABEL);
    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value).toEqual(selectedAddress);

  });

  it('should populate a blank address when the \'manual link\' is clicked', () => {

    fixture.debugElement.query($MANUAL_LINK).nativeElement.dispatchEvent(new Event('click', null));
    fixture.detectChanges();

    expect(debugElement.query($TITLE).nativeElement.innerHTML).toEqual(CASE_FIELD_LABEL);
    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.AddressLine1).toEqual('');
    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.AddressLine2).toEqual('');
    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.AddressLine3).toEqual('');
    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.PostTown).toEqual('');
    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.County).toEqual('');
    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.PostCode).toEqual('');
    expect(testHostComponent.componentUnderTest.writeComplexFieldComponent.complexGroup.value.Country).toEqual('');

  });

  it('should render an error when postcode is blank', () => {

    debugElement.query($POSTCODE_LOOKUP_FIND).triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(debugElement.query($POSTCODE_LOOKUP_ERROR_MESSAGE)).toBeTruthy();

  });

  it('should clear the error when postcode is not blank', () => {

    testHostComponent.componentUnderTest.missingPostcode = true;
    fixture.detectChanges();

    queryPostcode();

    expect(debugElement.query($POSTCODE_LOOKUP_ERROR_MESSAGE)).toBeFalsy();

  });

});
