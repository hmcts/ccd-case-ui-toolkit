export enum EventStartStates {
  CHECK_FOR_MATCHING_TASKS = 'check-for-matching-tasks',
  NO_TASK = 'no-task',
  ONE_OR_MORE_TASKS = 'one-or-more-tasks',
  TASK_ASSIGNED_TO_USER = 'task-assigned-to-user',
  ONE_TASK_ASSIGNED_TO_USER = 'one-task-assigned-to-user',
  MULTIPLE_TASKS_ASSIGNED_TO_USER = 'multiple-tasks-assigned-to-user',
  TASK_UNASSIGNED = 'task-unassigned',
  TASK_ASSIGNMENT_REQUIRED = 'task-assignment-required'
}
