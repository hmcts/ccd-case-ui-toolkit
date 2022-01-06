import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../case-editor';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';

@Injectable()
export class EventGuard implements CanActivate {

  constructor(private readonly workAllocationService: WorkAllocationService, private readonly router: Router) {
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const caseId = route.params['cid'];
    const eventId = route.params['eid'];
    const taskId = route.params['tid'];
    // TODO: NavigationExtras should be used once Angular upgrade changes have been incorporated
    const isComplete = route.queryParams['isComplete'];
    if (isComplete) {
      return of(true);
    }
    return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId).pipe(
      switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId, eventId, taskId))
    );
  }

  private checkForTasks(payload: TaskPayload, caseId: string, eventId: string, taskId: string): Observable<boolean> {
    if (payload.task_required_for_event) {
      this.router.navigate([`/cases/case-details/${caseId}/event-start`], { queryParams: { caseId, eventId, taskId } });
      return of(false);
    }

    return of(true);
  }
}
