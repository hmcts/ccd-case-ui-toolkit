import { Component, Input, OnInit } from '@angular/core';
import { CaseViewEvent } from '../../../domain';

@Component({
  selector: 'ccd-event-log',
  templateUrl: './event-log.html',
  styleUrls: ['./event-log.scss']
})
export class EventLogComponent implements OnInit {

  @Input()
  events: CaseViewEvent[];

  selected: CaseViewEvent;

  ngOnInit(): void {
    this.selected = this.events[0];
  }

  select(event: CaseViewEvent): void {
    this.selected = event;
  }

}
