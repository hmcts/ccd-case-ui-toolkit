import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { Inject, Optional } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material';

export class DatetimeAdapter extends NgxMatMomentAdapter {

  constructor( @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
    super(dateLocale);
  }

  getFirstDayOfWeek(): number {
    return 1;
  }
}
