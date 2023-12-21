import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseViewEvent } from '../../../../domain';

@Component({
  selector: 'ccd-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.scss']
})
export class EventLogComponent implements OnInit {

  @Input()
  public events: CaseViewEvent[];

  @Output()
  public onCaseHistory = new EventEmitter<string>();

  public selected: CaseViewEvent;

  public isPartOfCaseTimeline = false;

  public ngOnInit(): void {
    this.selected = this.events[0];
    this.isPartOfCaseTimeline = this.onCaseHistory.observers.length > 0;
  }

  public select(event: CaseViewEvent): void {
    this.selected = event;
  }

  public caseHistoryClicked(eventId: string) {
    this.onCaseHistory.emit(eventId);
  }

}
