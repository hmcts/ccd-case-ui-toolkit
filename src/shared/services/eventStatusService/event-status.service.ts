import { Injectable } from '@angular/core';

@Injectable()
export class EventStatusService {
  static readonly CALLBACK_STATUS_INCOMPLETE = 'INCOMPLETE_CALLBACK';
  static readonly DELETE_DRAFT_STATUS_INCOMPLETE = 'INCOMPLETE_DELETE_DRAFT';
  static readonly CALLBACK_STATUS_COMPLETE = 'CALLBACK_COMPLETED';
  static readonly DELETE_DRAFT_STATUS_COMPLETE = 'DELETE_DRAFT_COMPLETED';

  public static isIncomplete (eventStatus: string) {
    if (!eventStatus) {
      return false;
    }
    return EventStatusService.CALLBACK_STATUS_INCOMPLETE === eventStatus
      || EventStatusService.DELETE_DRAFT_STATUS_INCOMPLETE === eventStatus;
  }
}
