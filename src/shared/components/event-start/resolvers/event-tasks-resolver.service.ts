import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../../domain/work-allocation/Task';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { WorkAllocationService } from '../../case-editor';
import { map } from 'rxjs/operators';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { SessionStorageService } from '../../../services';

@Injectable()
export class EventTasksResolverService implements Resolve<Task[]> {

  constructor(private readonly service: WorkAllocationService,
              private readonly sessionStorageService: SessionStorageService) {
  }

  public resolve(route: ActivatedRouteSnapshot): Observable<Task[]> {
    const eventId = route.queryParamMap.get('eventId');
    const caseId = route.queryParamMap.get('caseId');
    const caseInfoStr = this.sessionStorageService.getItem('caseInfo');
    const caseInfo = JSON.parse(caseInfoStr);
    if (caseInfo) {
      return this.service.getTasksByCaseIdAndEventId(eventId, caseId, caseInfo.caseType, caseInfo.jurisdiction)
      .pipe(
        map((payload: TaskPayload) => payload.tasks)
      );
    }
  }
}
