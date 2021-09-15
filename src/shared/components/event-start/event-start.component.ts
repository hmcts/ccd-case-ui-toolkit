import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';

@Component({
    selector: 'ccd-event-start',
    templateUrl: './event-start.component.html'
  })
export class EventStartComponent implements OnInit {
    @Input() public event: string;
    public constructor() {}
    public ngOnInit(): void { }
  }
