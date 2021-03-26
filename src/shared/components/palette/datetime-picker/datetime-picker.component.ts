import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter,
  NgxMatDateFormats,
  NgxMatDatetimePicker
} from '@angular-material-components/datetime-picker';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { CaseField } from '../../../domain';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

import * as moment from 'moment';
import { FormatTranslationService } from '../format-translation.service';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';

@Component({
  selector: 'ccd-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS},
    {provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter}]
})

export class DatetimePickerComponent extends AbstractFormFieldComponent implements OnInit, OnDestroy {
  [x: string]: any;

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
  public disableMinute = true;
  public hideTime = true;
  public hideMinutes = true;
  @Input() public dateControl: FormControl = new FormControl(new Date());

  @ViewChild('picker') datetimePicker: NgxMatDatetimePicker<any>;
  @ViewChild('input') inputElement: ElementRef<HTMLInputElement>;
  startView = 'month';

  constructor(private readonly formatTranslationService: FormatTranslationService,
    // tslint:disable-next-line:no-shadowed-variable
     @Inject(NGX_MAT_DATE_FORMATS) private CUSTOM_MOMENT_FORMATS: NgxMatDateFormats) {
    super();
  }

  ngOnInit(): void {
    this.caseFieldEntryFormatting();
    console.log('caseField', this.caseField);
    this.subscribeToInputChanges();
    // this.configureDatePicker(this.caseField);
    this.dateControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  private caseFieldEntryFormatting() {
    if (this.caseField.dateTimeEntryFormat) {
      this.CUSTOM_MOMENT_FORMATS.parse.dateInput = this.caseField.dateTimeEntryFormat;
      this.CUSTOM_MOMENT_FORMATS.display.dateInput = this.caseField.dateTimeEntryFormat;
    }
    if (this.caseField.month_format) {
      this.CUSTOM_MOMENT_FORMATS.display.monthYearLabel = this.caseField.month_format;
      this.CUSTOM_MOMENT_FORMATS.display.dateA11yLabel = this.caseField.month_format;
      this.CUSTOM_MOMENT_FORMATS.display.monthYearA11yLabel = this.caseField.month_format;
    }
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

  configureDatePicker(caseField: CaseField): void {
    if (this.formatTranslationService.hasSeconds(caseField.dateTimeDisplayFormat)) {
      this.showSeconds = true;
      this.hideMinutes = false;
      this.hideTime = false;
      return;
    }

    if (this.formatTranslationService.hasMinutes(caseField.dateTimeDisplayFormat)) {
      this.hideMinutes = false;
      this.hideTime = false;
      return;
    }

    if (this.formatTranslationService.hasTime(caseField.dateTimeDisplayFormat) &&
      this.formatTranslationService.hasDate(caseField.dateTimeDisplayFormat)) {
      this.hideTime = false;
      return;
    }

    if (!this.formatTranslationService.hasDay(caseField.dateTimeDisplayFormat)) {
      this.startView = 'year';
    }

    if (!this.formatTranslationService.hasMonth(caseField.dateTimeDisplayFormat) &&
      !this.formatTranslationService.hasDay(caseField.dateTimeDisplayFormat)) {
      this.startView = 'multi-year';
    }
  }

  subscribeToInputChanges(): void {
    this.inputSubscription = fromEvent(this.inputElement.nativeElement, 'blur')
      .pipe(
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
