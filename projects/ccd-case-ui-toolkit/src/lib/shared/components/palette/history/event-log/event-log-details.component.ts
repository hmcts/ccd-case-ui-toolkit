import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CaseViewEvent } from '../../../../domain';

@Component({
  selector: 'ccd-event-log-details',
  templateUrl: './event-log-details.component.html',
  styleUrls: ['./event-log-details.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class EventLogDetailsComponent {
  @Input()
  public event: CaseViewEvent;
}
