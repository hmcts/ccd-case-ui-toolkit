import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import moment = require('moment');

import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';

@Pipe({
  name: 'ccdDate'
})
export class DatePipe implements PipeTransform {

  private static readonly DATE_FORMAT_REGEXP =
    new RegExp('^(\\d{4})-?(\\d\\d)-?(\\d\\d)(?:T(\\d\\d)(?::?(\\d\\d)(?::?(\\d\\d)(?:\\.(\\d+))?)?)?(Z|([+-])(\\d\\d):?(\\d\\d))?|Z)?$');
           //    1        2       3         4          5          6          7          8  9     10      11
  private static readonly MONTHS = [
    ['Jan'], ['Feb'], ['Mar'], ['Apr'], ['May'], ['Jun'], ['Jul'], ['Aug'], ['Sep'], ['Oct'], ['Nov'], ['Dec'],
  ];

  /**
   * constructor to allow format translator to be injected
   * @param formatTrans
   */
  constructor(private formatTrans: FormatTranslatorService) {
  }

  transform(value: string, zone: string, format: string): string {
    let resultDate = null;
    if (value) {
      const match: RegExpMatchArray = value.match(DatePipe.DATE_FORMAT_REGEXP);
      // Make sure we actually have a match.
      if (match) {
        let offsetDate = null;
        const date = this.getDate(match);
        if (zone === 'local') {
          offsetDate = this.getOffsetDate(date);
        } else {
          offsetDate = this.getDate(match);
        }
        // 'short' format is meaningful to formatDate, but not the same meaning as in the unit tests
        if (this.formatTrans && format && format !== 'short') {
          // support for java style formatting strings for dates
          format = this.translateDateFormat(format);
          const thisMoment = moment(date).format(format);
          resultDate = thisMoment;
        } else {
          // RDM-1149 changed the pipe logic so that it doesn't add an hour to 'Summer Time' dates on DateTime field type
          resultDate = `${offsetDate.getDate()} ${DatePipe.MONTHS[offsetDate.getMonth()]} ${offsetDate.getFullYear()}`;
          if (match[4] && match[5] && match[6] && format !== 'short') {
            resultDate += ', ';
            resultDate += this.getHour(offsetDate.getHours().toString()) + ':';
            resultDate += this.pad(offsetDate.getMinutes()) + ':';
            resultDate += this.pad(offsetDate.getSeconds()) + ' ';
            resultDate += (this.toInt(offsetDate.getHours().toString()) >= 12) ? 'PM' : 'AM';
          }
        }
      } else {
        // EUI-2667. See if what we've been given is actually a formatted date that
        // we could attempt to do something with.
        const parsedDate: number = Date.parse(value);
        // We successfully parsed it so let's use it.
        if (!isNaN(parsedDate)) {
          const d: Date = new Date(parsedDate);
          // If what we received didn't include time, don't include it here either.
          if (value.indexOf(':') < 0) {
            const shortDate: string = d.toLocaleDateString('en-GB');
            const shortISO: string = shortDate.split('/').reverse().join('-');
            return this.transform(shortISO, zone, format);
          }
          // If it did include time, we want a full ISO string.
          const thisMoment = moment(d).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
          return this.transform(thisMoment, zone, format);
        }
      }
    }
    return resultDate;
  }

  private translateDateFormat(format: string) {
    if (this.formatTrans) {
      return this.formatTrans.translate(format);
    } else {
      return format;
    }
  }

  private getOffsetDate(date: Date): Date {
    let localOffset = - date.getTimezoneOffset() / 60;
    return new Date(date.getTime() + localOffset * 3600 * 1000);
  }

  private getDate(match: RegExpMatchArray): Date {
    let year = this.toInt(match[1]);
    let month = this.toInt(match[2]) - 1;
    let day = this.toInt(match[3]);
    let resultDate;
    if (match[4] && match[5] && match[6]) {
      let hour = this.toInt(match[4]);
      let minutes = this.toInt(match[5]);
      let seconds = this.toInt(match[6]);
      resultDate = new Date(year, month, day, hour, minutes, seconds, 0);
    } else {
      resultDate = new Date(year, month, day);
    }
    return resultDate;
  }

  private getHour(hourStr: string): number {
    let hourNum = this.toInt(hourStr);
    if (hourNum > 12) {
      hourNum = hourNum - 12;
    } else if (hourNum === 0) {
      hourNum = 12;
    }
    return hourNum;
  }

  private toInt(str: string): number {
    return parseInt(str, 10);
  }

  private pad(num: any, padNum = 2): string {
    const val = num !== undefined ? num.toString() : '';
    return val.length >= padNum ? val : new Array(padNum - val.length + 1).join('0') + val;
  }
}
