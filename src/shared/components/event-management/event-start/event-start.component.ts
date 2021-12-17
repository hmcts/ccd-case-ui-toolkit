import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { State, StateMachine } from '@edium/fsm';
import { of, throwError } from 'rxjs';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { EventStates, StateMachineStates } from '../models';

const EVENT_STATE_MACHINE = 'EVENT STATE MACHINE';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html'
})
export class EventStartComponent implements OnInit {

  @Input() taskPayload: TaskPayload;
  private stateMachine: StateMachine;
  private stateNoTask: State;
  private stateOneTask: State;
  private stateMultipleTask: State;
  private stateFinal: State;
  private context: any;


  constructor(private router: Router) {
  }

  public ngOnInit(): void {
    // Setup the context
    this.context = {
      tasks$: of([{}])
    };
    // Initiate state machine
    this.initialiseStateMachine();
  }

  /**
   * Initialise state machine
   *
   */
  public initialiseStateMachine(): void {
    // Initiate state machine
    this.stateMachine = new StateMachine(EVENT_STATE_MACHINE, this.context);

    // Create states
    this.stateNoTask = this.stateMachine.createState(EventStates.NO_TASK, false, this.entryAction, this.exitAction);
    this.stateOneTask = this.stateMachine.createState(EventStates.ONE_TASK, false, this.entryAction, this.exitAction);
    this.stateMultipleTask = this.stateMachine.createState(EventStates.MULTIPLE_TASK, false, this.entryAction, this.exitAction);
    // Create final state, the second param isComplete is set to true
    this.stateFinal = this.stateMachine.createState(StateMachineStates.FINAL, true, this.finalAction);

    // Define state transitions
    this.addTransitions(this.stateNoTask);
    this.addTransitions(this.stateOneTask);
    this.addTransitions(this.stateMultipleTask);
    // Define final state transition
    this.addTransitions(this.stateFinal);
  }

  /**
   * Add transitions
   */
  private addTransitions(state: State): void {
    // TODO: Implement the state transitions based on the requirement
    switch(state.id) {
      case EventStates.NO_TASK:
        // Example below
        this.stateNoTask.addTransition('next', this.stateOneTask);
        break;
      case EventStates.ONE_TASK:
        break;
      case EventStates.MULTIPLE_TASK:
        break;
      default:
        throwError('Invalid state');
      break;
    }
  }

  /**
   * State entry action
   */
  private entryAction(state: State): void {
    state.trigger('next');
  }

  /**
   * State exit action
   */
  private exitAction(state: State): boolean {
    // TODO: Return true or false based on the scenario
    return true;
  }

  /**
   * State decide action
   */
  private decideAction(state: State): void {
    // Find out the relevant event
    switch(this.taskPayload.tasks.length) {
      case 0:

        break;
      case 1:

        break;
      default:

        break;
    }
  }

  private finalAction(state: State): void {
    // TODO: Perform final actions, the state machine finished running
  }
}
