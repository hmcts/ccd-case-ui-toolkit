import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../components/case-editor/services/work-allocation.service';
import { Task } from '../../domain/work-allocation/Task';

@Injectable({
  providedIn: 'root'
})
export class EventStartGuard implements CanActivate {
  constructor(private readonly workAllocationService: WorkAllocationService) {
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
    if (tasks.length) {
      // this.router.navigate([`/cases/case-details/${caseId}/eventStart`]);
      return of(false);
    } else {
      return of(true);
    }
  }
}
