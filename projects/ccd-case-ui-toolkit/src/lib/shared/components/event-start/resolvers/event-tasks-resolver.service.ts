import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../../domain/work-allocation/Task';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { WorkAllocationService } from '../../case-editor/services/work-allocation.service';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseNotifier } from '../../case-editor';

@Injectable()
export class EventTasksResolverService implements Resolve<Task[]> {
  jurisdiction: any;
  caseType: any;

  constructor(private readonly service: WorkAllocationService,
              private readonly abstractConfig: AbstractAppConfig,
              private readonly caseNotifier: CaseNotifier) {
    this.caseNotifier.caseView.subscribe((caseDetails) => {
      if (caseDetails) {
        this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
        this.caseType = caseDetails?.case_type?.id;
      }
    });
  }

  public resolve(route: ActivatedRouteSnapshot): Observable<Task[]> {
    const eventId = route.queryParamMap.get('eventId');
    const caseId = route.queryParamMap.get('caseId');
    console.log(this.caseType, this.jurisdiction)
    if (this.caseType && this.jurisdiction) {
      return this.service.getTasksByCaseIdAndEventId(eventId, caseId, this.caseType, this.jurisdiction)
        .pipe(
          map((payload: TaskPayload) => payload.tasks)
        );
    }
    this.abstractConfig.logMessage(`EventTasksResolverService: caseInfo details not available in session storage for ${caseId}`);
  }
}
