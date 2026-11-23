import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { CaseEditValidationError } from '../../../commons/case-edit-data/case-edit-validation.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';

/* 
  DatePickerRangeComponent is a reusable component for selecting a date range with "Date From" and "Date To" fields.
 */
@Component({
  selector: 'ccd-date-picker-range',
  templateUrl: './date-picker-range.component.html',
  styleUrls: ['./date-picker-range.component.scss'],
  standalone: false
})
export class DatePickerRangeComponent {
  public static readonly DATE_FROM = 'dateFrom';
  public static readonly DATE_TO = 'dateTo';
  public static readonly DATE_RANGE_ERROR = 'dateRange';
  public static readonly DATE_RANGE_ERROR_MESSAGE = 'Date To must be the same as or later than Date From';
  public static readonly INVALID_DATE_ERROR_MESSAGE = 'is not valid. Please provide a valid date';
  public static readonly MIN_DATE_ERROR_MESSAGE = 'is older than the minimum date allowed';
  public static readonly MAX_DATE_ERROR_MESSAGE = 'is later than the maximum date allowed';

  @Input() public formGroup: FormGroup = new FormGroup({});
  @Output() public validationErrors: EventEmitter<CaseEditValidationError[]> =
    new EventEmitter<CaseEditValidationError[]>();

  public dateRangeErrors: CaseEditValidationError[] = [];

  // Create datetime picker fields for "Date From" and "Date To"
  public readonly dateFromField: CaseField = FieldsUtils.convertToCaseField({
    id: DatePickerRangeComponent.DATE_FROM,
    label: 'Date From',
    display_context: 'OPTIONAL',
    display_context_parameter: '#DATETIMEENTRY(DD/MM/YYYY)',
    field_type: { id: 'DateTime', type: 'DateTime' }
  });

  public readonly dateToField: CaseField = FieldsUtils.convertToCaseField({
    id: DatePickerRangeComponent.DATE_TO,
    label: 'Date To',
    display_context: 'OPTIONAL',
    display_context_parameter: '#DATETIMEENTRY(DD/MM/YYYY)',
    field_type: { id: 'DateTime', type: 'DateTime' }
  });

  // From parent component, determine if a control is part of the date range
  public static isRangeControl(controlName: string): boolean {
    return controlName === DatePickerRangeComponent.DATE_FROM || controlName === DatePickerRangeComponent.DATE_TO;
  }

  // Set range as minimum and maximum times for the date range controls
  // Will be overridden by elasticsearch settings but provides default behaviour for other use cases
  public normaliseDateRange(): void {
    this.setDateRangeTime(DatePickerRangeComponent.DATE_FROM, 0, 0);
    this.setDateRangeTime(DatePickerRangeComponent.DATE_TO, 23, 59);
  }

  // Reset the date range controls
  public reset(): void {
    this.formGroup.get(DatePickerRangeComponent.DATE_FROM)?.reset();
    this.formGroup.get(DatePickerRangeComponent.DATE_TO)?.reset();
    this.validateDateRange();
  }

  // Confirm that the range of the datetime pickers are valid
  public validateDateRange(): CaseEditValidationError[] {
    const dateFrom = this.formGroup.get(DatePickerRangeComponent.DATE_FROM);
    const dateTo = this.formGroup.get(DatePickerRangeComponent.DATE_TO);
    const isInvalidRange = dateFrom?.valid && dateTo?.valid && this.isValidDate(dateFrom) && this.isValidDate(dateTo)
      && moment(dateTo.value).isBefore(moment(dateFrom.value));

    this.setFormGroupRangeError(isInvalidRange as boolean);
    // Get any validation errors for the individual date controls
    const errors = [
      this.getControlValidationError(DatePickerRangeComponent.DATE_FROM, this.dateFromField.label),
      this.getControlValidationError(DatePickerRangeComponent.DATE_TO, this.dateToField.label)
    ].filter((error): error is CaseEditValidationError => Boolean(error));

    // if date range invalid, add a validation error for the "Date To" field
    if (isInvalidRange) {
      errors.push({
        id: DatePickerRangeComponent.DATE_TO,
        message: DatePickerRangeComponent.DATE_RANGE_ERROR_MESSAGE
      });
    }

    this.dateRangeErrors = errors;
    this.validationErrors.emit(errors);
    return errors;
  }

  private setDateRangeTime(controlName: string, hour: number, minute: number): void {
    const control = this.formGroup.get(controlName);
    if (!control || !control.value) {
      return;
    }

    const date = moment(control.value);
    if (date.isValid()) {
      control.setValue(date.hour(hour).minute(minute).second(0).millisecond(0).format('YYYY-MM-DDTHH:mm:ss.SSS'));
    }
  }

  private isValidDate(control: AbstractControl): boolean {
    return Boolean(control?.value) && moment(control.value, moment.ISO_8601, true).isValid();
  }

  private getControlValidationError(controlName: string, label: string): CaseEditValidationError | null {
    const control = this.formGroup.get(controlName);
    if (!control) {
      return null;
    }

    let message: string;
    if (control.hasError('matDatetimePickerMin')) {
      message = `${label} ${DatePickerRangeComponent.MIN_DATE_ERROR_MESSAGE}`;
    } else if (control.hasError('matDatetimePickerMax')) {
      message = `${label} ${DatePickerRangeComponent.MAX_DATE_ERROR_MESSAGE}`;
    } else if (control.hasError('matDatetimePickerParse')
      || (control.value && !moment(control.value, moment.ISO_8601, true).isValid())) {
      message = `${label} ${DatePickerRangeComponent.INVALID_DATE_ERROR_MESSAGE}`;
    } else {
      return null;
    }

    return { id: controlName, message };
  }

  private setFormGroupRangeError(isInvalidRange: boolean): void {
    const errors = { ...this.formGroup.errors };
    if (isInvalidRange) {
      errors[DatePickerRangeComponent.DATE_RANGE_ERROR] = DatePickerRangeComponent.DATE_RANGE_ERROR_MESSAGE;
    } else {
      delete errors[DatePickerRangeComponent.DATE_RANGE_ERROR];
    }
    this.formGroup.setErrors(Object.keys(errors).length ? errors : null);
  }
}
