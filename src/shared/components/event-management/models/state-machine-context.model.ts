import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';

export interface StateMachineContext {
  tasks: Task[];
  caseId: string;
  router: Router;
  route: ActivatedRoute;
}
