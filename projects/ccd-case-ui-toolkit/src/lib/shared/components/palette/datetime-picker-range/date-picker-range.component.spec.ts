import { FormControl, FormGroup } from '@angular/forms';
import { DatePickerRangeComponent } from './date-picker-range.component';

describe('DatePickerRangeComponent', () => {
  let component: DatePickerRangeComponent;

  beforeEach(() => {
    component = new DatePickerRangeComponent();
    component.formGroup = new FormGroup({
      dateFrom: new FormControl('2026-11-01'),
      dateTo: new FormControl('2026-11-16')
    });
  });

  it('should set the range to the start and end of the selected days', () => {
    component.normaliseDateRange();

    expect(component.formGroup.get('dateFrom').value).toEqual('2026-11-01T00:00:00.000');
    expect(component.formGroup.get('dateTo').value).toEqual('2026-11-16T23:59:00.000');
  });

  it('should reset both date controls', () => {
    const validationErrorsSpy = spyOn(component.validationErrors, 'emit');

    component.reset();

    expect(component.formGroup.get('dateFrom').value).toBeNull();
    expect(component.formGroup.get('dateTo').value).toBeNull();
    expect(validationErrorsSpy).toHaveBeenCalledWith([]);
  });

  it('should leave empty, missing and invalid controls unchanged when normalising', () => {
    component.formGroup = new FormGroup({
      dateFrom: new FormControl(''),
      dateTo: new FormControl('2026-13-40')
    });

    component.normaliseDateRange();

    expect(component.formGroup.value).toEqual({ dateFrom: '', dateTo: '2026-13-40' });

    component.formGroup.removeControl('dateTo');
    expect(() => component.normaliseDateRange()).not.toThrow();
  });

  it('should identify its range controls', () => {
    expect(DatePickerRangeComponent.isRangeControl('dateFrom')).toBeTrue();
    expect(DatePickerRangeComponent.isRangeControl('dateTo')).toBeTrue();
    expect(DatePickerRangeComponent.isRangeControl('dynamicField')).toBeFalse();
  });

  it('should allow validation before the date controls are registered', () => {
    component.formGroup = new FormGroup({});

    expect(component.validateDateRange()).toEqual([]);
    expect(component.formGroup.errors).toBeNull();
  });

  it('should flag and emit an error when Date To is older than Date From', () => {
    component.formGroup.setValue({
      dateFrom: '2026-11-16',
      dateTo: '2026-11-01'
    });
    const validationErrorsSpy = spyOn(component.validationErrors, 'emit');

    const errors = component.validateDateRange();

    expect(errors).toEqual([{
      id: 'dateTo',
      message: DatePickerRangeComponent.DATE_RANGE_ERROR_MESSAGE
    }]);
    expect(component.formGroup.hasError(DatePickerRangeComponent.DATE_RANGE_ERROR)).toBeTrue();
    expect(validationErrorsSpy).toHaveBeenCalledWith(errors);
  });

  it('should allow Date To to be the same as Date From', () => {
    component.formGroup.setValue({
      dateFrom: '2026-11-16',
      dateTo: '2026-11-16'
    });

    expect(component.validateDateRange()).toEqual([]);
    expect(component.formGroup.hasError(DatePickerRangeComponent.DATE_RANGE_ERROR)).toBeFalse();
  });

  it('should clear only the range error when the range is corrected', () => {
    component.formGroup.setErrors({ existingError: true, dateRange: DatePickerRangeComponent.DATE_RANGE_ERROR_MESSAGE });

    component.validateDateRange();

    expect(component.formGroup.errors).toEqual({ existingError: true });
  });

  it('should report a non-empty invalid date even when the picker has not attached a parse error', () => {
    component.formGroup.setValue({ dateFrom: '', dateTo: 'x' });

    expect(component.validateDateRange()).toEqual([
      { id: 'dateTo', message: 'Date To is not valid. Please provide a valid date' }
    ]);
  });

  it('should report picker errors against the named date fields on the range', () => {
    const dateFrom = component.formGroup.get('dateFrom');
    const dateTo = component.formGroup.get('dateTo');
    dateFrom.setErrors({ matDatetimePickerParse: true });
    dateFrom.markAsDirty();
    dateTo.setErrors({ matDatetimePickerMin: true });
    dateTo.markAsDirty();

    const errors = component.validateDateRange();

    expect(errors).toEqual([
      { id: 'dateFrom', message: 'Date From is not valid. Please provide a valid date' },
      { id: 'dateTo', message: 'Date To is older than the minimum date allowed' }
    ]);
    expect(component.dateRangeErrors).toEqual(errors);
  });

  it('should report a maximum date error against the named date field on the range', () => {
    const dateTo = component.formGroup.get('dateTo');
    dateTo.setErrors({ matDatetimePickerMax: true });
    dateTo.markAsDirty();

    expect(component.validateDateRange()).toEqual([
      { id: 'dateTo', message: 'Date To is later than the maximum date allowed' }
    ]);
  });
});
