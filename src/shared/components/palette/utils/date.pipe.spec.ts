import { DatePipe } from './date.pipe';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';

describe('DatePipe', () => {

  let datePipe: DatePipe;
  const EXPECTED_OFFSET = - new Date(2017, 6, 26).getTimezoneOffset() / 60;

  beforeEach(() => {
    datePipe = new DatePipe(new FormatTranslatorService());
  });

  it('should render correct date if UTC date in yyyy-mm-dd format', () => {
    let message = datePipe.transform('2017-07-26', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date if UTC date in yyyy-mm-ddZ format', () => {
    let message = datePipe.transform('2017-07-26Z', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date if UTC date in yyyy-mm-dd format and format is short', () => {
    let message = datePipe.transform('2017-07-26', null, 'short');

    expect(message).toBe('26 Jul 2017');
  });

  it('should render yyyy-mm-dd only if UTC date in incomplete yyyy-mm-ddThh:mm:ss format with hh only', () => {
    let message = datePipe.transform('2017-07-26T12', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render yyyy-mm-dd only if UTC date in incomplete yyyy-mm-ddThh:mm:ss format with hh and mm only', () => {
    let message = datePipe.transform('2017-07-26T12:23', null, null);

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss AM format', () => {
    let message = datePipe.transform('2017-07-26T09:09:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(9) + ':09:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss noon format', () => {
    let message = datePipe.transform('2017-07-26T12:09:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(12) + ':09:05 PM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss PM format', () => {
    let message = datePipe.transform('2017-07-26T20:10:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss midnight format', () => {
    let message = datePipe.transform('2017-07-26T00:10:05', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(12) + ':10:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss+hh:mm AM format', () => {
    let message = datePipe.transform('2017-07-26T09:09:05+00:00', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(9) + ':09:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss+hh:mm PM format', () => {
    let message = datePipe.transform('2017-07-26T20:10:05+00:00', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ssZ AM format', () => {
    let message = datePipe.transform('2017-07-26T09:09:05Z', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(9) + ':09:05 AM');
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ssZ format', () => {
    let message = datePipe.transform('2017-07-26T20:10:05Z', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if short format specified for UTC date with time', () => {
    let message = datePipe.transform('2017-07-26T20:10:05Z', 'utc', 'short');

    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date for local zone with time', () => {
    let message = datePipe.transform('2017-07-26T20:10:05Z', 'local', null);

    expect(message).toBe('26 Jul 2017, ' + getExpectedHour(8) + ':10:05 PM');
  });

  it('should render correct date if short format specified for UTC date without time', () => {
    let message = datePipe.transform('2017-07-26Z', null, 'short');

    expect(message).toBe('26 Jul 2017');
  });

  it ('should format dates according to format', () => {
    let message = datePipe.transform('2017-07-26', null, 'DD MMM YY')
    expect(message).toBe('26 Jul 17')
  })
  it ('should format times according to format 12h', () => {
    let message = datePipe.transform('2017-07-26', null, 'hh:mm:ss.SSS')
    expect(message).toBe('12:00:00.000')
  })
  it ('should format times according to format 24h', () => {
    let message = datePipe.transform('2017-07-26', null, 'HH:mm:ss.SSS')
    expect(message).toBe('00:00:00.000')
  })

  it ('should format date times according to format', () => {
    let message = datePipe.transform('2017-07-26T19:09:05', null, 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('26 July 2017 19:09:05.000')
  })

  /**
   * GMT to BST (from 00:59:59 GMT going forward to 02:00:00 BST) on the last Sunday in March
   */
  it ('should handle GMT to BST transition', () => {
    let endOfWinter = new Date(2020, 2, 29, 0, 59, 59)
    let message = datePipe.transform (endOfWinter.toISOString(), 'GMT', 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('29 March 2020 00:59:59.000')
    // tick on 1 second
    endOfWinter.setTime(endOfWinter.getTime() + 1000);
    message = datePipe.transform (endOfWinter.toISOString(), '+0100', 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('29 March 2020 02:00:00.000')
  })
  /*
   * BST to GMT (from 01:59:59 BST going back to 01:00:00 GMT) on the last Sunday in October
   */
  it ('should handle BST to GMT transition', () => {
    let endOfSummer = new Date(2020, 9, 25, 1, 59, 59)
    let message = datePipe.transform (endOfSummer.toISOString(), '+0100', 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('25 October 2020 00:59:59.000')
    // tick on 1 second
    endOfSummer.setTime(endOfSummer.getTime() + 1000);
    message = datePipe.transform (endOfSummer.toISOString(), '+0100', 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('25 October 2020 01:00:00.000')
    message = datePipe.transform (endOfSummer.toISOString(), 'GMT', 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('25 October 2020 00:00:00.000')
    // move an hour forward
    endOfSummer.setTime(endOfSummer.getTime() + (1000 * 60 * 60));
    message = datePipe.transform (endOfSummer.toISOString(), 'GMT', 'dd MMMM yyyy HH:mm:ss.SSS')
    expect(message).toBe('25 October 2020 02:00:00.000')
  })
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
