import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CaseViewEvent } from '../../../domain';

@Component({
  selector: 'ccd-event-log-table',
  templateUrl: './event-log-table.html',
  styleUrls: ['./event-log-table.scss']
})
export class EventLogTableComponent {

  @Input()
  events: CaseViewEvent[];

  @Input()
  selected: CaseViewEvent;

  @Output()
  onSelect = new EventEmitter<CaseViewEvent>();

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
}
