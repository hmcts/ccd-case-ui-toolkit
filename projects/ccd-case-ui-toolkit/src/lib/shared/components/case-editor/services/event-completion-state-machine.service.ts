import { Injectable } from '@angular/core';
import { State, StateMachine } from '@edium/fsm';
import { throwError } from 'rxjs';
import { TaskState } from '../../../domain/work-allocation/Task';
import { FieldsUtils } from '../../../services';
import { EventCompletionStateMachineContext } from '../domain/event-completion-state-machine-context.model';
import { EventCompletionStates } from '../domain/event-completion-states.enum.model';
import { EventCompletionTaskStates } from '../domain/event-completion-task-states.model';

const EVENT_COMPLETION_STATE_MACHINE = 'EVENT COMPLETION STATE MACHINE';

@Injectable()
export class EventCompletionStateMachineService {
  public stateCheckTasksCanBeCompleted: State;
  public stateCompleteEventAndTask: State;
  public stateCancelEvent: State;
  public stateCompleteEventNotTask: State;
  public stateTaskCompletedOrCancelled: State;
  public stateTaskAssignedToAnotherUser: State;
  public stateTaskReassignToUser: State;
  public stateTaskAssignToUser: State;
  public stateTaskUnassigned: State;
  public stateFinal: State;

  public initialiseStateMachine(context: EventCompletionStateMachineContext): StateMachine {
    return new StateMachine(EVENT_COMPLETION_STATE_MACHINE, context);
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckTasksCanBeCompleted);
  }

  public createStates(stateMachine: StateMachine): void {
    // Initial state
    this.stateCheckTasksCanBeCompleted = stateMachine.createState(
      EventCompletionStates.CheckTasksCanBeCompleted,
      false,
      this.entryActionForStateCheckTasksCanBeCompleted
    );

    this.stateCompleteEventAndTask = stateMachine.createState(
      EventCompletionStates.CompleteEventAndTask,
      false,
      this.entryActionForStateCompleteEventAndTask
    );

    this.stateTaskCompletedOrCancelled = stateMachine.createState(
      EventCompletionStates.TaskCompetedOrCancelled,
      false,
      this.entryActionForStateTaskCompletedOrCancelled
    );

    this.stateTaskAssignedToAnotherUser = stateMachine.createState(
      EventCompletionStates.TaskAssignedToAnotherUser,
      false,
      this.entryActionForStateTaskAssignedToAnotherUser
    );

    this.stateTaskUnassigned = stateMachine.createState(
      EventCompletionStates.TaskUnassigned,
      false,
      this.entryActionForStateTaskUnassigned
    );

    // Create final state, the second param isComplete is set to true to make sure state machine finished running
    this.stateFinal = stateMachine.createState(
      EventCompletionStates.Final,
      true,
      this.entryActionForStateFinal
    );
  }

  public addTransitions(): void {
    // Initial transition
    this.addTransitionsForStateCheckTasksCanBeCompleted();
    this.addTransitionsForStateTaskCompletedOrCancelled();
    this.addTransitionsForStateCompleteEventAndTask();
    this.addTransitionsForStateTaskAssignedToAnotherUser();
    this.addTransitionsForStateTaskUnassigned();
  }

  public entryActionForStateCheckTasksCanBeCompleted(state: State, context: EventCompletionStateMachineContext): void {
    const assignNeeded = context.sessionStorageService.getItem('assignNeeded');
    context.workAllocationService.getTask(context.task.id).subscribe(
      taskResponse => {
        if (taskResponse?.task?.task_state) {
          switch (taskResponse.task.task_state.toUpperCase()) {
            case TaskState.Unassigned:
              // Task unassigned
              state.trigger(EventCompletionStates.TaskUnassigned);
              break;
            case TaskState.Completed:
            case TaskState.Cancelled:
            case TaskState.Terminated:
              // Task completed or cancelled
              state.trigger(EventCompletionStates.TaskCompetedOrCancelled);
              break;
            case TaskState.Assigned:
              // Task is in assigned state
              if (taskResponse.task.assignee === context.task.assignee) {
                // Task still assigned to current user, complete event and task
                state.trigger(EventCompletionStates.CompleteEventAndTask);
              } else if (assignNeeded === 'true - override') {
                // this will treat task as unassigned instead of reassigned to complete after user confirmation
                // assignNeeded will also be immediately overwritten to true
                state.trigger(EventCompletionStates.TaskUnassigned);
              } else {
                // Task has been reassigned to another user, display error message
                context.reassignedTask = taskResponse.task;
                state.trigger(EventCompletionStates.TaskAssignedToAnotherUser);
              }
              break;
            default:
              // Allow user to complete the event
              state.trigger(EventCompletionStates.CompleteEventAndTask);
              break;
          }
        } else if (!taskResponse?.task) {
          context.alertService.setPreserveAlerts(true);
          context.alertService.warning({ phrase: 'Task statecheck : no task available for completion', replacements: {} });
        } else {
          context.alertService.setPreserveAlerts(true);
          context.alertService.warning({ phrase: 'Task statecheck : no task state available for completion', replacements: {} });
        }
      },
      error => {
        context.alertService.error(error.message);
        return throwError(error);
      });
  }

  public entryActionForStateTaskCompletedOrCancelled(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    // Load case event completion task cancelled component
    context.component.setTaskState(EventCompletionTaskStates.TaskCancelled);
  }

  public entryActionForStateCompleteEventAndTask(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    const clientContextStr = context.sessionStorageService.getItem('clientContext');
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    if (userTask?.task_data) {
      context.sessionStorageService.setItem('assignNeeded', 'false');
      // just set event can be completed
      context.component.eventCanBeCompleted.emit(true);
    } else {
      context.alertService.setPreserveAlerts(true);
      context.alertService.warning({phrase: 'CompleteEventAndTask : no task available for completion', replacements: {}});
      // Emit event cannot be completed event
      context.component.eventCanBeCompleted.emit(false);
    }
  }

  public entryActionForStateTaskAssignedToAnotherUser(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    // Load case event completion task reassigned component
    context.component.setTaskState(EventCompletionTaskStates.TaskReassigned);
  }

  public entryActionForStateTaskUnassigned(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    const clientContextStr = context.sessionStorageService.getItem('clientContext');
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    if (userTask?.task_data) {
      context.sessionStorageService.setItem('assignNeeded', 'true');
      context.component.eventCanBeCompleted.emit(true);
    } else {
      context.alertService.setPreserveAlerts(true);
      context.alertService.warning({phrase: 'Unassigned task : no task available for completion', replacements: {}});
      // Emit event cannot be completed event
      context.component.eventCanBeCompleted.emit(false);
    }
  }

  public entryActionForStateFinal(state: State, context: EventCompletionStateMachineContext): void {
    // Final actions can be performed here, the state machine finished running
    console.log('FINAL');
  }

  public addTransitionsForStateCheckTasksCanBeCompleted(): void {
    // Complete event and task
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.CompleteEventAndTask,
      this.stateCompleteEventAndTask
    );
    // Task completed or cancelled
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.TaskCompetedOrCancelled,
      this.stateTaskCompletedOrCancelled
    );
    // Task assigned to another user
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.TaskAssignedToAnotherUser,
      this.stateTaskAssignedToAnotherUser
    );
    // Task unassigned
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.TaskUnassigned,
      this.stateTaskUnassigned
    );
  }

  public addTransitionsForStateTaskCompletedOrCancelled(): void {
    this.stateTaskCompletedOrCancelled.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public addTransitionsForStateCompleteEventAndTask(): void {
    this.stateCompleteEventAndTask.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public addTransitionsForStateTaskAssignedToAnotherUser(): void {
    this.stateTaskAssignedToAnotherUser.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public addTransitionsForStateTaskUnassigned(): void {
    this.stateTaskUnassigned.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public taskPresentInSessionStorage(context: EventCompletionStateMachineContext): boolean {
    const clientContextStr = context.sessionStorageService.getItem('clientContext');
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    return !!userTask.task_data;
  }
}
