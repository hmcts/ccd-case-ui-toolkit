import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CaseViewEvent } from '../../../../domain';

@Component({
  selector: 'ccd-event-log-table',
  templateUrl: './event-log-table.component.html',
  styleUrls: ['./event-log-table.scss']
})
export class EventLogTableComponent implements OnInit {

  @Input()
  events: CaseViewEvent[];

  @Input()
  selected: CaseViewEvent;

  @Output()
  onSelect = new EventEmitter<CaseViewEvent>();

  @Output()
  onCaseHistory = new EventEmitter<string>();

  isPartOfCaseTimeline = false;

  ngOnInit() {
    this.isPartOfCaseTimeline = this.onCaseHistory.observers.length > 0;
  }

  select(event: CaseViewEvent): void {
    this.selected = event;
    this.onSelect.emit(event);
  }

  significantItemExist(event: CaseViewEvent): boolean {
    return (event.significant_item &&
        event.significant_item.type === 'DOCUMENT' &&
        event.significant_item.url !== undefined &&
        event.significant_item.description !== undefined);
  }

  getSignificantItemUrl(event: CaseViewEvent): string {
    if (event.significant_item) {
      return event.significant_item.url;
    }
  }

  getSignificantItemDesc(event: CaseViewEvent): string {
    if (event.significant_item) {
      return event.significant_item.description;
    }
  }

  caseHistoryClicked(eventId: string) {
    this.onCaseHistory.emit(eventId);
  }

  ariaLabelText(event: CaseViewEvent): string {
    if (this.selected !== event) {
      return `press enter key for event ${event.event_name} details`;
    } else {
      return '';
    }
  }
}
