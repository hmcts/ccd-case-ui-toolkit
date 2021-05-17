import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CaseViewEvent } from '../../../../domain';
import { formatDate } from '@angular/common';

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

  public ngOnInit(): void {
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

  public caseHistoryClicked(eventId: string) {
    this.onCaseHistory.emit(eventId);
  }

  public getAriaLabelforColumn(event: CaseViewEvent): string {
    if (this.selected !== event) {
      return `date ${formatDate(event.timestamp, 'dd MMM yyyy hh:mm:ss a', 'en-GB')},
        press enter key for event ${event.event_name} details`;
    } else {
      return '';
    }
  }

  public getAriaLabelforRow(event: CaseViewEvent): string {
    return `you are on event ${event.event_name} row, press tab key to navigate to columns`;
  }

  public getAriaLabelforLink(event: CaseViewEvent): string {
    return `press enter key to open event ${event.event_name} link in separate window`;
  }
}
