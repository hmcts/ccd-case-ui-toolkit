import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../case-editor';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';

@Injectable()
export class EventStartGuard implements CanActivate {

  constructor(private readonly router: Router, private readonly workAllocationService: WorkAllocationService) {
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const caseId = route.params['cid'];
    const eventId = route.params['eid'];
    const isComplete = route.queryParams['isComplete'];
    if (isComplete) {
      return of(true);
    }
    return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId).pipe(
      switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId))
    );
  }

  private checkForTasks(payload: TaskPayload, caseId: string): Observable<boolean> {
    console.log('payload', payload);
    console.log('caseId', caseId);
    if (payload.task_required_for_event && payload.tasks.length > 0) {
      this.router.navigate([`/cases/case-details/${caseId}/eventStart`]);
      return of(false);
    }

    this.router.navigate([`/cases/case-details/${caseId}/eventStart`]);

    return of(true);
  }
}
