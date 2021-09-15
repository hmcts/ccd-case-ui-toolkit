import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../components/case-editor/services/work-allocation.service';
import { Task } from '../../domain/work-allocation/task.model';

@Injectable({
    providedIn: 'root'
})
export class EventStartGuard implements CanActivate {
    public partUrl = '/case-details/';
    constructor(public readonly router: Router, public readonly workAllocationService: WorkAllocationService) {}

    public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const caseId = route.params['cid'];
        const eventId = route.params['eid'];
        return this.workAllocationService.getTasksForEventIdAndCaseId(eventId, caseId).pipe(
            switchMap(task => this.checkForTasks(task, caseId))
        );
    }

    private checkForTasks(tasks: Task[], caseId: string): Observable<boolean> {
        if (tasks && tasks.length) {
            this.router.navigate([`/cases/case-details/${caseId}/eventStart`]);
            return of(false);
        } else {
            return of(true);
        }
    }
}
