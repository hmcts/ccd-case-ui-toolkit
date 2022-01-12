import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { EventCompletionStateMachineService, WorkAllocationService } from '../services';
import { SessionStorageService } from '../../../services';
import { EventCompletionComponentEmitter, EventCompletionStateMachineContext } from '../domain';
import { EventCompletionParams } from '../domain/event-completion-params.model';

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

  constructor(private service: EventCompletionStateMachineService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService,
    private readonly workAllocationService: WorkAllocationService) {
  }

  public ngOnChanges(changes?: SimpleChanges): void {
    if (changes.eventCompletionParams && changes.eventCompletionParams.currentValue) {
      console.log('ONE');
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
      console.log('TWO');
      // Initialise state machine
      this.service = new EventCompletionStateMachineService();
      this.stateMachine = this.service.initialiseStateMachine(this.context);
      // Create states
      this.service.createStates(this.stateMachine);
      // Add transitions for the states
      this.service.addTransitions();
      // Start state machine
      this.service.startStateMachine(this.stateMachine);
    }
  }
}
