export enum EventCompletionStates {
  CHECK_TASKS_CAN_BE_COMPLETED = 'check-tasks-can-be-completed',
  COMPLETE_EVENT_AND_TASK = 'complete-event-and-task',
  CANCEL_EVENT = 'cancel-event',
  COMPLETE_EVENT_NOT_TASK = 'complete-event-not-task',
  TASK_COMPLETED_OR_CANCELLED = 'task-completed-or-cancelled',
  TASK_ASSIGNED_TO_ANOTHER_USER = 'task-assigned-to-another-user',
  TASK_REASSIGN_TO_USER = 'task-reassign-to-user',
  TASK_ASSIGN_TO_USER = 'task-assign-to-user',
  TASK_UNASSIGNED = 'task-unassigned',
	FINAL = 'final'
}
