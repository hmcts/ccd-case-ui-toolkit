import { DatePipe } from './date.pipe';

describe('DatePipe', () => {

  let datePipe: DatePipe;
  const EXPECTED_OFFSET = - new Date().getTimezoneOffset() / 60;

  beforeEach(() => {
    datePipe = new DatePipe();
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
