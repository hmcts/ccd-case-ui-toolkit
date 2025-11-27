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
          PaletteUtilsModule,
          inputComponentMock
        ],
        declarations: [
          DateInputComponent,
          MockRpxTranslatePipe
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

  it('should convert UTC to local time when isDateTime is true and value contains T', () => {
    component.isDateTime = true;
    // using a fixed UTC time: 2025-04-09T12:00:00.542Z (noon UTC)
    // in Europe/London timezone (BST UTC+1 in April), this becomes 13:00:00 local time
    component.writeValue('2025-04-09T12:00:00.542Z');

    expect(component.displayYear).toBeTruthy();
    expect(component.displayMonth).toBeTruthy();
    expect(component.displayDay).toBeTruthy();
    expect(component.displayHour).toBeTruthy();
    expect(component.displayMinute).toBeTruthy();
    expect(component.displaySecond).toBeTruthy();

    // verify the date parts are correct for Europe/London timezone
    expect(component.displayYear).toBe('2025');
    expect(component.displayMonth).toBe('04');
    expect(component.displayDay).toBe('09');
    expect(component.displayHour).toBe('13');
    expect(component.displayMinute).toBe('00');
    expect(component.displaySecond).toBe('00');
  });

  it('should handle DateTime fields without timezone indicator', () => {
    component.isDateTime = true;
    // without timezone indicator, the value is treated as UTC and converted to local time
    // 2025-04-09T08:02:27.542 UTC becomes 09:02:27 in Europe/London (BST UTC+1)
    component.writeValue('2025-04-09T08:02:27.542');

    expect(component.displayYear).toBeTruthy();
    expect(component.displayMonth).toBeTruthy();
    expect(component.displayDay).toBeTruthy();
    expect(component.displayHour).toBeTruthy();
    expect(component.displayMinute).toBeTruthy();
    expect(component.displaySecond).toBeTruthy();

    // verify the UTC to local conversion for Europe/London timezone
    expect(component.displayYear).toBe('2025');
    expect(component.displayMonth).toBe('04');
    expect(component.displayDay).toBe('09');
    expect(component.displayHour).toBe('09');
    expect(component.displayMinute).toBe('02');
    expect(component.displaySecond).toBe('27');
  });

  it('should parse Date fields normally when isDateTime is false', () => {
    component.isDateTime = false;
    component.writeValue('2021-04-09');

    expect(component.displayYear).toBe('2021');
    expect(component.displayMonth).toBe('04');
    expect(component.displayDay).toBe('09');
  });

  it('should parse Date fields with time part when isDateTime is false', () => {
    component.isDateTime = false;
    component.writeValue('2021-04-09T08:02:27.542');

    expect(component.displayYear).toBe('2021');
    expect(component.displayMonth).toBe('04');
    expect(component.displayDay).toBe('09');
    expect(component.displayHour).toBe('08');
    expect(component.displayMinute).toBe('02');
    expect(component.displaySecond).toBe('27');
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
    it('year input should be valid for a string value', async () => {
      component.id = 'yearInput';
      component.yearChange('2021');
      component.displayYear = '2021';
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.yearId()}`)).componentInstance;
      expect(input.value).toBe('2021');
    });

    it('year input should be null for a null value', async () => {
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

  describe('hour input component', () => {
    it('hour input should be valid for a string value', async () => {
      component.id = 'hourInput';
      component.isDateTime = true;
      component.hourChange('08');
      component.displayHour = '08';
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.hourId()}`)).componentInstance;
      expect(input.value).toBe('08');
    });

    it('hour input should be null for a null value', async () => {
      component.id = 'hourInput';
      component.isDateTime = true;
      component.hourChange(null);
      component.displayHour = null;
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.hourId()}`)).componentInstance;
      expect(input.value).toBeNull();
    });

    it('should return the correct hourId', () => {
      component.id = 'startDateTime';

      const result = component.hourId();

      expect(result).toBe('startDateTime-hour');
    });
  });

  describe('minute input component', () => {
    it('minute input should be valid for a string value', async () => {
      component.id = 'minuteInput';
      component.isDateTime = true;
      component.minuteChange('02');
      component.displayMinute = '02';
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.minuteId()}`)).componentInstance;
      expect(input.value).toBe('02');
    });

    it('minute input should be null for a null value', async () => {
      component.id = 'minuteInput';
      component.isDateTime = true;
      component.minuteChange(null);
      component.displayMinute = null;
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.minuteId()}`)).componentInstance;
      expect(input.value).toBeNull();
    });

    it('should return the correct minuteId', () => {
      component.id = 'startDateTime';

      const result = component.minuteId();

      expect(result).toBe('startDateTime-minute');
    });
  });

  describe('second input component', () => {
    it('second input should be valid for a string value', async () => {
      component.id = 'secondInput';
      component.isDateTime = true;
      component.secondChange('27');
      component.displaySecond = '27';
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.secondId()}`)).componentInstance;
      expect(input.value).toBe('27');
    });

    it('second input should be null for a null value', async () => {
      component.id = 'secondInput';
      component.isDateTime = true;
      component.secondChange(null);
      component.displaySecond = null;
      fixture.detectChanges();
      const input = await de.query(By.css(`#${component.secondId()}`)).componentInstance;
      expect(input.value).toBeNull();
    });

    it('should return the correct secondId', () => {
      component.id = 'startDateTime';

      const result = component.secondId();

      expect(result).toBe('startDateTime-second');
    });
  });

  describe('DateTime UTC conversion in viewValue', () => {
    beforeEach(() => {
      component.isDateTime = true;
      component.id = 'dateTimeField';
    });

    it('should convert local time to UTC when isDateTime is true', () => {
      component.registerOnChange(onChange);

      // set local time values (Europe/London BST is UTC+1 in April)
      // local time: 2025-04-09 08:02:27 BST
      component.yearChange('2025');
      component.monthChange('04');
      component.dayChange('09');
      component.hourChange('08');
      component.minuteChange('02');
      component.secondChange('27');

      // The onChange should have been called with UTC time
      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.calls.mostRecent().args[0];

      // verify correct conversion: 08:02:27 BST (UTC+1) should become 07:02:27 UTC
      expect(calledValue).toBe('2025-04-09T07:02:27.000');
    });

    it('should return invalid date string when moment cannot parse it', () => {
      component.registerOnChange(onChange);

      component.yearChange('2025');
      component.monthChange('13'); // Invalid month
      component.dayChange('32'); // Invalid day
      component.hourChange('08');
      component.minuteChange('02');
      component.secondChange('27');

      // should still return the formatted string for validation to catch
      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.calls.mostRecent().args[0];
      expect(calledValue).toBe('2025-13-32T08:02:27.000');
    });

    it('should pad single digit values correctly', () => {
      component.registerOnChange(onChange);

      // set single digit values (Europe/London BST is UTC+1 in April)
      // local time: 2025-04-09 08:02:07 BST should become 2025-04-09 07:02:07 UTC
      component.yearChange('2025');
      component.monthChange('4'); // Single digit
      component.dayChange('9'); // Single digit
      component.hourChange('8'); // Single digit
      component.minuteChange('2'); // Single digit
      component.secondChange('7'); // Single digit

      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.calls.mostRecent().args[0];

      // verify padding was applied and correct UTC conversion
      expect(calledValue).toBe('2025-04-09T07:02:07.000');
    });

    it('should return null when no values are set', () => {
      component.registerOnChange(onChange);
      component.dayChange('');

      const calledValue = onChange.calls.mostRecent().args[0];
      expect(calledValue).toBeNull();
    });
  });

  describe('Date fields without time conversion', () => {
    beforeEach(() => {
      component.isDateTime = false;
      component.id = 'dateField';
    });

    it('should return date without time when isDateTime is false', () => {
      component.registerOnChange(onChange);

      component.yearChange('2025');
      component.monthChange('04');
      component.dayChange('09');

      expect(onChange).toHaveBeenCalled();
      const calledValue = onChange.calls.mostRecent().args[0];
      expect(calledValue).toBe('2025-04-09');
    });
  });
});