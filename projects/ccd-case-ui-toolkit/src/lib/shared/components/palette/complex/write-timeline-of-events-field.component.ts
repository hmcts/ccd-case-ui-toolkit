import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { DATE_INPUT_INVALID, DATE_INPUT_REQUIRED, TIMELINE_OF_EVENTS_DATE_INPUT } from './date-input-configuration';
import { WriteComplexFieldComponent } from './write-complex-field.component';

const DATE_LABEL_FIELD_ID = 'timelineDateLabel';

@Component({
  selector: 'ccd-write-timeline-of-events-field',
  templateUrl: './write-timeline-of-events-field.html',
  styleUrls: ['./read-complex-field-table.scss', './write-timeline-of-events-field.scss'],
  standalone: false
})
export class WriteTimelineOfEventsFieldComponent extends WriteComplexFieldComponent implements OnInit, OnDestroy {
  public dayControl: FormControl;
  public monthControl: FormControl;
  public yearControl: FormControl;

  private readonly dateInputSubscriptions: Subscription[] = [];

  constructor(isCompoundPipe: IsCompoundPipe, formValidatorsService: FormValidatorsService) {
    super(isCompoundPipe, formValidatorsService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.dayControl = this.complexGroup.get(TIMELINE_OF_EVENTS_DATE_INPUT.dayFieldId) as FormControl;
    this.monthControl = this.complexGroup.get(TIMELINE_OF_EVENTS_DATE_INPUT.monthFieldId) as FormControl;
    this.yearControl = this.complexGroup.get(TIMELINE_OF_EVENTS_DATE_INPUT.yearFieldId) as FormControl;
    this.configureDateInputControls();
    this.complexGroup.updateValueAndValidity({ emitEvent: true });
  }

  public ngOnDestroy(): void {
    this.dateInputSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public isDateInputPart(field: CaseField): boolean {
    return [
      TIMELINE_OF_EVENTS_DATE_INPUT.dayFieldId,
      TIMELINE_OF_EVENTS_DATE_INPUT.monthFieldId,
      TIMELINE_OF_EVENTS_DATE_INPUT.yearFieldId
    ].includes(field?.id);
  }

  public dateQuestionLabel(): string {
    return this.dateLabelField()?.label;
  }

  public dateInputHintText(): string {
    return this.dateLabelField()?.hint_text;
  }

  public hasOptionalDatePart(): boolean {
    return [
      TIMELINE_OF_EVENTS_DATE_INPUT.dayFieldId,
      TIMELINE_OF_EVENTS_DATE_INPUT.monthFieldId,
      TIMELINE_OF_EVENTS_DATE_INPUT.yearFieldId
    ].some((fieldId) => this.isDateInputPartOptional(fieldId));
  }

  public dateInputId(fieldId: string): string {
    const field = this.getConfiguredField(fieldId);
    return `${this.buildIdPrefix(field)}${field.id}`;
  }

  public dateInputLabel(fieldId: string, fallbackLabel: string): string {
    const label = this.getConfiguredField(fieldId)?.label || fallbackLabel;
    return this.isDatePartMandatory(fieldId) ? label : `${label} (optional)`;
  }

  public isDateInputPartOptional(fieldId: string): boolean {
    return !this.isDatePartMandatory(fieldId);
  }

  public dateInputHintId(): string {
    return `${this.id()}-date-hint`;
  }

  public dateInputGroupErrorId(): string {
    return `${this.id()}-date-error`;
  }

  public serviceHintId(): string {
    return `${this.id()}-service-hint`;
  }

  public hasVisibleError(control: FormControl): boolean {
    return !!control?.errors && (control.dirty || control.touched);
  }

  public hasVisibleDateInputError(): boolean {
    return [this.dayControl, this.monthControl, this.yearControl].some((control) => this.hasVisibleError(control));
  }

  public dateInputErrorMessage(): string {
    const controls = [this.dayControl, this.monthControl, this.yearControl];
    if (controls.some((control) => control?.errors?.[DATE_INPUT_REQUIRED])) {
      return 'Date is required';
    }
    if (controls.some((control) => control?.errors?.[DATE_INPUT_INVALID])) {
      return 'Enter a valid date';
    }
    return '';
  }

  public dateInputDescribedBy(): string {
    const ids = [this.dateInputHintId()];
    if (this.caseField.hint_text) {
      ids.push(this.serviceHintId());
    }
    if (this.hasVisibleDateInputError()) {
      ids.push(this.dateInputGroupErrorId());
    }
    return ids.join(' ');
  }

  public clearEmptyDatePart(control: FormControl): void {
    if (control.value === '') {
      control.setValue(null);
    }
  }

  private dateLabelField(): CaseField {
    return this.caseField?.field_type?.complex_fields?.find((field) => field?.id === DATE_LABEL_FIELD_ID);
  }

  private configureDateInputControls(): void {
    const configuration = TIMELINE_OF_EVENTS_DATE_INPUT;
    const partValidator = (fieldId: string, label: string) => (current: AbstractControl) => {
      const value = this.asText(current.value);
      if (!value) {
        return this.isDatePartMandatory(fieldId)
          ? { [DATE_INPUT_REQUIRED]: `${label[0].toUpperCase()}${label.slice(1)} is required` }
          : null;
      }
      const maxDigits = label === 'year' ? 4 : 2;
      if (!/^\d+$/.test(value) || value.length > maxDigits) {
        return { [DATE_INPUT_INVALID]: `Enter a valid ${label}` };
      }
      if (label === 'month' && (+value < 1 || +value > 12)) {
        return { [DATE_INPUT_INVALID]: 'Enter a valid month' };
      }
      if (label === 'year' && +value < 1) {
        return { [DATE_INPUT_INVALID]: 'Enter a valid year' };
      }
      return null;
    };

    this.monthControl.setValidators(partValidator(configuration.monthFieldId, 'month'));
    this.yearControl.setValidators(partValidator(configuration.yearFieldId, 'year'));
    this.monthControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.yearControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    const validDateValidator = (control: AbstractControl) => {
      const day = this.asText(control.value);
      const month = this.asText(this.monthControl.value);
      const year = this.asText(this.yearControl.value);
      if (!day || !month || !year || !/^\d+$/.test(day) || !/^\d+$/.test(month) || !/^\d+$/.test(year)
        || +month < 1 || +month > 12 || +year < 1) {
        return null;
      }

      const daysInMonth = this.daysInMonth(+month, +year);
      return +day >= 1 && +day <= daysInMonth
        ? null
        : { [DATE_INPUT_INVALID]: 'Enter a valid date' };
    };
    this.dayControl.setValidators([
      partValidator(configuration.dayFieldId, 'day'),
      validDateValidator
    ]);
    this.dayControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    [this.monthControl, this.yearControl].forEach((control) => {
      this.dateInputSubscriptions.push(control.valueChanges.subscribe(() => {
        this.dayControl.updateValueAndValidity({ emitEvent: false });
      }));
    });
  }

  private getConfiguredField(fieldId: string): CaseField {
    return this.caseField?.field_type?.complex_fields?.find((field) => field?.id === fieldId);
  }

  private isDatePartMandatory(fieldId: string): boolean {
    return !this.ignoreMandatory
      && this.getConfiguredField(fieldId)?.display_context?.toUpperCase() !== 'OPTIONAL';
  }

  private asText(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private daysInMonth(month: number, year: number): number {
    if (month < 1 || month > 12 || year < 1) {
      return 0;
    }
    if (month === 2) {
      const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      return isLeapYear ? 29 : 28;
    }
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
  }
}
