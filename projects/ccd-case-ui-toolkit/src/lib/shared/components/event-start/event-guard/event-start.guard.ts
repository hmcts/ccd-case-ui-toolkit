import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { WorkAllocationService } from '../../case-editor/services/work-allocation.service';

@Injectable()
export class EventStartGuard implements CanActivate {

  constructor(private readonly workAllocationService: WorkAllocationService,
    private readonly router: Router,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService) {
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
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
        return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId, caseInfo.caseType, caseInfo.jurisdiction).pipe(
          switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId, eventId, taskId))
        );
      }

  public checkTaskInEventNotRequired(payload: TaskPayload, caseId: string, taskId: string): boolean {
    if (!payload || !payload.tasks) {
      return true;
    }
    const taskNumber = payload.tasks.length;
    if (taskNumber === 0) {
      // if there are no tasks just carry on
      return true;
    }
    // Get number of tasks assigned to user
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    const userInfo = JSON.parse(userInfoStr);
    const tasksAssignedToUser = payload.tasks.filter(x =>
      x.task_state !== 'unassigned' && x.assignee === userInfo.id || x.assignee === userInfo.uid
    );

    if (tasksAssignedToUser.length === 0) {
      // if no tasks assigned to user carry on
      return true;
    } else if (tasksAssignedToUser.length > 1 && !taskId) {
      // if more than one task assigned to the user then give multiple tasks error
      this.router.navigate([`/cases/case-details/${caseId}/multiple-tasks-exist`]);
      return false;
    } else {
      let task: any;
      if (taskId) {
        task = payload.tasks.find(x => x.id === taskId);
      } else {
        task = tasksAssignedToUser[0];
      }
      // if one task assigned to user, allow user to complete event
      this.sessionStorageService.setItem('taskToComplete', JSON.stringify(task));
      return true;
    }
  }

  private checkForTasks(payload: TaskPayload, caseId: string, eventId: string, taskId: string): Observable<boolean> {
    // Clear taskToComplete from session as we will be starting the process for new task
    this.sessionStorageService.removeItem('taskToComplete');

    if (payload.task_required_for_event) {
      // There are some issues in EventTriggerResolver/CaseService and/or CCD for some events
      // which triggers the CanActivate guard again.
      // If event start is initiated again, then we do not need to perform state machine processing again.
      // https://tools.hmcts.net/jira/browse/EUI-5489
      if (this.router && this.router.url && this.router.url.includes('event-start')) {
        return of(true);
      }
      this.router.navigate([`/cases/case-details/${caseId}/event-start`], { queryParams: { caseId, eventId, taskId } });
      return of(false);
    } else {
      return of(this.checkTaskInEventNotRequired(payload, caseId, taskId));
    }
  }
}
