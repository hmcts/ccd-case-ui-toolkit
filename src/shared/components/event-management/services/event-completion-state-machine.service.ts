import { Injectable } from '@angular/core';
import { State, StateMachine } from '@edium/fsm';
import { EventCompletionStates, StateMachineContext, StateMachineStates } from '../models';

const EVENT_COMPLETION_STATE_MACHINE = 'EVENT COMPLETION STATE MACHINE';

@Injectable()
export class EventCompletionStateMachineService {
  public stateCheckTasksCanBeCompleted: State;
  public stateCompleteEventAndTask: State;
  public stateCancelEvent: State;
  public stateCompleteEventNotTask: State;
  public stateTaskAssignedToUser: State;
  public stateTaskReassignToUser: State;
  public stateTaskAssignToUser: State;
  public stateTaskUnassigned: State;
  public stateFinal: State;

  public initialiseStateMachine(context: StateMachineContext): StateMachine {
    return new StateMachine(EVENT_COMPLETION_STATE_MACHINE, context);
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckTasksCanBeCompleted);
  }

  public createStates(stateMachine: StateMachine): void {
    // Initial state
    this.stateCheckTasksCanBeCompleted = stateMachine.createState(
      EventCompletionStates.CHECK_TASKS_CAN_BE_COMPLETED,
      false,
      this.entryActionForStateCheckTasksCanBeCompleted
    )

    // Create final state, the second param isComplete is set to true to make sure state machine finished running
    this.stateFinal = stateMachine.createState(
      StateMachineStates.FINAL,
      true,
      this.finalAction
    );
  }

  public addTransitions(): void {
    // Initial transition
    this.addTransitionsForStateCheckTasksCanBeCompleted();
  }

  public entryActionForStateCheckTasksCanBeCompleted(state: State, context: StateMachineContext): void {

  }

  public finalAction(state: State): void {
    // Final actions can be performed here, the state machine finished running
  }

  public addTransitionsForStateCheckTasksCanBeCompleted(): void {

  }
}
