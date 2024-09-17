import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../../domain/work-allocation/Task';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { WorkAllocationService } from '../../case-editor/services/work-allocation.service';
import { AbstractAppConfig } from '../../../../app.config';

@Injectable()
export class EventTasksResolverService implements Resolve<Task[]> {

  constructor(private readonly service: WorkAllocationService,
              private readonly sessionStorageService: SessionStorageService,
              private readonly abstractConfig: AbstractAppConfig) {
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
    } else {
      this.abstractConfig.logMessage(`EventTasksResolverService: caseInfo details not available in session storage for ${caseId}`);
    }
  }
}
