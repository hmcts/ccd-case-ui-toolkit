import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CaseEventTrigger } from '../../../domain';

@Injectable({
  providedIn: 'root',
})
export class EventTriggerService {

  public eventTriggerSource = new Subject<CaseEventTrigger>();

  public announceEventTrigger(eventTrigger: CaseEventTrigger) {
    this.eventTriggerSource.next(eventTrigger);
  }

}
