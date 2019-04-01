import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CaseViewEvent } from '../../../../domain';

@Component({
  selector: 'ccd-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.scss']
})
export class EventLogComponent implements OnInit {

  @Input()
  events: CaseViewEvent[];

  @Output()
  onCaseHistory = new EventEmitter<String>();

  selected: CaseViewEvent;

  isPartOfCaseTimeline = false;

  ngOnInit(): void {
    this.selected = this.events[0];
    this.isPartOfCaseTimeline = this.onCaseHistory.observers.length > 0;
  }

  select(event: CaseViewEvent): void {
    this.selected = event;
  }

  caseHistoryClicked(eventId: string) {
    this.onCaseHistory.emit(eventId);
  }

}
