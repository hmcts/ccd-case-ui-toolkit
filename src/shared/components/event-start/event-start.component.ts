import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkPortalOutlet, Portal, TemplatePortal } from '@angular/cdk/portal';
import { StateMachine } from '@edium/fsm';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html',
  styleUrls: ['./event-start.component.scss']
})
export class EventStartComponent implements OnInit, AfterViewInit {
  @Input() public event: string;
  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<any>;
  @ViewChild('portal') portal: CdkPortalOutlet;
  public selectedPortal: Portal<any>;
  public templatePortal: TemplatePortal<any>;
  private stateMachine: StateMachine;
  constructor(private _viewContainerRef: ViewContainerRef,
              private router: Router) {}

  public ngOnInit() {
  }

  ngAfterViewInit() {
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
  }
}
