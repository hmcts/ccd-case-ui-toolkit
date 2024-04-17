import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { SessionStorageService } from '../../../services';
import { WorkAllocationService } from '../../case-editor';

@Injectable()
export class EventStartGuard implements CanActivate {
  constructor(private readonly workAllocationService: WorkAllocationService,
    private readonly router: Router,
    private readonly sessionStorageService: SessionStorageService) {
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const caseId = route.params['cid'];
    const eventId = route.params['eid'];
    const taskId = route.queryParams['tid'];

    const caseInfoStr = this.sessionStorageService.getItem('caseInfo');
    if (caseInfoStr) {
      const caseInfo = JSON.parse(caseInfoStr);
      if (caseInfo && caseInfo.cid === caseId) {
        return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId, caseInfo.caseType, caseInfo.jurisdiction).pipe(
          switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId, eventId, taskId))
        );
      }
    }
    return of(false);
  }

  public checkTaskInEventNotRequired(payload: TaskPayload, caseId: string, taskId: string): boolean {
    console.log('checkTaskInEventNotRequired: start');
    if (!payload || !payload.tasks) {
      return true;
    }
    const taskNumber = payload.tasks.length;
    console.log(`checkTaskInEventNotRequired: found ${taskNumber} tasks`);
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
    console.log(`checkTaskInEventNotRequired: ${tasksAssignedToUser} tasks assigned to user`)
    if (tasksAssignedToUser.length === 0) {
      // if no tasks assigned to user carry on
      return true;
    } else if (tasksAssignedToUser.length > 1 && !taskId) {
      console.log(`checkTaskInEventNotRequired: more than one task assigned, taskId: ${taskId}`)
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
      console.log(`checkTaskInEventNotRequired: storing task ${task} in session`)
      // if one task assigned to user, allow user to complete event
      this.sessionStorageService.setItem('taskToComplete', JSON.stringify(task));
      return true;
    }
  }

  private checkForTasks(payload: TaskPayload, caseId: string, eventId: string, taskId: string): Observable<boolean> {
    if (payload.task_required_for_event) {
      // There are some issues in EventTriggerResolver/CaseService and/or CCD for some events
      // which triggers the CanActivate guard again.
      // If event start is initiated again, then we do not need to perform state machine processing again.
      // https://tools.hmcts.net/jira/browse/EUI-5489
      if (this.router && this.router.url && this.router.url.includes('event-start')) {
        console.log(`checkForTasks: event-start again check is true: ${this.router.url} : taskId = ${taskId}`);
        return of(true);
      }
      this.router.navigate([`/cases/case-details/${caseId}/event-start`], { queryParams: { caseId, eventId, taskId } });
      return of(false);
    } else {
      // Clear taskToComplete from session as we will be starting the process for new task
      console.log(`Removing taskToComplete from session storage for case:event:task ${caseId}:${eventId}:${taskId}`);
      this.sessionStorageService.removeItem('taskToComplete');
      console.log("checkForTasks: no task required for event")
      return of(this.checkTaskInEventNotRequired(payload, caseId, taskId));
    }
  }
}
