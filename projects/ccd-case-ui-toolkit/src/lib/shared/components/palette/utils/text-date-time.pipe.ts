import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'ccdTextDateTime',
  standalone: false
})
export class TextDateTimePipe implements PipeTransform {
  private static readonly DATETIME_FORMATS = [
    'DD MMM YYYY HH:mm:ss',       // 02 Dec 2025 12:04:15 (24-hour)
    'D MMM YYYY HH:mm:ss',        // 2 Dec 2025 12:04:15
    'DD MMM YYYY HH:mm',          // 02 Dec 2025 12:04 (without seconds)
    'D MMM YYYY HH:mm',           // 2 Dec 2025 12:04
    'DD MMM YYYY, hh:mm:ss A',    // 12 Dec 2025, 03:00:00 PM (12-hour, padded hour)
    'D MMM YYYY, hh:mm:ss A',     // 2 Dec 2025, 03:00:00 PM
    'DD MMM YYYY, h:mm:ss A',     // 02 Dec 2025, 3:00:00 PM (12-hour, unpadded hour)
    'D MMM YYYY, h:mm:ss A',      // 2 Dec 2025, 3:00:00 PM (DatePipe output format)
    'DD MMM YYYY, hh:mm A',       // 12 Dec 2025, 03:00 PM (without seconds, padded)
    'D MMM YYYY, hh:mm A',        // 2 Dec 2025, 03:00 PM
    'DD MMM YYYY, h:mm A',        // 02 Dec 2025, 3:00 PM (without seconds, unpadded)
    'D MMM YYYY, h:mm A',         // 2 Dec 2025, 3:00 PM
    'DD MMM YYYY hh:mm:ss A',     // 02 Dec 2025 03:00:00 PM (no comma, padded)
    'D MMM YYYY hh:mm:ss A',      // 2 Dec 2025 03:00:00 PM
    'DD MMM YYYY h:mm:ss A',      // 02 Dec 2025 3:00:00 PM (no comma, unpadded)
    'D MMM YYYY h:mm:ss A',       // 2 Dec 2025 3:00:00 PM
    'DD MMM YYYY hh:mm A',        // 02 Dec 2025 03:00 PM (no comma, no seconds, padded)
    'D MMM YYYY hh:mm A',         // 2 Dec 2025 03:00 PM
    'DD MMM YYYY h:mm A',         // 02 Dec 2025 3:00 PM (no comma, no seconds, unpadded)
    'D MMM YYYY h:mm A',          // 2 Dec 2025 3:00 PM
    'YYYY-MM-DDTHH:mm:ss.SSSZ',   // 2025-12-02T12:04:15.123Z (ISO with milliseconds)
    'YYYY-MM-DDTHH:mm:ss.SSS',    // 2025-12-02T12:04:15.123
    'YYYY-MM-DDTHH:mm:ssZ',       // 2025-12-02T12:04:15Z (ISO with Z)
    'YYYY-MM-DDTHH:mm:ss',        // 2025-12-02T12:04:15
    'YYYY-MM-DDTHH:mmZ',          // 2025-12-02T12:04Z (without seconds)
    'YYYY-MM-DDTHH:mm',           // 2025-12-02T12:04
  ];

  transform(value: any): any {
    if (!value) {
      return value;
    }

    if (typeof value !== 'string') {
      return value;
    }

    // quick filter: datetimes must be at least 16 characters (e.g., "2 Dec 2025 00:00")
    // this allows formats with or without seconds, and filters out date-only values
    if (value.length < 16) {
      return value;
    }

    // parse the value as UTC datetime - moment will try listed formats in strict mode
    const parsedAsUtc = moment.utc(value, TextDateTimePipe.DATETIME_FORMATS, true);

    if (parsedAsUtc.isValid()) {
      // get the format that moment used to parse - this preserves the original format
      const creationData = parsedAsUtc.creationData();
      const originalFormat = creationData.format as string;

      // convert from UTC to local timezone and format back in the same format
      const localTime = parsedAsUtc.local();
      return localTime.format(originalFormat);
    }

    return value;
  }
}