import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WorkAllocationService } from '../../components/case-editor/services/work-allocation.service';

@Injectable({
    providedIn: 'root'
})
export class EventStartGuard implements CanActivate {
    public partUrl = '/case-details/';
    constructor(public readonly router: Router, public readonly workAllocationService: WorkAllocationService) {}

    public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const caseId = route.params['cid'];
        const eventId = route.params['eid'];
        const isComplete = route.queryParams['isComplete'];
        if (isComplete) {
            return of(true);
        }
        return this.workAllocationService.anyTasksRequired(eventId, caseId).pipe(
            switchMap(anyTasksRequired => this.checkForTasks(anyTasksRequired, caseId))
        );
    }

    private checkForTasks(anyTasksRequired: boolean, caseId: string): Observable<boolean> {
        if (anyTasksRequired) {
            this.router.navigate([`/cases/case-details/${caseId}/eventStart`]);
            return of(false);
        } else {
            return of(true);
        }
    }
}
