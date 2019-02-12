import { EventStatusService } from './event-status.service';

describe('EventStatusService', () => {

  it('should identify null eventStatus as NOT INCOMPLETE', () => {
    expect(EventStatusService.isIncomplete(null))
      .toBeFalsy();
  });

  it('should identify undefined eventStatus as NOT INCOMPLETE', () => {
    expect(EventStatusService.isIncomplete({} as string))
      .toBeFalsy();
  });

  it('should identify unknown eventStatus value as NOT INCOMPLETE', () => {
    expect(EventStatusService.isIncomplete(''))
      .toBeFalsy();
  });

  it('should identify incomplete eventStatus as INCOMPLETE_CALLBACK', () => {
    expect(EventStatusService.isIncomplete('INCOMPLETE_CALLBACK'))
      .toBeTruthy();
  });

  it('should identify incomplete eventStatus as INCOMPLETE_DELETE_DRAFT', () => {
    expect(EventStatusService.isIncomplete('INCOMPLETE_DELETE_DRAFT'))
      .toBeTruthy();
  });

  it('should identify another eventStatus field as NOT INCOMPLETE', () => {
    expect(EventStatusService.isIncomplete('Something else'))
      .toBeFalsy();
  });
});
