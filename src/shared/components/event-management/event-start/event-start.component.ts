import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { Task } from '../../../domain/work-allocation/Task';
import { EventStateMachineService } from '../services/event-state-machine.service';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html'
})
export class EventStartComponent implements OnInit {

  public tasks: Task[];
  public stateMachine: StateMachine;
  public context: any;

  constructor(private service: EventStateMachineService,
    private route: ActivatedRoute) {
  }

  public ngOnInit(): void {
    // Get task payload from route data
    this.tasks = this.route.snapshot.data.tasks;
    console.log(this.tasks);

    // Setup the context
    this.context = {
      tasks: this.tasks
    };

    // Initialise state machine
    this.service = new EventStateMachineService(this.context);
    this.stateMachine = this.service.initialiseStateMachine();
    // Create states
    this.service.createStates(this.stateMachine);
    // Add transitions for the states
    this.service.addTransitions();
    // Start state machine
    this.service.startStateMachine(this.stateMachine);
  }
}
