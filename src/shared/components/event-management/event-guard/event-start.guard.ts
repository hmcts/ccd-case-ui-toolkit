import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../case-editor';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';

@Injectable()
export class EventStartGuard implements CanActivate {

  constructor(private readonly workAllocationService: WorkAllocationService, private readonly router: Router) {
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const caseId = route.params['cid'];
    const eventId = route.params['eid'];
    const isComplete = route.queryParams['isComplete'];
    if (isComplete) {
      return of(true);
    }
    return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId).pipe(
      switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId, eventId))
    );
  }

  private checkForTasks(payload: TaskPayload, caseId: string, eventId: string): Observable<boolean> {
    if (payload.task_required_for_event) {
      this.router.navigate([`/cases/case-details/${caseId}/event-start`], { queryParams: { caseId, eventId } });
      return of(false);
    }

    this.router.navigate([`/cases/case-details/${caseId}/event-start`], { queryParams: { caseId, eventId } });
    return of(false);
  }
}
