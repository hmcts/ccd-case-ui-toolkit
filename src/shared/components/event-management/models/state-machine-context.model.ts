import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';

export interface StateMachineContext {
  tasks: Task[];
  caseId: string;
  eventId: string;
  taskId: string;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService
}
