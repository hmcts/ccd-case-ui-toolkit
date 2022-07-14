import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CaseEventTrigger } from '../../../domain';

@Injectable()
export class EventTriggerService {

  public eventTriggerSource = new Subject<CaseEventTrigger>();

  public announceEventTrigger(eventTrigger: CaseEventTrigger) {
    this.eventTriggerSource.next(eventTrigger);
  }

}
