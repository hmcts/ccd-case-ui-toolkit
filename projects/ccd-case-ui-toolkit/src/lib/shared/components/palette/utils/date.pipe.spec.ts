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
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(9)}:09:05 AM`);
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss noon format', () => {
    const message = datePipe.transform('2017-07-26T12:09:05', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(12)}:09:05 PM`);
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss PM format', () => {
    const firstPass: string = datePipe.transform('2017-07-26T20:10:05', 'local', null);
    expect(firstPass).toBe(`26 Jul 2017, ${getExpectedHour(8)}:10:05 PM`);

    const secondPass: string = datePipe.transform(firstPass, 'local', null);
    expect(secondPass).toEqual(firstPass); // Unchanged.
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss midnight format', () => {
    const message = datePipe.transform('2017-07-26T00:10:05', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(12)}:10:05 AM`);
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss+hh:mm AM format', () => {
    const message = datePipe.transform('2017-07-26T09:09:05+00:00', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(9)}:09:05 AM`);
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ss+hh:mm PM format', () => {
    const message = datePipe.transform('2017-07-26T20:10:05+00:00', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(8)}:10:05 PM`);
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ssZ AM format', () => {
    const message = datePipe.transform('2017-07-26T09:09:05Z', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(9)}:09:05 AM`);
  });

  it('should render correct date if UTC date in yyyy-mm-ddThh:mm:ssZ format', () => {
    const message = datePipe.transform('2017-07-26T20:10:05Z', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(8)}:10:05 PM`);
  });

  it('should render correct date if short format specified for UTC date with time', () => {
    const message = datePipe.transform('2017-07-26T20:10:05Z', 'utc', 'short');
    expect(message).toBe('26 Jul 2017');
  });

  it('should render correct date for local zone with time', () => {
    const message = datePipe.transform('2017-07-26T20:10:05Z', 'local', null);
    expect(message).toBe(`26 Jul 2017, ${getExpectedHour(8)}:10:05 PM`);
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

  describe('British Summer Time (BST) Transitions - EXUI-3066', () => {
    // BST starts: Last Sunday in March at 1:00 AM GMT → 2:00 AM BST (UTC+1)
    // BST ends: Last Sunday in October at 2:00 AM BST → 1:00 AM GMT (UTC+0)

    describe('Spring Forward - Clocks go forward (GMT to BST)', () => {
      it('should correctly display UTC time just before spring forward transition', () => {
        // March 26, 2023 at 00:30 UTC (30 mins before clocks spring forward)
        const UTC_BEFORE_SPRING = '2023-03-26T00:30:00.000';
        const result = datePipe.transform(UTC_BEFORE_SPRING, 'local', null);

        // In local time (GMT), this would still be 00:30 AM on March 26
        expect(result).toContain('26 Mar 2023');
        expect(result).toContain('12:30:00 AM');
      });

      it('should correctly display UTC time just after spring forward transition', () => {
        // March 26, 2023 at 01:30 UTC (30 mins after clocks spring forward)
        // At 1:00 AM GMT, clocks jumped to 2:00 AM BST
        const UTC_AFTER_SPRING = '2023-03-26T01:30:00.000';
        const result = datePipe.transform(UTC_AFTER_SPRING, 'local', null);

        // In local time (BST = UTC+1), 01:30 UTC should be 02:30 BST
        expect(result).toContain('26 Mar 2023');
        expect(result).toContain('2:30:00 AM');
      });

      it('should handle UTC time during the missing hour (1:00-2:00 AM GMT)', () => {
        // March 26, 2023 at 01:15 UTC (during the non-existent hour in local time)
        const UTC_MISSING_HOUR = '2023-03-26T01:15:00.000';
        const result = datePipe.transform(UTC_MISSING_HOUR, 'local', null);

        // This time doesn't exist in local time, but moment converts it to BST
        // 01:15 UTC = 02:15 BST
        expect(result).toContain('26 Mar 2023');
        expect(result).toContain('2:15:00 AM');
      });

      it('should handle date-only value during spring forward day', () => {
        // Date without time during spring forward should not shift
        const SPRING_FORWARD_DATE = '2023-03-26';
        const result = datePipe.transform(SPRING_FORWARD_DATE, null, null);

        expect(result).toBe('26 Mar 2023');
      });

      it('should correctly handle noon UTC on spring forward day', () => {
        // March 26, 2023 at 12:00 UTC (well after transition)
        const UTC_NOON = '2023-03-26T12:00:00.000';
        const result = datePipe.transform(UTC_NOON, 'local', null);

        // 12:00 UTC = 13:00 BST (1:00 PM)
        expect(result).toContain('26 Mar 2023');
        expect(result).toContain('1:00:00 PM');
      });
    });

    describe('Fall Back - Clocks go back (BST to GMT)', () => {
      it('should correctly display UTC time just before fall back transition', () => {
        // October 29, 2023 at 00:30 UTC (30 mins before clocks fall back)
        const UTC_BEFORE_FALL = '2023-10-29T00:30:00.000';
        const result = datePipe.transform(UTC_BEFORE_FALL, 'local', null);

        // Still in BST, so 00:30 UTC = 01:30 BST
        expect(result).toContain('29 Oct 2023');
        expect(result).toContain('1:30:00 AM');
      });

      it('should correctly display UTC time just after fall back transition', () => {
        // October 29, 2023 at 01:30 UTC (after clocks fell back)
        // At 2:00 AM BST, clocks went back to 1:00 AM GMT
        const UTC_AFTER_FALL = '2023-10-29T01:30:00.000';
        const result = datePipe.transform(UTC_AFTER_FALL, 'local', null);

        // Now in GMT, so 01:30 UTC = 01:30 GMT
        expect(result).toContain('29 Oct 2023');
        expect(result).toContain('1:30:00 AM');
      });

      it('should handle UTC time during the repeated hour (1:00-2:00 AM)', () => {
        // October 29, 2023 at 01:15 UTC (during the hour that occurs twice)
        const UTC_REPEATED_HOUR = '2023-10-29T01:15:00.000';
        const result = datePipe.transform(UTC_REPEATED_HOUR, 'local', null);

        // Moment will interpret this as GMT (after the transition)
        expect(result).toContain('29 Oct 2023');
        expect(result).toContain('1:15:00 AM');
      });

      it('should handle date-only value during fall back day', () => {
        // Date without time during fall back should not shift
        const FALL_BACK_DATE = '2023-10-29';
        const result = datePipe.transform(FALL_BACK_DATE, null, null);

        expect(result).toBe('29 Oct 2023');
      });

      it('should correctly handle noon UTC on fall back day', () => {
        // October 29, 2023 at 12:00 UTC (well after transition)
        const UTC_NOON = '2023-10-29T12:00:00.000';
        const result = datePipe.transform(UTC_NOON, 'local', null);

        // 12:00 UTC = 12:00 GMT (after fall back)
        expect(result).toContain('29 Oct 2023');
        expect(result).toContain('12:00:00 PM');
      });
    });

    describe('Regular BST and GMT periods', () => {
      it('should correctly display UTC time during summer (BST period)', () => {
        // July 15, 2023 at 14:30 UTC (middle of summer, BST in effect)
        const UTC_SUMMER = '2023-07-15T14:30:00.000';
        const result = datePipe.transform(UTC_SUMMER, 'local', null);

        // 14:30 UTC = 15:30 BST (3:30 PM)
        expect(result).toContain('15 Jul 2023');
        expect(result).toContain('3:30:00 PM');
      });

      it('should correctly display UTC time during winter (GMT period)', () => {
        // January 15, 2023 at 14:30 UTC (middle of winter, GMT in effect)
        const UTC_WINTER = '2023-01-15T14:30:00.000';
        const result = datePipe.transform(UTC_WINTER, 'local', null);

        // 14:30 UTC = 14:30 GMT (2:30 PM)
        expect(result).toContain('15 Jan 2023');
        expect(result).toContain('2:30:00 PM');
      });

      it('should correctly display UTC midnight during BST', () => {
        // August 1, 2023 at 00:00 UTC (midnight during BST)
        const UTC_MIDNIGHT_BST = '2023-08-01T00:00:00.000';
        const result = datePipe.transform(UTC_MIDNIGHT_BST, 'local', null);

        // 00:00 UTC = 01:00 BST (1:00 AM)
        expect(result).toContain('1 Aug 2023');
        expect(result).toContain('1:00:00 AM');
      });

      it('should correctly display UTC midnight during GMT', () => {
        // December 1, 2023 at 00:00 UTC (midnight during GMT)
        const UTC_MIDNIGHT_GMT = '2023-12-01T00:00:00.000';
        const result = datePipe.transform(UTC_MIDNIGHT_GMT, 'local', null);

        // 00:00 UTC = 00:00 GMT (midnight)
        expect(result).toContain('1 Dec 2023');
        expect(result).toContain('12:00:00 AM');
      });

      it('should correctly display UTC 23:00 during BST (crosses day boundary)', () => {
        // July 15, 2023 at 23:30 UTC (late evening during BST)
        const UTC_LATE_BST = '2023-07-15T23:30:00.000';
        const result = datePipe.transform(UTC_LATE_BST, 'local', null);

        // 23:30 UTC = 00:30 next day BST (crosses midnight)
        expect(result).toContain('16 Jul 2023');
        expect(result).toContain('12:30:00 AM');
      });
    });

    describe('Edge cases with timezone offset notation', () => {
      it('should handle UTC datetime with Z suffix during BST period', () => {
        const UTC_WITH_Z = '2023-06-15T10:30:00.000Z';
        const result = datePipe.transform(UTC_WITH_Z, 'local', null);

        // 10:30 UTC = 11:30 BST
        expect(result).toContain('15 Jun 2023');
        expect(result).toContain('11:30:00 AM');
      });

      it('should handle UTC datetime with +00:00 offset during GMT period', () => {
        const UTC_WITH_OFFSET = '2023-01-15T10:30:00.000+00:00';
        const result = datePipe.transform(UTC_WITH_OFFSET, 'local', null);

        // 10:30 UTC = 10:30 GMT
        expect(result).toContain('15 Jan 2023');
        expect(result).toContain('10:30:00 AM');
      });
    });

    describe('UTC mode (should not convert to local time)', () => {
      it('should keep UTC time as-is when zone is utc during BST period', () => {
        const UTC_TIME = '2023-07-15T14:30:00.000';
        const result = datePipe.transform(UTC_TIME, 'utc', null);

        // Should remain 14:30, not converted to BST
        expect(result).toContain('15 Jul 2023');
        expect(result).toContain('2:30:00 PM');
      });

      it('should keep UTC time as-is when zone is utc during GMT period', () => {
        const UTC_TIME = '2023-01-15T14:30:00.000';
        const result = datePipe.transform(UTC_TIME, 'utc', null);

        // Should remain 14:30
        expect(result).toContain('15 Jan 2023');
        expect(result).toContain('2:30:00 PM');
      });
    });
  });

  describe('Edge case tests - EXUI-3066', () => {
    it('should correctly handle timezone offset notation (+01:00)', () => {
      const DATE_WITH_OFFSET = '2023-07-15T14:30:00.000+01:00';
      const result = datePipe.transform(DATE_WITH_OFFSET, 'local', null);

      // 14:30 in +01:00 timezone = 13:30 UTC = 14:30 BST (in UK summer)
      expect(result).toContain('15 Jul 2023');
      expect(result).toContain('2:30:00 PM');
    });

    it('should correctly handle negative timezone offsets (-05:00)', () => {
      const DATE_WITH_NEG_OFFSET = '2023-01-15T10:00:00.000-05:00';
      const result = datePipe.transform(DATE_WITH_NEG_OFFSET, 'local', null);

      // 10:00 in -05:00 (EST) = 15:00 UTC = 15:00 GMT (in UK winter)
      expect(result).toContain('15 Jan 2023');
      expect(result).toContain('3:00:00 PM');
    });

    it('should handle datetime values crossing day boundary when converting to local', () => {
      const LATE_UTC = '2023-08-15T23:30:00.000';
      const result = datePipe.transform(LATE_UTC, 'local', null);

      // 23:30 UTC in summer = 00:30 next day BST
      expect(result).toContain('16 Aug 2023');
      expect(result).toContain('12:30:00 AM');
    });

    it('should handle early morning UTC times during winter', () => {
      const EARLY_UTC_WINTER = '2023-01-15T00:30:00.000';
      const result = datePipe.transform(EARLY_UTC_WINTER, 'local', null);

      // 00:30 UTC in winter = 00:30 GMT (no change)
      expect(result).toContain('15 Jan 2023');
      expect(result).toContain('12:30:00 AM');
    });

    it('should handle early morning UTC times during summer (stays on same day)', () => {
      const EARLY_UTC_SUMMER = '2023-07-15T00:30:00.000';
      const result = datePipe.transform(EARLY_UTC_SUMMER, 'local', null);

      // 00:30 UTC in summer = 01:30 BST (same day)
      expect(result).toContain('15 Jul 2023');
      expect(result).toContain('1:30:00 AM');
    });

    it('should correctly handle DST transition with explicit UTC offset', () => {
      const DST_TRANSITION_WITH_OFFSET = '2023-03-26T01:00:00.000+00:00';
      const result = datePipe.transform(DST_TRANSITION_WITH_OFFSET, 'local', null);

      // 01:00 UTC with +00:00 = 02:00 BST (after transition)
      expect(result).toContain('26 Mar 2023');
      expect(result).toContain('2:00:00 AM');
    });

    it('should handle timezone-aware string when converting to UTC mode', () => {
      const WITH_OFFSET = '2023-06-15T14:30:00.000+02:00';
      const result = datePipe.transform(WITH_OFFSET, 'utc', null);

      // 14:30 in +02:00 = 12:30 UTC
      expect(result).toContain('15 Jun 2023');
      expect(result).toContain('12:30:00 PM');
    });

    it('should handle datetime at exact DST transition moment', () => {
      const EXACT_TRANSITION = '2023-03-26T01:00:00.000';
      const result = datePipe.transform(EXACT_TRANSITION, 'local', null);

      // At 1:00 AM GMT, clocks jump to 2:00 AM BST
      expect(result).toContain('26 Mar 2023');
      expect(result).toContain('2:00:00 AM');
    });
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
