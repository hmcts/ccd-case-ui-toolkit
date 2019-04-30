import { Component, Input } from '@angular/core';
import { CaseViewEvent } from '../../../../domain';

@Component({
  selector: 'ccd-event-log-details',
  templateUrl: './event-log-details.component.html',
  styleUrls: ['./event-log-details.scss']
})
export class EventLogDetailsComponent {
  @Input()
  event: CaseViewEvent;
}
