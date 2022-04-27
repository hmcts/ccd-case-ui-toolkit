import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CaseEventTrigger } from '../../../domain';

@Injectable()
export class EventTriggerService {

  eventTriggerSource = new Subject<CaseEventTrigger>();

  announceEventTrigger(eventTrigger: CaseEventTrigger) {
    this.eventTriggerSource.next(eventTrigger);
  }

}
