import { Injectable } from '@angular/core';

@Injectable()
export class EventStatusService {
  public static readonly CALLBACK_STATUS_INCOMPLETE = 'INCOMPLETE_CALLBACK';
  public static readonly DELETE_DRAFT_STATUS_INCOMPLETE = 'INCOMPLETE_DELETE_DRAFT';
  public static readonly CALLBACK_STATUS_COMPLETE = 'CALLBACK_COMPLETED';
  public static readonly DELETE_DRAFT_STATUS_COMPLETE = 'DELETE_DRAFT_COMPLETED';

  public static isIncomplete (eventStatus: string) {
    if (!eventStatus) {
      return false;
    }
    return EventStatusService.CALLBACK_STATUS_INCOMPLETE === eventStatus
      || EventStatusService.DELETE_DRAFT_STATUS_INCOMPLETE === eventStatus;
  }
}
