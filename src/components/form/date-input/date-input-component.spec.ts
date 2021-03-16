import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DateInputComponent } from './date-input.component';
import { DebugElement } from '@angular/core';
import { PaletteUtilsModule } from '../../../shared/components/palette/utils/utils.module';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng2-mock-component';
import createSpy = jasmine.createSpy;

describe('Date input component', function () {
  let fixture: ComponentFixture<DateInputComponent>;
  let component: DateInputComponent;
  let de: DebugElement;
  let Input: any;
  let onChange;
  const DATE = '2018-04-09T08:02:27.542';
  const INVALIDDATE = 'x';
  beforeEach(async(() => {
    // Input is mocked so that one-way bound inputs can be tested
    Input = MockComponent({
      selector: 'input', inputs: [
        'type',
        'value',
        'change',
        'keyup',
        'disabled'
      ]
    });
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          DateInputComponent,

          // Mock
          Input
        ],
        providers: []
      })
      .compileComponents();
    fixture = TestBed.createComponent(DateInputComponent);
    component = fixture.componentInstance;
    onChange = createSpy('onChange');
    component.registerOnChange(onChange);
    de = fixture.debugElement;
    fixture.detectChanges();
  }));
  it('should verify day, month, year value from date', async () => {
    component.id = 'dateField'
    component.writeValue('2021-04-09T08:02:27.542');
    fixture.detectChanges();
    const monthInput = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
    expect(monthInput.value).toBe('04');
    const dayInput = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
    expect(dayInput.value).toBe('09');
    const yearInput = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
    expect(yearInput.value).toBe('2021');
  });
  it('should be valid when the date is in correct format', () => {
    const results = component.validate({ value: DATE } as FormControl);
    expect(results).toBeUndefined();
  });

  it('should be invalid when invalid date pattern', () => {
    const results = component.validate({ value: INVALIDDATE } as FormControl);
    expect(results).toEqual({ pattern: 'Date is not valid' });
  });

  it('should not valid when empty string and mandatory', () => {
    component.mandatory = true;
    const results = component.validate({ value: '' } as FormControl);
    expect(results).toEqual({ required: 'This field is required' });
  });

  it('should be valid when null', () => {
    const results = component.validate({ value: null } as FormControl);
    expect(results).toBeUndefined();
  });

  it('should not valid when null and mandatory', () => {
    component.mandatory = true;
    const results = component.validate({ value: null } as FormControl);
    expect(results).toEqual({ required: 'This field is required' });
  });

  describe('day input component', function () {
    it('day input should valid for a string value', async () => {
      component.id = 'dayInput';
      component.dayChange('09');
      component.displayDay = '09'
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
      expect(input.value).toBe('09');
    });

    it('day input should null for a null value', async () => {
      component.id = 'dayInput';
      component.dayChange(null);
      component.displayDay = null;
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
      expect(input.value).toBeNull();
    });

  })
  describe('month input component', function () {
    it('month input should valid for a string value', async () => {
      component.id = 'monthInput';
      component.monthChange('04');
      component.displayMonth = '04'
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
      expect(input.value).toBe('04');
    });
    it('month input should null for a null value', async () => {
      component.id = 'monthInput';
      component.monthChange(null);
      component.displayMonth = null;
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
      expect(input.value).toBeNull();
    });
  })
  describe('year input component', function () {

    it('year input should null for a null value', async () => {
      component.id = 'yearInput';
      component.yearChange('2021');
      component.displayYear = '2021'
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
      expect(input.value).toBe('2021');
    });

    it('year input should null for a null value', async () => {
      component.id = 'yearInput';
      component.yearChange(null);
      component.displayYear = null;
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
      expect(input.value).toBeNull();
    });
  })
});
