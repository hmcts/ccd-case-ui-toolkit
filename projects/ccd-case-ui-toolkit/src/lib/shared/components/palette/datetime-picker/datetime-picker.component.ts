import {
  NgxMatDateAdapter,
  NgxMatDateFormats,
  NgxMatDatetimePicker,
  NGX_MAT_DATE_FORMATS
} from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Moment } from 'moment/moment';

import * as moment from 'moment';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';

@Component({
  selector: 'ccd-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
    { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
  ]
})

export class DatetimePickerComponent extends AbstractFormFieldComponent implements OnInit {

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
  public yearSelection = false;
  public checkTime = true;
  public stringEdited = false;
  public minError = false;
  public maxError = false;
  public dateTimeEntryFormat: string;

  @ViewChild('picker', { static: false }) public datetimePicker: NgxMatDatetimePicker<any>;
  @ViewChild('input', { static: false }) public inputElement: ElementRef<HTMLInputElement>;

  @Input() public dateControl: FormControl = new FormControl(new Date());

  private minimumDate = new Date('01/01/1800');
  private maximumDate = null;
  private momentFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';

  constructor(private readonly formatTranslationService: FormatTranslatorService,
    @Inject(NGX_MAT_DATE_FORMATS) private readonly ngxMatDateFormats: NgxMatDateFormats) {
    super();
  }

  public ngOnInit(): void {
    this.dateTimeEntryFormat = this.formatTranslationService.showOnlyDates(this.caseField.dateTimeEntryFormat);
    this.configureDatePicker(this.dateTimeEntryFormat);
    // set date control based on mandatory field
    this.dateControl = (this.caseField.isMandatory ?
      this.registerControl(new FormControl(this.caseField.value || '', [Validators.required]))
       : this.registerControl(new FormControl(this.caseField.value))) as FormControl;
    // in resetting the format just after the page initialises, the input can be reformatted
    // otherwise the last format given will be how the text shown will be displayed
    setTimeout(() => {
      this.setDateTimeFormat();
      this.formatValueAndSetErrors();
    }, 1000);
    // when the status changes check that the maximum/minimum date has not been exceeded
    this.dateControl.statusChanges.subscribe(() => {
      this.minError = this.dateControl.hasError('matDatetimePickerMin');
      this.maxError = this.dateControl.hasError('matDatetimePickerMax');
    });
  }

  public setDateTimeFormat(): void {
    this.ngxMatDateFormats.parse.dateInput = this.dateTimeEntryFormat;
    this.ngxMatDateFormats.display.dateInput = this.dateTimeEntryFormat;
  }

  /*
  When the value changes, update the form control
  */
  public valueChanged(): void {
    this.formatValueAndSetErrors();
  }

  public focusIn(): void {
    this.setDateTimeFormat();
  }

  public focusOut(): void {
    // focus out needed to obtain errors (relevant to formatting)
    this.formatValueAndSetErrors();
  }

  public toggleClick(): void {
    this.setDateTimeFormat();
  }

  public minDate(caseField: CaseField): Date {
    // set minimum date
    if (caseField.field_type.min instanceof Date) {
      this.minimumDate = caseField.field_type.min ? new Date(caseField.field_type.min) : this.minimumDate;
    }
    return this.minimumDate;
  }

  public maxDate(caseField: CaseField): Date {
    // set maximum date
    if (caseField.field_type.max instanceof Date) {
      this.maximumDate = caseField.field_type.max ? new Date(caseField.field_type.max) : this.maximumDate;
    }
    return this.maximumDate;
  }

  public configureDatePicker(dateTimePickerFormat: string): void {
    if (this.caseField.field_type.type === 'Date') {
      this.hideTime = true;
      this.checkTime = false;
      this.dateTimeEntryFormat = this.formatTranslationService.removeTime(this.dateTimeEntryFormat);
      this.momentFormat = 'YYYY-MM-DD';
    }

    if (this.checkTime) {

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
    }

    if (this.formatTranslationService.hasDate(dateTimePickerFormat)) {
      return;
    }

    if (this.formatTranslationService.hasNoDay(dateTimePickerFormat)) {
      this.startView = 'multi-year';
    }

    if (this.formatTranslationService.hasNoDayAndMonth(dateTimePickerFormat)) {
      this.startView = 'multi-year';
      this.yearSelection = true;
    }
  }

  public yearSelected(event: Moment): void {
    if (this.startView === 'multi-year' && this.yearSelection) {
      this.dateControl.patchValue(event.toISOString());
      this.datetimePicker.close();
      this.valueChanged();
    }
  }

  public monthSelected(event: Moment): void {
    if (this.startView === 'multi-year') {
      this.dateControl.patchValue(event.toISOString());
      this.dateControl.patchValue(event.toISOString());
      this.datetimePicker.close();
      this.valueChanged();
    }
  }

  private formatValueAndSetErrors(): void {
    if (this.inputElement.nativeElement.value) {
      let formValue = this.inputElement.nativeElement.value;
      formValue = moment(formValue, this.dateTimeEntryFormat).format(this.momentFormat);
      if (formValue !== 'Invalid date') {
        // if not invalid set the value as the formatted value
        this.dateControl.setValue(formValue);
      } else {
        // ensure that the datepicker picks up the invalid error
        const keepErrorText = this.inputElement.nativeElement.value;
        this.dateControl.setValue(keepErrorText);
        this.inputElement.nativeElement.value = keepErrorText;
      }
    } else {
      // ensure required errors are picked up if relevant
      this.dateControl.setValue('');
    }
  }
}
