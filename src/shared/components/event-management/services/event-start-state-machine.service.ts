import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { State, StateMachine } from '@edium/fsm';
import { EventStartStates, StateMachineContext, StateMachineStates } from '../models';

const EVENT_START_STATE_MACHINE = 'EVENT START STATE MACHINE';

@Injectable()
export class EventStartStateMachineService {
  public stateCheckForMatchingTasks: State;
  public stateNoTask: State;
  public stateOneTask: State;
  public stateOneOrMoreTasks: State;
  public stateTaskAssignedToUser: State;
  public stateOneTaskAssignedToUser: State;
  public stateMultipleTasksAssignedToUser: State;
  public stateTaskUnassigned: State;
  public stateFinal: State;

  public initialiseStateMachine(context: StateMachineContext): StateMachine {
    return new StateMachine(EVENT_START_STATE_MACHINE, context);
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckForMatchingTasks);
  }

  public createStates(stateMachine: StateMachine): void {
    // Initial state
    this.stateCheckForMatchingTasks = stateMachine.createState(
      EventStartStates.CHECK_FOR_MATCHING_TASKS,
      false,
      this.entryActionForStateCheckForMatchingTasks
    );

    // States based on number of tasks available
    this.stateNoTask = stateMachine.createState(
      EventStartStates.NO_TASK,
      false,
      this.entryActionForStateNoTask
    );
    this.stateOneOrMoreTasks = stateMachine.createState(
      EventStartStates.ONE_OR_MORE_TASKS,
      false,
      this.entryActionForStateOneOrMoreTasks
    );

    // States based on number of tasks assigned to user
    this.stateTaskUnassigned = stateMachine.createState(
      EventStartStates.TASK_UNASSIGNED,
      false,
      this.entryActionForStateTaskUnAssigned
    );
    this.stateTaskAssignedToUser = stateMachine.createState(
      EventStartStates.TASK_ASSIGNED_TO_USER,
      false,
      this.entryActionForStateTaskAssignedToUser
    );
    this.stateOneTaskAssignedToUser = stateMachine.createState(
      EventStartStates.ONE_TASK_ASSIGNED_TO_USER,
      false,
      this.entryActionForStateOneTaskAssignedToUser
    );
    this.stateMultipleTasksAssignedToUser = stateMachine.createState(
      EventStartStates.MULTIPLE_TASKS_ASSIGNED_TO_USER,
      false,
      this.entryActionForStateMultipleTasksAssignedToUser
    );

    // Create final state, the second param isComplete is set to true to make sure state machine finished running
    this.stateFinal = stateMachine.createState(
      StateMachineStates.FINAL,
      true,
      this.finalAction
    );
  }

  public addTransitions(): void {
    // Initial transition
    this.addTransitionsForStateCheckForMatchingTasks();

    // Transitions based on number of tasks available
    this.addTransitionsForStateNoTask();
    this.addTransitionsForStateOneOrMoreTasks();

    // Transitions based on number of tasks assigned to user
    this.addTransitionsForStateTaskUnassigned();
    this.addTransitionsForStateTaskAssignedToUser();
    this.addTransitionsForStateOneTaskAssignedToUser();
    this.addTransitionsForStateMultipleTasksAssignedToUser();
  }

  /**
   * Initial entry action for state check for matching tasks, decided based on the number of tasks
   */
  public entryActionForStateCheckForMatchingTasks(state: State, context: StateMachineContext): void {
    const taskCount = context && context.tasks ? context.tasks.length : 0;

    if (taskCount === 0) {
      // Trigger state no task
      state.trigger(EventStartStates.NO_TASK);
    } else {
      // Trigger state one or more tasks
      state.trigger(EventStartStates.ONE_OR_MORE_TASKS);
    }
  }

  public entryActionForStateNoTask(state: State, context: StateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(StateMachineStates.FINAL);
    // Navigate to no tasks available error page
    context.router.navigate([`/cases/case-details/${context.caseId}/no-tasks-available`], { relativeTo: context.route });
  }

  public entryActionForStateOneOrMoreTasks(state: State, context: StateMachineContext): void {
    state.trigger(EventStartStates.TASK_ASSIGNED_TO_USER);
  }

  public entryActionForStateMultipleTasks(state: State, context: StateMachineContext): void {
    state.trigger(EventStartStates.MULTIPLE_TASKS_ASSIGNED_TO_USER);
  }

  public entryActionForStateTaskAssignedToUser(state: State, context: StateMachineContext): void {
    // Get number of tasks assigned to user
    const userInfoStr = context.sessionStorageService.getItem('userDetails');
    const userInfo = JSON.parse(userInfoStr);
    const tasksAssignedToUser = context.tasks.filter(x => x.assignee === userInfo.id || x.assignee === userInfo.uid);

    switch (tasksAssignedToUser.length) {
      case 0:
        // No tasks assigned to user, trigger state task unassigned
        state.trigger(EventStartStates.TASK_UNASSIGNED);
        break;
      case 1:
        // One task assigned to user
        state.trigger(EventStartStates.ONE_TASK_ASSIGNED_TO_USER);
        break;
      default:
        // Multiple tasks assigned to user, trigger state multiple tasks assigned to user
        state.trigger(EventStartStates.MULTIPLE_TASKS_ASSIGNED_TO_USER);
        break;
    }
  }

  public entryActionForStateTaskUnAssigned(state: State, context: StateMachineContext): void {
    let navigationURL = '';
    let theQueryParams: Params = {};

    if (context.tasks[0].assignee) {
      // Task is assigned to some other user, navigate to task assigned error page
      navigationURL = `/cases/case-details/${context.caseId}/task-assigned`;
      theQueryParams = context.tasks[0];
    } else {
      // Task is unassigned, navigate to task unassigned error page
      navigationURL = `/cases/case-details/${context.caseId}/task-unassigned`;
    }

    // Trigger final state to complete processing of state machine
    state.trigger(StateMachineStates.FINAL);
    // Navigate
    context.router.navigate([`${navigationURL}`], { queryParams: theQueryParams, relativeTo: context.route });
  }

  public entryActionForStateOneTaskAssignedToUser(state: State, context: StateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(StateMachineStates.FINAL);
    // Allow user to perform the event
    context.router.navigate([`/cases/case-details/${context.caseId}/trigger/${context.eventId}`],
      { queryParams: { isComplete: true }, relativeTo: context.route });
  }

  public entryActionForStateMultipleTasksAssignedToUser(state: State, context: StateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(StateMachineStates.FINAL);
    // Navigate to multiple tasks exist error page
    context.router.navigate([`/cases/case-details/${context.caseId}/multiple-tasks-exist`], { relativeTo: context.route });
  }

  public finalAction(state: State): void {
    // Final actions can be performed here, the state machine finished running
  }

  public addTransitionsForStateCheckForMatchingTasks(): void {
    // No tasks
    this.stateCheckForMatchingTasks.addTransition(
      EventStartStates.NO_TASK,
      this.stateNoTask
    );
    // One task
    this.stateCheckForMatchingTasks.addTransition(
      EventStartStates.ONE_OR_MORE_TASKS,
      this.stateOneOrMoreTasks
    );
  }

  public addTransitionsForStateNoTask(): void {
    this.stateNoTask.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
  }

  public addTransitionsForStateOneOrMoreTasks(): void {
    this.stateOneOrMoreTasks.addTransition(
      EventStartStates.TASK_ASSIGNED_TO_USER,
      this.stateTaskAssignedToUser
    );
  }

  public addTransitionsForStateTaskUnassigned(): void {
    this.stateTaskUnassigned.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
  }

  public addTransitionsForStateTaskAssignedToUser(): void {
    this.stateTaskAssignedToUser.addTransition(
      EventStartStates.ONE_TASK_ASSIGNED_TO_USER,
      this.stateOneTaskAssignedToUser
    );
    this.stateTaskAssignedToUser.addTransition(
      EventStartStates.TASK_UNASSIGNED,
      this.stateTaskUnassigned
    );
    this.stateTaskAssignedToUser.addTransition(
      EventStartStates.MULTIPLE_TASKS_ASSIGNED_TO_USER,
      this.stateMultipleTasksAssignedToUser
    );
    this.stateTaskAssignedToUser.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
  }

  public addTransitionsForStateOneTaskAssignedToUser(): void {
    this.stateOneTaskAssignedToUser.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
  }

  public addTransitionsForStateMultipleTasksAssignedToUser(): void {
    this.stateMultipleTasksAssignedToUser.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
  }
}
