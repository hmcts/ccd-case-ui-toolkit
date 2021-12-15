import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../case-editor';
import { Task } from '../../domain/work-allocation/Task';

@Injectable()
export class EventStartGuard implements CanActivate {

  private static UserId = 'd90ae606-98e8-47f8-b53c-a7ab77fde22b'

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
      switchMap((tasks: Task[]) => this.checkForTasks(tasks, caseId))
    );
  }

  private checkForTasks(tasks: Task[], caseId: string): Observable<boolean> {
    // since this only mock use only the hard corded case id
    return of(true);
  }
}
