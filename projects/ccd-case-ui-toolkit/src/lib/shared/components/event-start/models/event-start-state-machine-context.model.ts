import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';
import { ReadCookieService, SessionStorageService } from '../../../services';

export interface EventStartStateMachineContext {
  tasks: Task[];
  caseId: string;
  eventId: string;
  taskId: string;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService;
  cookieService: ReadCookieService;
}
