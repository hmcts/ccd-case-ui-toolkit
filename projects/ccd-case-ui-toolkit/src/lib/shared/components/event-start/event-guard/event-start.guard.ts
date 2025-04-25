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
    this.caseNotifier.caseView.subscribe((caseDetails) => {
      if (caseDetails) {
        this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
        this.caseType = caseDetails?.case_type?.id;
        this.caseId = caseDetails?.case_id;
      }
    });
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const caseId = route.params['cid'];
    const eventId = route.params['eid'];
    const taskId = route.queryParams['tid'];
    // check if we have the case details in the case notifier
    // if not, then fetch the case details using case notifier
    const caseDataObservable = (!this.jurisdiction || !this.caseType || !this.caseId) ?
      this.caseNotifier.fetchAndRefresh(caseId).pipe(
        tap((caseDetails) => {
          this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
          this.caseType = caseDetails?.case_type?.id;
          this.caseId = caseDetails?.case_id;
        }),
        map(() => true)
      ) : of(true);

    let userId: string;
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.id ? userInfo.id : userInfo.uid;
    }
    const languageCookie = this.cookieService.getCookie('exui-preferred-language');
    const currentLanguage = !!languageCookie && languageCookie !== '' ? languageCookie : 'en';
    const preClientContext = this.sessionStorageService.getItem(CaseEditComponent.CLIENT_CONTEXT);
    if (!preClientContext) {
      // creates client context for language if not already existing
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
    return caseDataObservable.pipe(
      switchMap(() => {
        if (this.jurisdiction && this.caseType) {
          if (this.caseId === caseId) {
            return this.workAllocationService.getTasksByCaseIdAndEventId(eventId, caseId, this.caseType, this.jurisdiction)
              .pipe(
                switchMap((payload: TaskPayload) => this.checkForTasks(payload, caseId, eventId, taskId, userId))
              );
          }
          this.abstractConfig.logMessage(`EventStartGuard: caseId ${this.caseId} in case notifier not matched with the route parameter caseId ${caseId}`);
        } else {
          this.abstractConfig.logMessage(`EventStartGuard: caseInfo details not available in case notifier for ${caseId}`);
        }
        return of(false);
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
