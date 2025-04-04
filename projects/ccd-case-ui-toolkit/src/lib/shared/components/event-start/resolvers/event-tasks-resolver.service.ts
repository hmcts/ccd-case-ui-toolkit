import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../../domain/work-allocation/Task';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { WorkAllocationService } from '../../case-editor/services/work-allocation.service';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseNotifier } from '../../case-editor';

@Injectable()
export class EventTasksResolverService implements Resolve<Task[]> {
  private caseId: string;
  private caseType: string;
  private jurisdiction: string;

  constructor(private readonly service: WorkAllocationService,
              private readonly sessionStorageService: SessionStorageService,
              private readonly caseNotifier: CaseNotifier,
              private readonly abstractConfig: AbstractAppConfig) {
    caseNotifier.caseView.subscribe((caseView) => {
      this.caseId = caseView.case_id;
      this.caseType = caseView.case_type.id;
      this.jurisdiction = caseView.case_type.jurisdiction.id;
    });
  }

  public resolve(route: ActivatedRouteSnapshot): Observable<Task[]> {
    const eventId = route.queryParamMap.get('eventId');
    const caseId = route.queryParamMap.get('caseId');
    if (this.caseId && caseId === this.caseId) {
      return this.service.getTasksByCaseIdAndEventId(eventId, this.caseId, this.caseType, this.jurisdiction)
      .pipe(
        map((payload: TaskPayload) => payload.tasks)
      );
    } else {
      this.abstractConfig.logMessage(`EventTasksResolverService: caseInfo details not available or don't match current case for ${caseId}`);
    }
  }
}
