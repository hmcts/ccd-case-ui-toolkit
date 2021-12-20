export enum EventStates {
  CHECK_FOR_MATCHING_TASKS = 'check-for-matching-tasks',
  NO_TASK = 'no-task',
  ONE_TASK = 'one-task',
  MULTIPLE_TASKS = 'multiple-tasks',
  TASK_ASSIGNED_TO_USER = 'task-assigned-to-user',
  TASK_UNASSIGNED = 'task-unassigned',
  TASK_ASSIGNMENT_REQUIRED = 'task-assignment-required',
  ASSIGN_TASK_TO_SELF = 'assign-task-to-self',
  ASK_MANAGER_TO_ASSIGN_TASK = 'ask-manager-to-assign-task',
  SHOW_WARNING = 'show-warning',
  SHOW_ERROR_MESSAGE = 'show-error-message',
  CANCEL = 'cancel'
}
