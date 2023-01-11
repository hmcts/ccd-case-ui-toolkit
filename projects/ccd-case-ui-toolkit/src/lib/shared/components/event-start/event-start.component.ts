import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { Task } from '../../domain/work-allocation/Task';
import { SessionStorageService } from '../../services/session/session-storage.service';
import { EventStartStateMachineContext } from './models/event-start-state-machine-context.model';
import { EventStartStateMachineService } from './services/event-start-state-machine.service';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html'
})
export class EventStartComponent implements OnInit {

  public stateMachine: StateMachine;
  public context: EventStartStateMachineContext;

  constructor(private service: EventStartStateMachineService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService) {
  }

  public ngOnInit(): void {
    // Get task and case id payload from route data
    const tasks: Task[] = this.route.snapshot.data.tasks;
    const caseId = this.route.snapshot.data.case.case_id;
    const eventId = this.route.snapshot.queryParams['eventId'];
    const taskId = this.route.snapshot.queryParams['taskId'];

    // Setup the context
    this.context = {
      tasks,
      caseId,
      eventId,
      taskId,
      router: this.router,
      route: this.route,
      sessionStorageService: this.sessionStorageService
    };

    // Initialise state machine
    this.service = new EventStartStateMachineService();
    this.stateMachine = this.service.initialiseStateMachine(this.context);
    // Create states
    this.service.createStates(this.stateMachine);
    // Add transitions for the states
    this.service.addTransitions();
    // Start state machine
    this.service.startStateMachine(this.stateMachine);
  }
}
