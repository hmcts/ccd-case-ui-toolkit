import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'ccd-event-start',
    templateUrl: './event-start.component.html'
  })
export class EventStartComponent implements OnInit {
    @Input() public event: string;
    public constructor() {}
    public ngOnInit(): void { }
  }
