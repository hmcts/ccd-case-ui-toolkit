import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../case-editor';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services';

@Injectable()
export class EventStartGuard implements CanActivate {

  constructor(private readonly workAllocationService: WorkAllocationService,
    private readonly router: Router,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService) {
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    // Checks must be performed only for Work Allocation 2
    if (this.appConfig.getWorkAllocationApiUrl().toLowerCase() === 'workallocation2') {
      const caseId = route.params['cid'];
      const eventId = route.params['eid'];
      const taskId = route.queryParams['tid'];

      // TODO: NavigationExtras should be used once Angular upgrade changes have been incorporated
      const isComplete = route.queryParams['isComplete'];
      const caseInfoStr = this.sessionStorageService.getItem('caseInfo');
      if (caseInfoStr) {
        const caseInfo = JSON.parse(caseInfoStr);
        if (caseInfo && caseInfo.cid === caseId) {
          if (isComplete) {
            return of(true);
          }
          return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId, caseInfo.caseType, caseInfo.jurisdiction).pipe(
            switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId, eventId, taskId))
          );
        }
      }
    } else {
      // Checks not required, return true by default for Work Allocation 1
      return of(true);
    }
  }

  private checkForTasks(payload: TaskPayload, caseId: string, eventId: string, taskId: string): Observable<boolean> {
    if (payload.task_required_for_event) {
      this.router.navigate([`/cases/case-details/${caseId}/event-start`], { queryParams: { caseId, eventId, taskId } });
      return of(false);
    }

    return of(true);
  }
}
