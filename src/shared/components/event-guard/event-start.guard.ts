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
    if (caseId !== '1620409659381330') {
      return of(true);
    }
    // no tasks;
    if (!tasks.length) {
      this.router.navigate([`/cases/case-details/${caseId}/no-tasks-available`]);
      return of(true);
    }
    // one task returned
    if (tasks.length === 1) {
      const task = tasks[0];
      // task is cancelled
      if (task.task_title === 'Cancelled task name') {
        this.router.navigate([`/cases/case-details/${caseId}/task-cancelled`]);
        return of(true);
      }
      // conflict task name
      if (task.task_title === 'Conflict task name') {
        this.router.navigate([`/cases/case-details/${caseId}/task-conflict`])
        return of(true);
      }
      // task is assigned to someone else
      if (task.assignee !== EventStartGuard.UserId) {
        this.router.navigate([`/cases/case-details/${caseId}/task-assignment`]);
        return of(true);
      }
    }

    // multiple tasks returned
    if (tasks.length > 1) {
      this.router.navigate([`/cases/case-details/${caseId}/multiple-tasks-exist`]);
    }
    return of(true);
  }
}
