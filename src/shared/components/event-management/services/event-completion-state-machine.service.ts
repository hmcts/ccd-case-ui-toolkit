import { Injectable } from '@angular/core';
import { State, StateMachine } from '@edium/fsm';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { EventCompletionStates, EventCompletionStateMachineContext, StateMachineStates } from '../models';

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

  public initialiseStateMachine(context: EventCompletionStateMachineContext): StateMachine {
    return new StateMachine(EVENT_COMPLETION_STATE_MACHINE, context);
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckTasksCanBeCompleted);
    console.log('DONE');
  }

  public createStates(stateMachine: StateMachine): void {
    // Initial state
    this.stateCheckTasksCanBeCompleted = stateMachine.createState(
      EventCompletionStates.CHECK_TASKS_CAN_BE_COMPLETED,
      false,
      this.entryActionForStateCheckTasksCanBeCompleted
    )

    this.stateCompleteEventAndTask = stateMachine.createState(
      EventCompletionStates.COMPLETE_EVENT_AND_TASK,
      false,
      this.entryActionForStateCompleteEventAndTask
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

  public entryActionForStateCheckTasksCanBeCompleted(state: State, context: EventCompletionStateMachineContext): void {
    context.workAllocationService.getTasksByCaseIdAndEventId(context.eventId, context.caseId).subscribe(payload => {
      const taskPayLoad = <TaskPayload>payload;
      if (taskPayLoad.task_required_for_event) {
        const task = taskPayLoad.tasks.filter(x => x.id === context.tasks[0].id && x.assignee === context.tasks[0].assignee);
        if (task.length > 0) {
          state.trigger(EventCompletionStates.COMPLETE_EVENT_AND_TASK);
        } else {
          // state.trigger();
        }
      }
    });
  }

  public entryActionForStateCompleteEventAndTask(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(StateMachineStates.FINAL);
    // Return
  }

  public finalAction(state: State): void {
    // Final actions can be performed here, the state machine finished running
    console.log('FINAL');
  }

  public addTransitionsForStateCheckTasksCanBeCompleted(): void {
    // Complete event and task
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.COMPLETE_EVENT_AND_TASK,
      this.stateCompleteEventAndTask
    );
    //
  }

  public addTransitionsForStateCompleteEventAndTask(): void {
    this.stateCompleteEventAndTask.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
  }
}
