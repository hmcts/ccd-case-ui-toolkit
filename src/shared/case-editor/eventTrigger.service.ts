import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CaseEventTrigger } from '../domain';
import { ConnectableObservable, of, AsyncSubject } from 'rxjs';

@Injectable()
export class EventTriggerService {

  eventTriggerSource = Subject.create();

  announceEventTrigger(eventTrigger: CaseEventTrigger) {
    this.eventTriggerSource.next(eventTrigger);
  }

}
