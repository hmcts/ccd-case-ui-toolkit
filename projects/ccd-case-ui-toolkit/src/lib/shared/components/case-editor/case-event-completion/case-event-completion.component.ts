import { ComponentPortal } from '@angular/cdk/portal';
import { Component, EventEmitter, InjectionToken, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { AlertService } from '../../../services/alert/alert.service';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { EventCompletionPortalTypes } from '../domain/event-completion-portal-types.model';
import { EventCompletionComponentEmitter, EventCompletionStateMachineContext } from '../domain/event-completion-state-machine-context.model';
import { EventCompletionStateMachineService } from '../services/event-completion-state-machine.service';
import { WorkAllocationService } from '../services/work-allocation.service';
import { CaseEventCompletionTaskCancelledComponent } from './components/case-event-completion-task-cancelled/case-event-completion-task-cancelled.component';
import { CaseEventCompletionTaskReassignedComponent } from './components/case-event-completion-task-reassigned/case-event-completion-task-reassigned.component';

export const COMPONENT_PORTAL_INJECTION_TOKEN = new InjectionToken<CaseEventCompletionComponent>('');

@Component({
  selector: 'ccd-case-event-completion',
  templateUrl: './case-event-completion.html'
})
export class CaseEventCompletionComponent implements OnChanges, EventCompletionComponentEmitter {
  @Input()
  public eventCompletionParams: EventCompletionParams;

  @Output()
  public eventCanBeCompleted: EventEmitter<boolean> = new EventEmitter();

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
    // tslint:disable-next-line:switch-default
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
