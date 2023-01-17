import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { DatePipe } from './date.pipe';

describe('DatePipe', () => {

  let datePipe: DatePipe;
  const EXPECTED_OFFSET = - new Date(2017, 6, 26).getTimezoneOffset() / 60;

  beforeEach(() => {
    datePipe = new DatePipe(new FormatTranslatorService());
  });

  it('should render correct date if UTC date in yyyy-mm-dd format', () => {
    const message = datePipe.transform('2017-07-26', null, null);
    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date if UTC date in yyyy-mm-ddZ format', () => {
    const message = datePipe.transform('2017-07-26Z', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date if UTC date in yyyy-mm-dd format and format is short', () => {
    const message = datePipe.transform('2017-07-26', null, 'short');

    expect(message).toBe('26 Jul 2017');
  });

  it('should render yyyy-mm-dd only if UTC date in incomplete yyyy-mm-ddThh:mm:ss format with hh only', () => {
    const message = datePipe.transform('2017-07-26T12', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render yyyy-mm-dd only if UTC date in incomplete yyyy-mm-ddThh:mm:ss format with hh and mm only', () => {
    const message = datePipe.transform('2017-07-26T12:23', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss AM format', () => {
    const message = datePipe.transform('2017-07-26T09:09:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(9) + ':09:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss noon format', () => {
    const message = datePipe.transform('2017-07-26T12:09:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(12) + ':09:05 PM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss PM format', () => {
    const firstPass: string = datePipe.transform('2017-07-26T20:10:05', 'local', null);
    expect(firstPass).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
    const secondPass: string = datePipe.transform(firstPass, 'local', null);
    expect(secondPass).toEqual(firstPass); // Unchanged.
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss midnight format', () => {
    const message = datePipe.transform('2017-07-26T00:10:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(12) + ':10:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss+hh:mm AM format', () => {
    const message = datePipe.transform('2017-07-26T09:09:05+00:00', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(9) + ':09:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss+hh:mm PM format', () => {
    const message = datePipe.transform('2017-07-26T20:10:05+00:00', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ssZ AM format', () => {
    const message = datePipe.transform('2017-07-26T09:09:05Z', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(9) + ':09:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ssZ format', () => {
    const message = datePipe.transform('2017-07-26T20:10:05Z', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if short format specified for UTC date with time', () => {
    const message = datePipe.transform('2017-07-26T20:10:05Z', 'utc', 'short');

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date for local zone with time', () => {
    const message = datePipe.transform('2017-07-26T20:10:05Z', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if short format specified for UTC date without time', () => {
    const message = datePipe.transform('2017-07-26Z', null, 'short');

    expect(message).toBe('26 Jul 2017');
  });

  it ('should format dates according to format', () => {
    const message = datePipe.transform('2017-07-26', null, 'DD MMM YY');
    expect(message).toBe('26 Jul 17');
  });
  it ('should format times according to format 12h', () => {
    const message = datePipe.transform('2017-07-26', null, 'hh:mm:ss.SSS');
    expect(message).toBe('12:00:00.000');
  });
  it ('should format times according to format 24h', () => {
    const message = datePipe.transform('2017-07-26', null, 'HH:mm:ss.SSS');
    expect(message).toBe('00:00:00.000');
  });

  it ('should format date times according to format', () => {
    const message = datePipe.transform('2017-07-26T19:09:05', null, 'DD MMMM yyyy HH:mm:ss.SSS');
    expect(message).toBe('26 July 2017 19:09:05.000');
  });

  // Start of tests for EUI-2667.
  it ('should handle null dates', () => {
    const message = datePipe.transform(null, null, null);
    expect(message).toBeNull();
  });
  it ('should handle non-ISO BST dates', () => {
    const message = datePipe.transform('Apr 10 2019', null, null);
    expect(message).toEqual('10 Apr 2019');
  });
  it ('should handle non-ISO GMT dates', () => {
    const message = datePipe.transform('Jan 10 2019', null, null);
    expect(message).toEqual('10 Jan 2019');
  });
  it ('should handle already formatted BST date', () => {
    const ORIGINAL = '2019-04-10';
    const firstPass = datePipe.transform(ORIGINAL, null, null);
    expect(firstPass).toEqual('10 Apr 2019');
    const secondPass = datePipe.transform(firstPass, null, null);
    expect(secondPass).toEqual(firstPass); // Unchanged.
  });
  it ('should handle already formatted GMT date', () => {
    const ORIGINAL = '2019-01-10';
    const firstPass = datePipe.transform(ORIGINAL, null, null);
    expect(firstPass).toEqual('10 Jan 2019');
    const secondPass = datePipe.transform(firstPass, null, null);
    expect(secondPass).toEqual(firstPass); // Unchanged.
  });
  it ('should handle invalid dates', () => {
    const message = datePipe.transform('Bob', null, null);
    expect(message).toBeNull();
  });
  // End of tests for EUI-2667.

  // test removed regarding time zone change at end of winter (change from 00:59 -> 02:00 removed as no longer relevant)
  /* Because of the use of moment library and therefore the fixed utc timezone of the datetime picker,
     the read date component also needed to have a fixed utc timezone in order for the user to not get
     reasonably confused during the movement within pages. This means that any time given to either component
     will be used as the time and there will no longer be unnecessary movements between the time zones
     (i.e. giving one of the components a time that changes from what the user wants). This also fits in
     better with all use cases of the datepipe as there were occasions when timezones were changing twice
     (two hours behind or in front) when moving through the various steps.
  */

  function getExpectedHour(hour): number {
    let expectedHour = hour + EXPECTED_OFFSET;
    if (expectedHour > 12) {
      expectedHour = expectedHour - 12;
    } else if (expectedHour === 0) {
      expectedHour = 12;
    }
    return expectedHour;
  }
});
