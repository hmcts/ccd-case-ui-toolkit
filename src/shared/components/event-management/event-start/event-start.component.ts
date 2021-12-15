import { CdkPortalOutlet, ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { State, StateMachine } from '@edium/fsm';
import { of } from 'rxjs';
import { ComponentPortalExample1Component } from '../component-portal-example1/component-portal-example1.component';
import { ComponentPortalExample2Component } from '../component-portal-example2/component-portal-example2.component';

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
  public componentPortal1: ComponentPortal<ComponentPortalExample1Component>;
  public componentPortal2: ComponentPortal<ComponentPortalExample2Component>;
  public templatePortal: TemplatePortal<any>;
  private stateMachine: StateMachine;
  private s1: State;
  private s2: State;
  private s3: State;

  private firstAction = (state: State, context ) => {
    const componentRef = this.portal.attach<ComponentPortalExample1Component>(new ComponentPortal(ComponentPortalExample1Component));
    componentRef.instance.isNextClick$.subscribe(event => {
      if (event) {
        this.stateMachine.currentState.trigger('next');
      }
    });
  };
  private secondAction = (state: State, context ) => {
    this.portal.detach();
    const componentRef = this.portal.attach<ComponentPortalExample2Component>(new ComponentPortal(ComponentPortalExample2Component));
    componentRef.instance.isNextClick1$.subscribe(event => {
      if (event) {
        this.stateMachine.currentState.trigger('next');
      }
    });
  };
  private lastAction = (state: State, context ) => {
    const navigationExtras = {queryParams: {isComplete: true}};
    this.router.navigate(['/cases/case-details/1546883526751282/trigger/sendDirection/sendDirectionsendDirection'], navigationExtras);
    return true;
  }

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private router: Router
  ) {
  }

  public ngOnInit(): void {
    const context = {
      task$: of([{}]),
      cases$: of([]),
    };
    this.stateMachine = new StateMachine('My first state machine', context);
    this.s1 = this.stateMachine.createState('My first', false, this.firstAction);
    this.s2 = this.stateMachine.createState('My second', false, this.secondAction);
    this.s3 = this.stateMachine.createState('Final State', true, this.lastAction);
    this.s1.addTransition('next', this.s2);
    this.s2.addTransition('next', this.s3);
  }

  public ngAfterViewInit(): void {
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
  }

  public onNextClick() {
    if (!this.stateMachine.started) {
      console.log('state machine started');
      this.stateMachine.start(this.s1);
    }
  }
}
