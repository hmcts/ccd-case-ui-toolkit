import {
  NGX_MAT_DATE_FORMATS,
  NgxMatDateAdapter,
  NgxMatDateFormats,
  NgxMatDatetimePicker
} from '@angular-material-components/datetime-picker';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { CaseField } from '../../../domain';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';

@Component({
  selector: 'ccd-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS},
    {provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter}]
})

export class DatetimePickerComponent extends AbstractFormFieldComponent implements OnInit {

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
  public startView = 'month';
  @Input() public dateControl: FormControl = new FormControl(new Date());

  @ViewChild('picker') datetimePicker: NgxMatDatetimePicker<any>;
  @ViewChild('input') inputElement: ElementRef<HTMLInputElement>;
  private dateTimePickerFormat = 'DD MM YYYY, hh:mm';

  constructor(private readonly formatTranslationService: FormatTranslatorService,
              @Inject(NGX_MAT_DATE_FORMATS) private ngxMatDateFormats: NgxMatDateFormats) {
    super();
  }

  ngOnInit(): void {
    this.caseFieldEntryFormatting();
    this.configureDatePicker(this.caseField.dateTimeEntryFormat || this.dateTimePickerFormat);
    this.dateControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  minDate(caseField: CaseField): Date {
    return caseField.field_type.min ? new Date(caseField.field_type.min) : null;
  }

  maxDate(caseField: CaseField): Date {
    return caseField.field_type.max ? new Date(caseField.field_type.max) : null;
  }

  configureDatePicker(dateTimePickerFormat: string): void {
    if (this.formatTranslationService.hasSeconds(dateTimePickerFormat)) {
      this.showSeconds = true;
      this.hideMinutes = false;
      this.disableMinute = false;
      this.hideTime = false;
      if (!this.formatTranslationService.is24Hour(dateTimePickerFormat)) {
        this.enableMeridian = true;
      }
    }
    if (this.formatTranslationService.hasHours(dateTimePickerFormat)) {
      this.hideTime = false;
      if (!this.formatTranslationService.is24Hour(dateTimePickerFormat)) {
        this.enableMeridian = true;
      }
      return;
    }

    if (this.formatTranslationService.hasMinutes(dateTimePickerFormat)) {
      this.hideMinutes = false;
      this.disableMinute = false;
      this.hideTime = false;
      if (!this.formatTranslationService.is24Hour(dateTimePickerFormat)) {
        this.enableMeridian = true;
      }
      return;
    }

    if (this.formatTranslationService.hasDate(dateTimePickerFormat)) {
      return;
    }

    if (this.formatTranslationService.hasNoDay(dateTimePickerFormat)) {
      this.startView = 'year';
    }

    if (this.formatTranslationService.hasNoDayAndMonth(dateTimePickerFormat)) {
      this.startView = 'multi-year';
    }
  }

  private caseFieldEntryFormatting() {
    this.ngxMatDateFormats.parse.dateInput = this.caseField.dateTimeEntryFormat || this.dateTimePickerFormat;
    this.ngxMatDateFormats.display.dateInput = this.caseField.dateTimeEntryFormat || this.dateTimePickerFormat;

    if (this.caseField.month_format) {
      this.ngxMatDateFormats.display.monthYearLabel = this.caseField.month_format;
      this.ngxMatDateFormats.display.dateA11yLabel = this.caseField.month_format;
      this.ngxMatDateFormats.display.monthYearA11yLabel = this.caseField.month_format;
    }
  }
}
