import { NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { Component, Input, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker, ThemePalette } from '@angular/material';

@Component({
    selector: 'exui-datetime-picker-wrapper',
    templateUrl: './datetime-picker-wrapper.component.html',
    styleUrls: ['./datetime-picker-wrapper.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class DatetimePickerWrapperComponent {

  @ViewChild('picker') datetimePicker: NgxMatDatetimePicker<any>;

  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = true;
  public minDate: Date;
  public maxDate: Date;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public disableMinute = false;
  public hideTime = false;

  @Input() public dateControl: FormControl = new FormControl(new Date());

}
