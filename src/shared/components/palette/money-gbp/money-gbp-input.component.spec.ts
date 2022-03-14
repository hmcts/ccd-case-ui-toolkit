import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { PaletteUtilsModule } from '../utils';
import { By } from '@angular/platform-browser';
import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { MockComponent } from 'ng2-mock-component';
import createSpy = jasmine.createSpy;

describe('MoneyGbpInputComponent', () => {

  const $INPUT = By.css('input');

  let fixture: ComponentFixture<MoneyGbpInputComponent>;
  let component: MoneyGbpInputComponent;
  let de: DebugElement;

  let Input: any;
  let onChange;

  beforeEach(async(() => {

    // Input is mocked so that one-way bound inputs can be tested
    Input = MockComponent({ selector: 'input', inputs: [
      'type',
      'value',
      'change',
      'keyup',
      'disabled'
    ]});

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          MoneyGbpInputComponent,

          // Mock
          Input
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(MoneyGbpInputComponent);
    component = fixture.componentInstance;

    onChange = createSpy('onChange');

    component.registerOnChange(onChange);

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should convert pences to pounds for display', () => {
    component.writeValue('12345');
    fixture.detectChanges();

    let input = de.query($INPUT).componentInstance;

    expect(input.value).toEqual('123.45');
  });

  it('should handle pences only', () => {
    component.writeValue('45');
    fixture.detectChanges();

    let input = de.query($INPUT).componentInstance;

    expect(input.value).toEqual('0.45');
  });

  it('should handle 0', () => {
    component.writeValue('0');
    fixture.detectChanges();

    let input = de.query($INPUT).componentInstance;

    expect(input.value).toEqual('0.00');
  });

  it('should handle null', () => {
    component.writeValue(null);
    fixture.detectChanges();

    let input = de.query($INPUT).componentInstance;

    expect(input.value).toBeNull();
  });

  it('should handle undefined', () => {
    component.writeValue(undefined);
    fixture.detectChanges();

    let input = de.query($INPUT).componentInstance;

    expect(input.value).toBeNull();
  });

  it('should convert pounds to pences', () => {
    component.onChange({ target: { value: '123'}});

    expect(onChange).toHaveBeenCalledWith('12300');
  });

  it('should convert pounds to pences with negative value', () => {
    component.onChange({ target: { value: '-123'}});

    expect(onChange).toHaveBeenCalledWith('-12300');
  });

  it('should convert pounds and pences to pences', () => {
    component.onChange({ target: { value: '123.45'}});

    expect(onChange).toHaveBeenCalledWith('12345');
  });

  it('should convert pounds and pences to pences with negative value', () => {
    component.onChange({ target: { value: '-123.45'}});

    expect(onChange).toHaveBeenCalledWith('-12345');
  });

  it('should convert partial pences to pences', () => {
    component.onChange({ target: { value: '123.1'}});

    expect(onChange).toHaveBeenCalledWith('12310');
  });

  it('should convert partial pences to pences with negative value', () => {
    component.onChange({ target: { value: '-123.1'}});

    expect(onChange).toHaveBeenCalledWith('-12310');
  });

  it('should convert pences only to pences', () => {
    component.onChange({ target: { value: '.1'}});

    expect(onChange).toHaveBeenCalledWith('10');
  });

  it('should convert pences only to pences with negative value', () => {
    component.onChange({ target: { value: '-.1'}});

    expect(onChange).toHaveBeenCalledWith('-10');
  });

  it('should keep empty ', () => {
    component.onChange({ target: { value: ''}});

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should keep null', () => {
    component.onChange({ target: { value: null}});

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should be invalid when contains letters', () => {
    let results = component.validate({ value: 'x'} as FormControl);

    expect(results['pattern']).toBeTruthy();
  });

  it('should be valid when digits', () => {
    let results = component.validate({ value: '12.34'} as FormControl);

    expect(results).toBeUndefined();
  });

  it('should be valid when digits with negative value', () => {
    let results = component.validate({ value: '-12.34'} as FormControl);

    expect(results).toBeUndefined();
  });

  it('should be invalid when too many decimal places', () => {
    let results = component.validate({ value: '12.345'} as FormControl);

    expect(results['pattern']).toBeTruthy();
  });

  it('should be invalid when too many decimal places with negative value', () => {
    let results = component.validate({ value: '-12.345'} as FormControl);

    expect(results['pattern']).toBeTruthy();
  });

  it('should be valid when empty string', () => {
    let results = component.validate({ value: ''} as FormControl);

    expect(results).toBeUndefined();
  });

  it('should not be valid when empty string and mandatory', () => {
    component.mandatory = true;
    let results = component.validate({ value: ''} as FormControl);

    expect(results).toEqual({pattern: 'This field is required'});
  });

  it('should be valid when null', () => {
    let results = component.validate({ value: null} as FormControl);

    expect(results).toBeUndefined();
  });

  it('should not be valid when null and mandatory', () => {
    component.mandatory = true;
    let results = component.validate({ value: null} as FormControl);

    expect(results).toEqual({pattern: 'This field is required'});
  });
});
