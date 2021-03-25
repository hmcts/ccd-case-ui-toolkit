import { NGX_MAT_DATE_FORMATS, NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { CaseField } from '../../../domain';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import * as moment from 'moment';
import { NgxMatDateFormats } from '@angular-material-components/datetime-picker/lib/core/date-formats';

// @dynamic
@Component({
  selector: 'ccd-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class DatetimePickerComponent extends AbstractFormFieldComponent implements OnInit, OnDestroy {

  inputSubscription: Subscription;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public disableMinute = false;
  public hideTime = false;
  public hideMinutes = false;
  public hideSeconds = false;
  @Input() public dateControl: FormControl = new FormControl(new Date());

  @ViewChild('picker') datetimePicker: NgxMatDatetimePicker<any>;
  @ViewChild('input') inputElement: ElementRef<HTMLInputElement>;

  constructor(@Inject(NGX_MAT_DATE_FORMATS) private dateFormatter: NgxMatDateFormats) {
    super();
  }

  ngOnInit(): void {
    console.log('caseField', this.caseField);
    this.subscribeToInputChanges();
    const configuredDate = this.configure(this.caseField);
    this.dateControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  ngOnDestroy(): void {
    this.inputSubscription.unsubscribe();
  }

  minDate(caseField: CaseField): Date {
    return caseField.field_type.min ? new Date(caseField.field_type.min) : null;
  }

  maxDate(caseField: CaseField): Date {
    return caseField.field_type.max ? new Date(caseField.field_type.max) : null;
  }

  configure(caseField: CaseField): Date {
    if (this.hasYearMonthDay(caseField.value) && !this.hasHoursAndMinutes(caseField.value) || caseField.field_type.type === 'DateTime') {
      this.hideTime = false;
      return new Date(caseField.value);
    }

    if (this.hasNoMinutesAndSeconds(caseField.value)) {
      this.hideMinutes = false;
    }
    return new Date(caseField.value);
  }

  hasYearMonthDay(value: string): boolean {
    return value && value.indexOf(':') >= 0;
  }

  hasHoursAndMinutes(value: string): boolean {
    return value && value.indexOf(':') >= 0;
  }

  hasNoMinutesAndSeconds(value: string): boolean {
    return value && value.indexOf(':') >= 0;
  }

  hasNoSeconds(value: string): boolean {
    return value && value.indexOf(':') >= 0;
  }

  is24Hour(value: string): boolean {
    return value && value.indexOf(':') >= 0;
  }

  subscribeToInputChanges(): void {
    console.log(this.inputElement, 'input')
    this.inputSubscription = fromEvent(this.inputElement.nativeElement, 'input')
      .pipe(
        debounceTime(1000),
        map((inputEvent: Event) => (<HTMLInputElement>inputEvent.target).value)
      )
      .subscribe((dateString) => {
        console.log('dateString', dateString);
        const format = 'DD/MM/YYYY'
        const parsed = moment(dateString, format);
        console.log('parsed', parsed.toISOString());
        this.dateControl.patchValue(parsed.toDate())
      })
  }
}
