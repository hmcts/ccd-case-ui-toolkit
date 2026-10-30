import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import {
  DATE_INPUT_INVALID,
  DATE_INPUT_REQUIRED,
  DateInputPartConfiguration,
  TIMELINE_OF_EVENTS_DATE_INPUT
} from './date-input-configuration';
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
  public dateInputParts: Array<DateInputPartConfiguration & { control: FormControl }> = [];

  private readonly dateInputSubscriptions: Subscription[] = [];

  constructor(isCompoundPipe: IsCompoundPipe, formValidatorsService: FormValidatorsService) {
    super(isCompoundPipe, formValidatorsService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    const configuration = TIMELINE_OF_EVENTS_DATE_INPUT;
    this.dayControl = this.complexGroup.get(configuration.day.fieldId) as FormControl;
    this.monthControl = this.complexGroup.get(configuration.month.fieldId) as FormControl;
    this.yearControl = this.complexGroup.get(configuration.year.fieldId) as FormControl;
    this.dateInputParts = Object.values(configuration).map((part: DateInputPartConfiguration) => ({
      ...part,
      control: this.complexGroup.get(part.fieldId) as FormControl
    }));
    this.configureDateInputControls();
    this.complexGroup.updateValueAndValidity({ emitEvent: true });
  }

  public ngOnDestroy(): void {
    this.dateInputSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public isDateInputPart(field: CaseField): boolean {
    return this.dateInputParts.some((part) => part.fieldId === field?.id);
  }

  public dateQuestionLabel(): string {
    return this.dateLabelField()?.label;
  }

  public dateInputHintText(): string {
    return this.dateLabelField()?.hint_text;
  }

  public hasOptionalDatePart(): boolean {
    return this.dateInputParts.some((part) => this.isDateInputPartOptional(part.fieldId));
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
    const partValidator = (part: DateInputPartConfiguration) => (current: AbstractControl) => {
      const label = part.label.toLowerCase();
      const value = this.asText(current.value);
      if (!value) {
        return this.isDatePartMandatory(part.fieldId)
          ? { [DATE_INPUT_REQUIRED]: `${label[0].toUpperCase()}${label.slice(1)} is required` }
          : null;
      }
      if (!/^\d+$/.test(value) || value.length > part.maxLength) {
        return { [DATE_INPUT_INVALID]: `Enter a valid ${label}` };
      }
      if (part.fieldId === configuration.month.fieldId && !moment.utc([2000, Number(value) - 1, 1]).isValid()) {
        return { [DATE_INPUT_INVALID]: 'Enter a valid month' };
      }
      if (part.fieldId === configuration.year.fieldId) {
        const parsedYear = moment.utc([Number(value), 0, 1]);
        if (!parsedYear.isValid() || parsedYear.year() < 1) {
          return { [DATE_INPUT_INVALID]: 'Enter a valid year' };
        }
      }
      return null;
    };

    this.monthControl.setValidators(partValidator(configuration.month));
    this.yearControl.setValidators(partValidator(configuration.year));
    this.monthControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.yearControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    const validDateValidator = (control: AbstractControl) => {
      const day = this.asText(control.value);
      const month = this.asText(this.monthControl.value);
      const year = this.asText(this.yearControl.value);
      if (!day || !month || !year || !/^\d+$/.test(day) || !/^\d+$/.test(month) || !/^\d+$/.test(year)
        || this.monthControl.errors?.[DATE_INPUT_INVALID] || this.yearControl.errors?.[DATE_INPUT_INVALID]) {
        return null;
      }

      return moment.utc([Number(year), Number(month) - 1, Number(day)]).isValid()
        ? null
        : { [DATE_INPUT_INVALID]: 'Enter a valid date' };
    };
    this.dayControl.setValidators([
      partValidator(configuration.day),
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
}
