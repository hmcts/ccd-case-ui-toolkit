import { ComponentPortal } from '@angular/cdk/portal';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { TaskCancelledComponent } from '../..';
import { SessionStorageService } from '../../../services';
import { EventCompletionComponentEmitter, EventCompletionStateMachineContext } from '../domain';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { EventCompletionPortalTypes } from '../domain/event-completion-portal-types.model';
import { EventCompletionStateMachineService, WorkAllocationService } from '../services';

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
  public componentPortal: ComponentPortal<any>;
  public taskCancelledComponentPortal: ComponentPortal<TaskCancelledComponent>;

  constructor(private readonly service: EventCompletionStateMachineService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService,
    private readonly workAllocationService: WorkAllocationService) {
  }

  public ngOnChanges(changes?: SimpleChanges): void {
    if (changes.eventCompletionParams && changes.eventCompletionParams.currentValue) {
      // Setup the context
      this.context = {
        task: this.eventCompletionParams.task,
        caseId: this.eventCompletionParams.caseId,
        eventId: this.eventCompletionParams.eventId,
        router: this.router,
        route: this.route,
        sessionStorageService: this.sessionStorageService,
        workAllocationService: this.workAllocationService,
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
    switch(portalType)  {
      case EventCompletionPortalTypes.TaskCancelledComponent:
        this.componentPortal = new ComponentPortal(TaskCancelledComponent);
        break;
    }
  }
}
