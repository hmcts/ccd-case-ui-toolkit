import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';
import { ReadCookieService, SessionStorageService } from '../../../services';
import { CaseView } from '../../../domain/case-view/case-view.model';

export interface EventStartStateMachineContext {
  tasks: Task[];
  caseId: string;
  eventId: string;
  taskId: string;
  caseDetails?: CaseView;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService;
  cookieService: ReadCookieService;
}
