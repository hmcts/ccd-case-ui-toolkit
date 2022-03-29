export enum EventCompletionStates {
  CheckTasksCanBeCompleted = 'check-tasks-can-be-completed',
  CompleteEventAndTask = 'complete-event-and-task',
  CancelEvent = 'cancel-event',
  CompleteEventNotTask = 'complete-event-not-task',
  TaskCompletedOrCancelled = 'task-completed-or-cancelled',
  TaskAssignedToAnotherUser = 'task-assigned-to-another-user',
  TaskReassignToUser = 'task-reassign-to-user',
  TaskAssignToUser = 'task-assign-to-user',
  TaskUnassigned = 'task-unassigned',
  Final = 'final'
}
