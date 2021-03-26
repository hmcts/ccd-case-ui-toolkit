import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatTranslationService {
  HAS_DATE_FORMAT_REGEX = /[^0-9]{2}\/[^0-9]{2}\/[^0-9]{4}$/;
  HAS_MONTH_FORMAT_REGEX = /[^0-9]{2}\/[^0-9]{2}/;
  HAS_DAY_FORMAT_REGEX = /[^0-9]{2}/;
  HAS_TIME_FORMAT_REGEX = /[^0-9]{2}\/[^0-9]{2}\/[^0-9]{4} [^0-9]{2}:[^0-9]{2}/;
  HAS_HOURS_FORMAT_REGEX = /[^0-9]{2}\/[^0-9]{2}\/[^0-9]{4} [^0-9]{2}/;
  HAS_MINUTES_FORMAT_REGEX = /[^0-9]{2}\/[^0-9]{2}\/[^0-9]{4} [^0-9]{2}:[^0-9]{2}/;
  HAS_SECONDS_FORMAT_REGEX = /[^0-9]{2}\/[^0-9]{2}\/[^0-9]{4} [^0-9]{2}:[^0-9]{2}:[^0-9]{2}/;

  constructor() {
  }

  hasDate(value: string): boolean {
    return this.HAS_DATE_FORMAT_REGEX.test(value)
  }

  hasTime(value: string): boolean {
    return this.HAS_TIME_FORMAT_REGEX.test(value)
  }

  hasMonth(value: string): boolean {
    return this.HAS_MONTH_FORMAT_REGEX.test(value)
  }

  hasDay(value: string): boolean {
    return this.HAS_DAY_FORMAT_REGEX.test(value)
  }

  hasHours(value: string): boolean {
    return this.HAS_HOURS_FORMAT_REGEX.test(value)
  }

  hasMinutes(value: string): boolean {
    return this.HAS_MINUTES_FORMAT_REGEX.test(value)
  }

  hasSeconds(value: string): boolean {
    return this.HAS_SECONDS_FORMAT_REGEX.test(value)
  }
}
