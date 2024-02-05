import { Component, DebugElement, Input} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RpxTranslatePipe, RpxTranslationService } from 'rpx-xui-translation';
import { of } from 'rxjs';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { FocusElementModule } from '../../../directives/focus-element';
import { AddressModel, CaseField } from '../../../domain';
import { createFieldType } from '../../../fixture';
import { AddressesService } from '../../../services/addresses/addresses.service';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { FieldLabelPipe, PaletteUtilsModule } from '../utils';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { WriteAddressFieldComponent } from './write-address-field.component';

import createSpyObj = jasmine.createSpyObj;

describe('WriteAddressFieldComponent', () => {

  const CASE_FIELD_LABEL = 'Case Field Label';
  const POSTCODE = 'B6 6HE';
  const POSTCODE2 = 'B71 4LF';

  const $POSTCODE_LOOKUP = By.css('.postcodeLookup');
  const $POSTCODE_LOOKUP_INPUT = By.css('.postcodeinput');
  const $POSTCODE_LOOKUP_FIND = By.css('.postcodeLookup > button');
  const $POSTCODE_LOOKUP_ERROR_MESSAGE = By.css('.error-message');

  const $SELECT_ADDRESS = By.css('#selectAddress');
  const $ADDRESS_LIST = By.css('#selectAddress > .addressList');

  const $MANUAL_LINK = By.css('.manual-link');
  const $ADDRESS_COMPLEX_FIELD = By.css('ccd-write-complex-type-field');

  let addressesService: jasmine.SpyObj<AddressesService>;
  let writeAddressFieldComponent: WriteAddressFieldComponent;
  let debugElement: DebugElement;
  let fixture: ComponentFixture<WriteAddressFieldComponent>;
  let compoundPipe: jasmine.SpyObj<IsCompoundPipe>;
  let translatePipe: jasmine.SpyObj<RpxTranslatePipe>;

  @Component({
    selector: `ccd-write-complex-type-field`,
    template: ``
  })
  class MockWriteComplexFieldComponent {

    @Input()
    public caseField: CaseField;

    @Input()
    public parent?: FormGroup | FormArray;

    @Input()
    public idPrefix = '';

    @Input()
    public ignoreMandatory = false;

    @Input()
    public renderLabel: boolean;

    public complexGroup = {
      value: {},
      setValue: (value) => { this.complexGroup.value = value; }
    };

  }

  function caseField(address: AddressModel) {
    const field = new CaseField();
    field.id = 'caseFieldId';
    field.label = CASE_FIELD_LABEL;
    field.field_type = createFieldType('FieldTypeId', 'Complex');
    field.value = address;
    return field;
  }

  function addressFormGroup() {
    return new FormGroup({
      AddressLine1: new FormControl(),
      AddressLine2: new FormControl(),
      AddressLine3: new FormControl(),
      PostTown: new FormControl(),
      County: new FormControl(),
      PostCode: new FormControl(),
      Country: new FormControl()
    });
  }

  function buildAddress(entryNo: number): AddressModel {
    const address = new AddressModel();
    address.AddressLine1 = `AddressLine1-${entryNo}`;
    address.AddressLine2 = `AddressLine2-${entryNo}`;
    address.AddressLine3 = `AddressLine3-${entryNo}`;
    address.PostTown = `PostTown-${entryNo}`;
    address.County = `County-${entryNo}`;
    address.PostCode = `PostCode-${entryNo}`;
    address.Country = `Country-${entryNo}`;
    return address;
  }

  function queryPostcode(postcode: string) {
    const postcodeField = fixture.debugElement.query($POSTCODE_LOOKUP_INPUT).nativeElement;
    postcodeField.value = postcode;
    postcodeField.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    debugElement.query($POSTCODE_LOOKUP_FIND).triggerEventHandler('click', null);
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {

    addressesService = createSpyObj<AddressesService>('addressesService', ['getAddressesForPostcode', 'getMandatoryError']);
    compoundPipe = createSpyObj<IsCompoundPipe>('compoundPipe', ['transform']);
    compoundPipe.transform.and.returnValue(false);
    translatePipe = createSpyObj<RpxTranslatePipe>('translatePipe', ['transform']);
    translatePipe.transform.and.returnValue(false);
    TestBed
      .configureTestingModule({
        imports: [
          ConditionalShowModule,
          FocusElementModule,
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteAddressFieldComponent,
          FieldLabelPipe,
          MockRpxTranslatePipe,
          MockWriteComplexFieldComponent
        ],
        providers: [
          { provide: AddressesService, useValue: addressesService },
          { provide: IsCompoundPipe, useValue: compoundPipe },
          {
            provide: RpxTranslationService, useValue: jasmine.createSpyObj('RpxTranslationService',
              ['getTranslation$', 'translate'])
          }]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteAddressFieldComponent);
    writeAddressFieldComponent = fixture.componentInstance;
    writeAddressFieldComponent.caseField = caseField(null);
    writeAddressFieldComponent.formGroup = addressFormGroup();
    addressesService.getMandatoryError.and.returnValue(of(false));

    debugElement = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render only title, lookup component and manual link when address not set', () => {

    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeTruthy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeTruthy();

  });

  it('should render only address lines if field is search ', () => {
    writeAddressFieldComponent.isExpanded = true; // false by default
    fixture.detectChanges();

    expect(debugElement.query($POSTCODE_LOOKUP)).toBeFalsy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

  });

  it('should render only title, lookup component and manual link when writeComplexFieldComponent is null', () => {
    writeAddressFieldComponent.writeComplexFieldComponent = null;
    fixture.detectChanges();
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

    writeAddressFieldComponent.caseField = caseField(address);
    fixture.detectChanges();

    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    // expect(debugElement.query($MANUAL_LINK)).toBeFalsy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    //expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

    // expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value).toEqual(address);

  });

  it('should render a single option of \'No address found\' when no addresses are returned from AddressesService', () => {

    addressesService.getAddressesForPostcode.and.returnValue(of([]));

    queryPostcode(POSTCODE);

    expect(debugElement.query($MANUAL_LINK)).toBeTruthy();
    expect(addressesService.getAddressesForPostcode).toHaveBeenCalledWith('B66HE');
    expect(debugElement.query($SELECT_ADDRESS)).toBeTruthy();
    expect(debugElement.query($ADDRESS_LIST).children.length).toEqual(1);
    expect(debugElement.query($ADDRESS_LIST).children[0].nativeElement.innerHTML.trim()).toEqual('No address found');

  });

  it('should render a default \'summary item\' and 3 address options when 3 addresses are returned from AddressesService', () => {

    const address2 = buildAddress(2);
    address2.AddressLine2 = '';
    const address3 = buildAddress(3);
    address3.AddressLine3 = '';

    addressesService.getAddressesForPostcode.and.returnValue(
      of([buildAddress(1), address2, address3])
    );

    queryPostcode(POSTCODE);

    expect(writeAddressFieldComponent.missingPostcode).toBeFalsy();

    expect(addressesService.getAddressesForPostcode).toHaveBeenCalledWith('B66HE');
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
    writeAddressFieldComponent.addressList.setValue(selectedAddress);
    writeAddressFieldComponent.addressSelected();

    fixture.detectChanges();

    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();

    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value).toEqual(selectedAddress);

  });

  it('should populate a blank address when the \'manual link\' is clicked', () => {

    fixture.debugElement.query($MANUAL_LINK).nativeElement.dispatchEvent(new Event('click', null));
    fixture.detectChanges();

    expect(debugElement.query($POSTCODE_LOOKUP)).toBeTruthy();
    expect(debugElement.query($SELECT_ADDRESS)).toBeFalsy();
    expect(debugElement.query($MANUAL_LINK)).toBeFalsy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD)).toBeTruthy();
    expect(debugElement.query($ADDRESS_COMPLEX_FIELD).nativeElement['hidden']).toBeFalsy();

    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.AddressLine1).toEqual('');
    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.AddressLine2).toEqual('');
    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.AddressLine3).toEqual('');
    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.PostTown).toEqual('');
    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.County).toEqual('');
    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.PostCode).toEqual('');
    expect(writeAddressFieldComponent.writeComplexFieldComponent.complexGroup.value.Country).toEqual('');

  });

  it('should render an error when postcode is blank', () => {

    debugElement.query($POSTCODE_LOOKUP_FIND).triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(debugElement.query($POSTCODE_LOOKUP_ERROR_MESSAGE)).toBeTruthy();
  });

  it('should clear the error when postcode is not blank', () => {

    writeAddressFieldComponent.missingPostcode = true;
    fixture.detectChanges();

    queryPostcode(POSTCODE);

    expect(debugElement.query($POSTCODE_LOOKUP_ERROR_MESSAGE)).toBeFalsy();

  });

  it('should call focus directive for subsequent postcode searches', () => {
    // do the first search to display the address list
    addressesService.getAddressesForPostcode.and.returnValue(
      of([buildAddress(1)]));

    queryPostcode(POSTCODE);

    // for subsequent postcode searches (when the address list is already visible), the focus directive should be called
    spyOn(writeAddressFieldComponent.focusElementDirectives.first, 'focus');
    queryPostcode(POSTCODE2);

    expect(writeAddressFieldComponent.focusElementDirectives.first.focus).toHaveBeenCalled();
  });

  it('should update on value change of mandatory error', () => {
    expect(writeAddressFieldComponent.missingPostcode).toBe(false);

    addressesService.getMandatoryError.and.returnValue(of(true));
    writeAddressFieldComponent.ngOnInit();
    fixture.detectChanges();

    expect(writeAddressFieldComponent.missingPostcode).toBe(true);
  });

})