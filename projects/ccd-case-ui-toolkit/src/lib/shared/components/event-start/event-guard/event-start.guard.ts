
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { Task, TaskEventCompletionInfo } from '../../../domain/work-allocation/Task';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { ReadCookieService, SessionStorageService } from '../../../services';
import { CaseEditComponent, CaseNotifier, WorkAllocationService } from '../../case-editor';
import { removeTaskFromClientContext } from '../../case-editor/case-edit-utils/case-edit.utils';

@Injectable()
export class EventStartGuard implements CanActivate {
  private jurisdiction: string;
  private caseType: string;
  private caseId: string;

  constructor(private readonly workAllocationService: WorkAllocationService,
              private readonly router: Router,
              private readonly sessionStorageService: SessionStorageService,
              private readonly abstractConfig: AbstractAppConfig,
              private readonly cookieService: ReadCookieService,
              private readonly caseNotifier: CaseNotifier) {
    // Keep subscribing to caseView to update internal properties.
    // This subscription should ideally be cleaned up if this guard is not a singleton or is reused heavily.
    // For a guard, it's typically fine as guards are often singletons.
    this.caseNotifier.caseView.subscribe((caseDetails) => {
      if (caseDetails) {
        this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
        this.caseType = caseDetails?.case_type?.id;
        this.caseId = caseDetails?.case_id;
      }
    });
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const routeCaseId = route.params['cid']; // Get the caseId from the current route parameters
    const eventId = route.params['eid'];
    const taskId = route.queryParams['tid'];

    // Always fetch or refresh case data if the current internal caseId doesn't match the route's caseId
    // or if the internal data is incomplete.
    const ensureCaseDataIsCurrent$ = (this.caseId !== routeCaseId || !this.jurisdiction || !this.caseType) ?
        this.caseNotifier.fetchAndRefresh(routeCaseId).pipe(
            tap((caseDetails) => {
              // Update internal state after fetch
              this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
              this.caseType = caseDetails?.case_type?.id;
              this.caseId = caseDetails?.case_id;
              this.abstractConfig.logMessage(`EventStartGuard: Fetched and refreshed caseId ${this.caseId} from route parameter ${routeCaseId}`);
            }),
            map(() => true)
        ) : of(true); // If internal data matches, no need to fetch again

    let userId: string;
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.id ? userInfo.id : userInfo.uid;
    }

    // Client context setup remains the same
    const languageCookie = this.cookieService.getCookie('exui-preferred-language');
    const currentLanguage = !!languageCookie && languageCookie !== '' ? languageCookie : 'en';
    const preClientContext = this.sessionStorageService.getItem(CaseEditComponent.CLIENT_CONTEXT);
    if (!preClientContext) {
      const storeClientContext = {
        client_context: {
          user_language: {
            language: currentLanguage
          }
        }
      };
      this.sessionStorageService.setItem(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(storeClientContext));
    } else {
      const clientContextObj = JSON.parse(preClientContext);
      if (!clientContextObj?.client_context?.user_language) {
        const clientContextAddLanguage = {
          ...clientContextObj,
          client_context: {
            ...clientContextObj.client_context,
            user_language: {
              language: currentLanguage
            }
          }
        }
        this.sessionStorageService.setItem(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(clientContextAddLanguage));
      }
    }

    return ensureCaseDataIsCurrent$.pipe( // Now ensureCaseDataIsCurrent$ ensures this.caseId is correct
        switchMap(() => {
          // At this point, this.caseId, this.jurisdiction, this.caseType should reflect the route's caseId
          // Log the state *after* ensuring it's up-to-date
          this.abstractConfig.logMessage(`EventStartGuard: Checking tasks for caseId ${this.caseId} (route ${routeCaseId}) with jurisdiction ${this.jurisdiction} and caseType ${this.caseType}`);

          if (this.jurisdiction && this.caseType && this.caseId === routeCaseId) { // Confirm the match
            return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, routeCaseId, this.caseType, this.jurisdiction)
                .pipe(
                    switchMap((payload: TaskPayload) => this.checkForTasks(payload, routeCaseId, eventId, taskId, userId))
                );
          } else {
            // This should ideally not be reached if ensureCaseDataIsCurrent$ successfully updated the state
            // but logging it as a fallback for unexpected scenarios.
            this.abstractConfig.logMessage(`EventStartGuard: Mismatch or missing caseInfo details after refresh attempt. Internal caseId: ${this.caseId}, Route caseId: ${routeCaseId}, Jurisdiction: ${this.jurisdiction}, CaseType: ${this.caseType}`);
            return of(false);
          }
        })
    );
  }

  public checkTaskInEventNotRequired(payload: TaskPayload, caseId: string, taskId: string, eventId: string, userId: string): boolean {
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
        x.task_state !== 'unassigned' && (x.assignee === userInfo.id || x.assignee === userInfo.uid)
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
      this.setClientContextStorage(task, caseId, eventId, userId);
      return true;
    }
  }

  private checkForTasks(payload: TaskPayload, caseId: string, eventId: string, taskId: string, userId: string): Observable<boolean> {
    if (taskId && payload?.tasks?.length > 0) {
      const task = payload.tasks.find((t) => t.id == taskId);
      if (task) {
        this.setClientContextStorage(task, caseId, eventId, userId);
      } else {
        removeTaskFromClientContext(this.sessionStorageService);
      }
    }
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
      return of(this.checkTaskInEventNotRequired(payload, caseId, taskId, eventId, userId));
    }
  }

  // EXUI-2743 - Make taskEventCompletionInfo always available in session storage with client context
  private setClientContextStorage(task: Task, caseId: string, eventId: string, userId: string): void {
    // Store task to session
    const taskEventCompletionInfo: TaskEventCompletionInfo = {
      caseId: caseId,
      eventId: eventId,
      userId: userId,
      taskId: task.id,
      createdTimestamp: Date.now()
    };
    const currentLanguage = this.cookieService.getCookie('exui-preferred-language');
    const storeClientContext = {
      client_context: {
        user_task: {
          task_data: task,
          complete_task: true
        },
        user_language: {
          language: currentLanguage
        }
      }
    };
    this.sessionStorageService.setItem(CaseEditComponent.TASK_EVENT_COMPLETION_INFO, JSON.stringify(taskEventCompletionInfo));
    this.sessionStorageService.setItem(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(storeClientContext));
  }
}
