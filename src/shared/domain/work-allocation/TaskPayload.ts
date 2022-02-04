import { Task } from './Task';

export interface TaskPayload {
  task_required_for_event: boolean;
  tasks: Task[];
}
