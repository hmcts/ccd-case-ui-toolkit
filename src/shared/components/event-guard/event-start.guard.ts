import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../case-editor';
import { TaskPayload } from '../../domain/work-allocation/TaskPayload';

@Injectable()
export class EventStartGuard implements CanActivate {

  private static checkForTasks(payload: TaskPayload, caseId: string): Observable<boolean> {
    console.log('payload', payload);
    console.log('caseId', caseId);
    return of(true);
  }

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
      switchMap((payload: TaskPayload) => EventStartGuard.checkForTasks(payload, caseId))
    );
  }
}
