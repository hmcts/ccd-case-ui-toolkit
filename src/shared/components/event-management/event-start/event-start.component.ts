import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';
import { StateMachineContext } from '../models';
import { EventStateMachineService } from '../services';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html'
})
export class EventStartComponent implements OnInit {

  public stateMachine: StateMachine;
  public context: StateMachineContext;

  constructor(private service: EventStateMachineService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService) {
  }

  public ngOnInit(): void {
    // Get task and case id payload from route data
    const tasks: Task[] = this.route.snapshot.data.tasks;
    const caseId = this.route.snapshot.data.case.case_id;

    // Setup the context
    this.context = {
      tasks: tasks,
      caseId: caseId,
      router: this.router,
      route: this.route,
      sessionStorageService: this.sessionStorageService
    };

    // Initialise state machine
    this.service = new EventStateMachineService();
    this.stateMachine = this.service.initialiseStateMachine(this.context);
    // Create states
    this.service.createStates(this.stateMachine);
    // Add transitions for the states
    this.service.addTransitions();
    // Start state machine
    this.service.startStateMachine(this.stateMachine);
  }
}
