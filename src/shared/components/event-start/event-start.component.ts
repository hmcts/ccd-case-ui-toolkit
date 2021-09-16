import { AfterViewInit, Component, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html',
  styleUrls: ['./event-start.component.scss']
})
export class EventStartComponent implements AfterViewInit {
  @Input() public event: string;
  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<any>;
  public selectedPortal: Portal<any>;
  public componentPortal1: ComponentPortal<ComponentPortalExample1Component>;
  public componentPortal2: ComponentPortal<ComponentPortalExample2Component>;
  public templatePortal: TemplatePortal<any>;
  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit() {
    this.componentPortal1 = new ComponentPortal(ComponentPortalExample1Component);
    this.componentPortal2 = new ComponentPortal(ComponentPortalExample2Component);
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
  }
}

@Component({
  selector: 'component-portal-example1',
  template: 'Hello, this is a component portal 1'
})
export class ComponentPortalExample1Component {}

@Component({
  selector: 'component-portal-example2',
  template: 'Hello, this is a component portal 2'
})
export class ComponentPortalExample2Component {}
