import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { PaletteUtilsModule } from '../../../shared/components/palette/utils/utils.module';
import { MockRpxTranslatePipe } from '../../../shared/test/mock-rpx-translate.pipe';
import { DateInputComponent } from './date-input.component';
import createSpy = jasmine.createSpy;

describe('Date input component', () => {
  let fixture: ComponentFixture<DateInputComponent>;
  let component: DateInputComponent;
  let de: DebugElement;
  let inputComponentMock: any;
  let onChange;
  const DATE = '2018-04-09T08:02:27.542';
  const INVALIDDATE = 'x';

  beforeEach(waitForAsync(() => {
    // Input is mocked so that one-way bound inputs can be tested
    inputComponentMock = MockComponent({
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
          MockRpxTranslatePipe,

          // Mocks
          inputComponentMock
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

  it('should initialize displayHour, displayMinute, displaySecond, hour, minute, and second if mandatory and isDateTime are true', () => {
    component.mandatory = true;
    component.isDateTime = true;

    component.ngOnInit();

    expect(component.displayHour).toBe('00');
    expect(component.displayMinute).toBe('00');
    expect(component.displaySecond).toBe('00');
  });

  it('should not initialize displayHour, displayMinute, displaySecond, hour, minute, and second if mandatory or isDateTime are false', () => {
    component.mandatory = false;
    component.isDateTime = true;

    component.ngOnInit();

    expect(component.displayHour).toBeNull();
    expect(component.displayMinute).toBeNull();
    expect(component.displaySecond).toBeNull();
  });

  it('should verify day, month, year value from date', async () => {
    component.id = 'dateField';
    component.writeValue('2021-04-09T08:02:27.542');
    fixture.detectChanges();
    const monthInput = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
    expect(monthInput.value).toBe('04');
    const dayInput = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
    expect(dayInput.value).toBe('09');
    const yearInput = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
    expect(yearInput.value).toBe('2021');
  });

  it('should verify day, month, year value from date', async () => {
    component.id = 'dateField';
    component.writeValue('someRandomValue');
    fixture.detectChanges();
    const monthInput = await de.query(By.css(`#${component.monthId()}`)).componentInstance;
    expect(monthInput.value).toBe('');
    const dayInput = await de.query(By.css(`#${component.dayId()}`)).componentInstance;
    expect(dayInput.value).toBe('');
    const yearInput = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
    expect(yearInput.value).toBe('someRandomValue');
  });

  it('should be valid when the date is in correct format', () => {
    const results = component.validate({ value: DATE } as FormControl);
    expect(results).toBeUndefined();
  });

  it('should be valid when the date is in correct format after 1900', () => {
    const results = component.validate({ value: '1900-01-01T00:00:00.000' } as FormControl);
    expect(results).toBeUndefined();
  });

  it('should be invalid when the date is before 1900', () => {
    const results = component.validate({ value: '1891-12-31T12:59:59.999' } as FormControl);
    expect(results).toEqual({ pattern: 'Date is not valid' });
  });

  it('should be invalid when the date is after 2099', () => {
    const results = component.validate({ value: '2100-01-01T00:00:00.000' } as FormControl);
    expect(results).toEqual({ pattern: 'Date is not valid' });
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

  describe('day input component', () => {
    it('day input should valid for a string value', async () => {
      component.id = 'dayInput';
      component.dayChange('09');
      component.displayDay = '09';
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
  });

  describe('month input component', () => {
    it('month input should valid for a string value', async () => {
      component.id = 'monthInput';
      component.monthChange('04');
      component.displayMonth = '04';
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
  });

  describe('year input component', () => {
    it('year input should null for a null value', async () => {
      component.id = 'yearInput';
      component.yearChange('2021');
      component.displayYear = '2021';
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

    it('should return the correct dayId when id includes "Date"', () => {
      component.id = 'startDate';

      const result = component.dayId();

      expect(result).toBe('startDate-day');
    });

    it('should return the correct dayId when id does not include "Date"', () => {
      component.id = 'start';

      const result = component.dayId();

      expect(result).toBe('start-day');
    });

    it('should return the correct monthId when id includes "Date"', () => {
      component.id = 'startDate';

      const result = component.monthId();

      expect(result).toBe('startDate-month');
    });

    it('should return the correct monthId when id does not include "Date"', () => {
      component.id = 'start';

      const result = component.monthId();

      expect(result).toBe('start-month');
    });

    it('should return the correct yearId when id includes "Date"', () => {
      component.id = 'startDate';

      const result = component.yearId();

      expect(result).toBe('startDate-year');
    });

    it('should return the correct yearId when id does not include "Date"', () => {
      component.id = 'start';

      const result = component.yearId();

      expect(result).toBe('start-year');
    });
  });
});