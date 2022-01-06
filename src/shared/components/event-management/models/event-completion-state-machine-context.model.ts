import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';
import { WorkAllocationService } from '../../case-editor';

export interface EventCompletionStateMachineContext {
  tasks: Task[];
  caseId: string;
  eventId: string;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService;
  workAllocationService: WorkAllocationService;
}
