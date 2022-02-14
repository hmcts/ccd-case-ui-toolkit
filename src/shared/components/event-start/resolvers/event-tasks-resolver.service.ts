import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../../domain/work-allocation/Task';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { WorkAllocationService } from '../../case-editor';
import { map } from 'rxjs/operators';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';

@Injectable()
export class EventTasksResolverService implements Resolve<Task[]> {

  constructor(private service: WorkAllocationService) {
  }

  public resolve(route: ActivatedRouteSnapshot): Observable<Task[]> {
    const eventId = route.queryParamMap.get('eventId');
    const caseId = route.queryParamMap.get('caseId');
    return this.service.getTasksByCaseIdAndEventId(eventId, caseId)
      .pipe(
        map((payload: TaskPayload) => payload.tasks)
      );
  }
}
