import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';
import { WorkAllocationService } from '../../case-editor/services/work-allocation.service';

export interface EventCompletionStateMachineContext {
  task: Task;
  caseId: string;
  eventId: string;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService;
  workAllocationService: WorkAllocationService;
}
