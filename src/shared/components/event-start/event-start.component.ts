import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { State, StateMachine } from '@edium/fsm';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html',
  styleUrls: ['./event-start.component.scss']
})
export class EventStartComponent implements OnInit, AfterViewInit {
  @Input() public event: string;
  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<any>;
  public selectedPortal: Portal<any>;
  public componentPortal1: ComponentPortal<ComponentPortalExample1Component>;
  public componentPortal2: ComponentPortal<ComponentPortalExample2Component>;
  public templatePortal: TemplatePortal<any>;
  public stateMachine: StateMachine;
  public s1: State;
  public s2: State;
  public s3: State;
  public firstAction = (state: State, context ) => {
    context.task$.subscribe(task => {
      if(task && task.length > 0) {
        this.componentPortal1 = new ComponentPortal(ComponentPortalExample1Component);
        this.selectedPortal = this.componentPortal1;
      }
    })
  };
  public secondAction = (state: State, context ) => {
    context.cases$.subscribe(cases => {
      if(!cases || cases.length === 0) {
        this.componentPortal2 = new ComponentPortal(ComponentPortalExample2Component);
        this.selectedPortal = this.componentPortal2;
      }
    })
  };
  public lastAction = (state: State, context ) => {
    this.router.navigate(['/cases/case-details/1546883526751282']);
  }
  public exitAction = ( state: State, context: any) => {
    return true;
  };
  constructor(private _viewContainerRef: ViewContainerRef, private router: Router) {}

  public ngOnInit() {
    const context = {
      task$: of([{}]),
      cases$: of([]),
    };
    this.stateMachine = new StateMachine('My first state machine', context);
    this.s1 = this.stateMachine.createState( "My first", false, this.firstAction);
    this.s2 = this.stateMachine.createState( "My second", false, this.secondAction);
    this.s3 = this.stateMachine.createState("Final State", true, this.lastAction);
    this.s1.addTransition("next", this.s2);
    this.s2.addTransition("next", this.s3);

  }

  ngAfterViewInit() {
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
  }

  public onNextClick() {
    if(!this.stateMachine.started) {
      this.stateMachine.start(this.s1);
    } else {
      this.stateMachine.currentState.trigger('next');
    }
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
