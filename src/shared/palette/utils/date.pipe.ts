import { Pipe, PipeTransform } from '@angular/core';

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

  transform(value: string, zone: string, format: string): string {
    let resultDate = null;
    let offsetDate = null;

    if (value) {
      let match: RegExpMatchArray = value.match(DatePipe.DATE_FORMAT_REGEXP);
      if (zone === 'local') {
        let date = this.getDate(match);
        offsetDate = this.getOffsetDate(date);
      } else {
        offsetDate = this.getDate(match);
      }
      // RDM-1149 changed the pipe logic so that it doesn't add an hour to 'Summer Time' dates on DateTime field type

      resultDate = `${offsetDate.getDate()} ${DatePipe.MONTHS[offsetDate.getMonth()]} ${offsetDate.getFullYear()}`;
      if (match[4] && match[5] && match[6] && format !== 'short') {
        resultDate += ', ';
        resultDate += this.getHour(offsetDate.getHours().toString()) + ':';
        resultDate += this.pad(offsetDate.getMinutes()) + ':';
        resultDate += this.pad(offsetDate.getSeconds()) + ' ';
        resultDate += (this.toInt(offsetDate.getHours().toString()) >= 12) ? 'PM' : 'AM' ;
      }
    }
    return resultDate;
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
