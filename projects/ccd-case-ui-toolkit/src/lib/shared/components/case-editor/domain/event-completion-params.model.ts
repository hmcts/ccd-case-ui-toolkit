import { Task } from '../../../domain/work-allocation/Task';

export interface EventCompletionParams {
  caseId: string;
  eventId: string;
  task: Task;
}
