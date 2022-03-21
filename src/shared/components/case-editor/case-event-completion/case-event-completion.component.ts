import { ComponentPortal } from '@angular/cdk/portal';
import { Component, EventEmitter, InjectionToken, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { CaseEventCompletionTaskCancelledComponent, CaseEventCompletionTaskReassignedComponent } from '.';
import { AlertService, SessionStorageService } from '../../../services';
import { EventCompletionComponentEmitter, EventCompletionStateMachineContext } from '../domain';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { EventCompletionPortalTypes } from '../domain/event-completion-portal-types.model';
import { EventCompletionStateMachineService, WorkAllocationService } from '../services';

export const COMPONENT_PORTAL_INJECTION_TOKEN = new InjectionToken<CaseEventCompletionComponent>('');

@Component({
  selector: 'ccd-case-event-completion',
  templateUrl: './case-event-completion.html'
})
export class CaseEventCompletionComponent implements OnChanges, EventCompletionComponentEmitter {

  @Input()
  public eventCompletionParams: EventCompletionParams;

  @Output()
  eventCanBeCompleted: EventEmitter<boolean> = new EventEmitter();

  public stateMachine: StateMachine;
  public context: EventCompletionStateMachineContext;
  public selectedComponentPortal: ComponentPortal<any>;

  constructor(private readonly service: EventCompletionStateMachineService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService,
    private readonly workAllocationService: WorkAllocationService,
    private readonly alertService: AlertService) {
  }

  public ngOnChanges(changes?: SimpleChanges): void {
    if (changes.eventCompletionParams && changes.eventCompletionParams.currentValue) {
      // Setup the context
      this.context = {
        task: this.eventCompletionParams.task,
        caseId: this.eventCompletionParams.caseId,
        eventId: this.eventCompletionParams.eventId,
        reassignedTask: null,
        router: this.router,
        route: this.route,
        sessionStorageService: this.sessionStorageService,
        workAllocationService: this.workAllocationService,
        alertService: this.alertService,
        canBeCompleted: false,
        component: this
      };
      // Initialise state machine
      this.stateMachine = this.service.initialiseStateMachine(this.context);
      // Create states
      this.service.createStates(this.stateMachine);
      // Add transitions for the states
      this.service.addTransitions();
      // Start state machine
      this.service.startStateMachine(this.stateMachine);
    }
  }

  public showPortal(portalType: number): void {
    const injector = Injector.create({
      providers: [
        {provide: COMPONENT_PORTAL_INJECTION_TOKEN, useValue: this}
      ]
    });
    switch (portalType) {
      case EventCompletionPortalTypes.TaskCancelled:
        this.selectedComponentPortal = new ComponentPortal(CaseEventCompletionTaskCancelledComponent, null, injector);
        break;
      case EventCompletionPortalTypes.TaskReassigned:
        this.selectedComponentPortal = new ComponentPortal(CaseEventCompletionTaskReassignedComponent, null, injector);
        break;
    }
  }
}
