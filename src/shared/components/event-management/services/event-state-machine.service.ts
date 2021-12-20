import { Injectable } from '@angular/core';
import { State, StateMachine } from '@edium/fsm';
import { throwError } from 'rxjs';
import { EventStates, StateMachineStates } from '../models';

const EVENT_STATE_MACHINE = 'EVENT STATE MACHINE';

@Injectable()
export class EventStateMachineService {
  public stateCheckForMatchingTasks: State;
  public stateNoTask: State;
  public stateOneTask: State;
  public stateMultipleTask: State;
  public stateTaskAssignedToUser: State;
  public stateTaskUnassigned: State;
  public stateTaskAssignmentRequired: State;
  public stateAssignTaskToSelf: State;
  public stateAskManagerToAssignTask: State;
  public stateShowWarning: State;
  public stateShowErrorMessage: State;
  public stateCancel: State;
  public stateFinal: State;
  public context: any;

  constructor(context: any) {
    this.context = context;
  }

  public initialiseStateMachine(): StateMachine {
    return new StateMachine(EVENT_STATE_MACHINE, this.context);
  }

  public createStates(stateMachine: StateMachine): void {
    // Create states
    this.stateCheckForMatchingTasks = stateMachine.createState(
      EventStates.CHECK_FOR_MATCHING_TASKS,
      false,
      this.initiateEntryState
    );
    this.stateNoTask = stateMachine.createState(
      EventStates.NO_TASK,
      false,
      this.decideAction
    );
    this.stateOneTask = stateMachine.createState(
      EventStates.ONE_TASK,
      false,
      this.entryAction
    );
    this.stateMultipleTask = stateMachine.createState(
      EventStates.MULTIPLE_TASK,
      false,
      this.decideAction
    );
    this.stateTaskAssignedToUser = stateMachine.createState(
      EventStates.TASK_ASSIGNED_TO_USER,
      false,
      this.entryAction
    );
    this.stateTaskUnassigned = stateMachine.createState(
      EventStates.TASK_UNASSIGNED,
      false,
      this.entryAction
    );
    this.stateTaskAssignmentRequired = stateMachine.createState(
      EventStates.TASK_ASSIGNMENT_REQUIRED,
      false,
      this.entryAction
    );
    this.stateAssignTaskToSelf = stateMachine.createState(
      EventStates.ASSIGN_TASK_TO_SELF,
      false,
      this.entryAction
    );
    this.stateAskManagerToAssignTask = stateMachine.createState(
      EventStates.ASK_MANAGER_TO_ASSIGN_TASK,
      false,
      this.entryAction
    );
    this.stateShowWarning = stateMachine.createState(
      EventStates.SHOW_WARNING,
      false,
      this.exitAction
    );
    this.stateShowErrorMessage = stateMachine.createState(
      EventStates.SHOW_ERROR_MESSAGE,
      false,
      this.exitAction
    );
    this.stateCancel = stateMachine.createState(
      EventStates.CANCEL,
      false,
      this.exitAction
    );
    // Create final state, the second param isComplete is set to true
    this.stateFinal = stateMachine.createState(
      StateMachineStates.FINAL,
      true,
      this.finalAction
    );
  }

  public addTransitions(): void {
    this.addTransitionsForStateCheckForMatchingTasks();
    this.addTransitionsForStateNoTask();
    this.addTransitionsForStateOneTask();
    this.addTransitionsForStateMultipleTask();
    this.addTransitionsForStateTaskUnassigned();
    this.addTransitionsForStateTaskAssignmentRequired();
    this.addTransitionsForStateAssignTaskToSelf();
    this.addTransitionsForStateAskManagerToAssignTask();
    this.addTransitionsForStateShowWarning();
    this.addTransitionsForStateShowErrorMessage();
    this.addTransitionsForStateCancel();

    // Define final state transition
    this.addTransitionsForStateFinal();
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckForMatchingTasks);
  }

  /**
   * Initial entry state, decided based on the number of tasks
   */
  public initiateEntryState(state: State): void {
    const taskCount =
      this.context && this.context.tasks ? this.context.tasks.length : 0;
    switch (taskCount) {
      case 0:
        state.trigger(EventStates.NO_TASK);
        break;
      case 1:
        state.trigger(EventStates.ONE_TASK);
        break;
      default:
        state.trigger(EventStates.MULTIPLE_TASK);
        break;
    }
  }

  /**
   * State entry action
   */
  public entryAction(state: State): void {
    // TODO: Actions based on the state id
    switch (state.id) {
      case EventStates.NO_TASK:
        // Example below
        state.trigger(EventStates.SHOW_WARNING);
        break;
      case EventStates.ONE_TASK:
        break;
      case EventStates.MULTIPLE_TASK:
        break;
      case EventStates.TASK_ASSIGNED_TO_USER:
        break;
      case EventStates.TASK_UNASSIGNED:
        break;
      default:
        throwError('Invalid state');
        break;
    }
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
  public decideAction(state: State): void {
    // Find out the relevant event
    const taskCount =
      this.context && this.context.tasks ? this.context.tasks.length : 0;
    switch (taskCount) {
      case 0:
        break;
      case 1:
        break;
      default:
        break;
    }
  }

  public finalAction(state: State): void {
    // TODO: Perform final actions, the state machine finished running
  }

  public addTransitionsForStateCheckForMatchingTasks(): void {
    // TODO: Add required transitions
    this.stateCheckForMatchingTasks.addTransition(
      EventStates.NO_TASK,
      this.stateNoTask
    );
  }

  public addTransitionsForStateNoTask(): void {
    // TODO: Add required transitions
    // this.stateNoTask.addTransition(
    //   EventStates.SHOW_WARNING,
    //   this.stateShowWarning
    // );
  }

  public addTransitionsForStateOneTask(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateMultipleTask(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateTaskAssignedToUser(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateTaskUnassigned(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateTaskAssignmentRequired(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateAssignTaskToSelf(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateAskManagerToAssignTask(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateShowWarning(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateShowErrorMessage(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateCancel(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateFinal(): void {
    // TODO: Add required transitions
  }
}
