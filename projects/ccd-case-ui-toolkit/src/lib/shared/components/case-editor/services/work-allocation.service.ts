import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { TaskSearchParameter, WAFeatureConfig } from '../../../domain';
import { TaskResponse } from '../../../domain/work-allocation/task-response.model';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { CaseNotifier } from './case.notifier';
import { AlertService, HttpErrorService, HttpService, SessionStorageService } from '../../../services';
import { isInternalUser } from '../../../utils';

export const MULTIPLE_TASKS_FOUND = 'More than one task found!';

@Injectable()
export class WorkAllocationService {
  public static iACCaseOfficer = 'caseworker-ia-caseofficer';
  public static iACAdmOfficer = 'caseworker-ia-admofficer';

  private features: WAFeatureConfig;
  private jurisdiction: string;
  private caseType: string;

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService,
    private readonly alertService: AlertService,
    private readonly caseNotifier: CaseNotifier,
    private readonly sessionStorageService: SessionStorageService
  ) {
    this.caseNotifier.caseView.subscribe((caseDetails) => {
      if (caseDetails) {
        this.jurisdiction = caseDetails?.case_type?.jurisdiction?.id;
        this.caseType = caseDetails?.case_type?.id;
      }
    });
  }

  /**
   * Call the API to get tasks matching the search criteria.
   * @param searchRequest The search parameters that specify which tasks to match.
   */
  public searchTasks(searchRequest: TaskSearchParameter): Observable<object> {
    // Do not need to check if WA enabled as parent method will do that
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/searchForCompletable`;
    return this.http
      .post(url, {searchRequest}, null, false)
      .pipe(
        map(response => response),
        catchError(error => {
          this.errorService.setError(error);
          // explicitly eat away 401 error and 400 error
          if (error && error.status && (error.status === 401 || error.status === 400)) {
            // do nothing
            console.log('error status 401 or 400', error);
          } else {
            return throwError(error);
          }
        })
      );
  }

  private isWAEnabled(jurisdiction?: string, caseType?: string): boolean {
    this.features = this.appConfig.getWAServiceConfig();
    if (this.features) {
      const ftstr = JSON.stringify(this.features);
      this.appConfig?.logMessage(`isWAEnabled: wa-service-config returning ${ftstr?.length > 0}`);
    } else {
      this.appConfig?.logMessage(`isWAEnabled: wa-service-config returning no features`);
      return false;
    }
    let enabled = false;
    if (!jurisdiction || !caseType) {
      jurisdiction = this.jurisdiction;
      caseType = this.caseType;
    }
    if (!this.features || !this.features.configurations) {
      this.appConfig.logMessage('isWAEnabled: no features');
      return false;
    }
    this.features.configurations.forEach(serviceConfig => {
      if (serviceConfig.serviceName === jurisdiction && (serviceConfig.caseTypes.indexOf(caseType) !== -1)) {
          enabled = true;
      }
    });
    this.appConfig.logMessage(`isWAEnabled: returning ${enabled}`);
    return enabled;
  }

  /**
   * Call the API to assign a task.
   * @param taskId specifies which task should be assigned.
   * @param userId specifies the user the task should be assigned to.
   */
  public assignTask(taskId: string, userId: string): Observable<any> {
    if (!this.isWAEnabled()) {
      return of(null);
    }
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task/${taskId}/assign`;
    return this.http
      .post(url, {userId})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  /**
   * Call the API to complete a task.
   * @param taskId specifies which task should be completed.
   */
  public completeTask(taskId: string, eventName?: string): Observable<any> {
    if (!this.isWAEnabled()) {
      this.alertService.setPreserveAlerts(true);
      this.alertService.warning({ phrase:'completeTask: Work Allocation is not enabled, so the task could not be completed. Please complete the task associated with the case manually.'});
      return of(null);
    }
    this.appConfig.logMessage(`completeTask: completing ${taskId}`);
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task/${taskId}/complete`;
    return this.http
      .post(url, { actionByEvent: true, eventName: eventName })
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          this.handleTaskCompletionError();
          return throwError(error);
        })
      );
  }

  /**
   * Call the API to assign and complete a task.
   * @param taskId specifies which task should be completed.
   */
  public assignAndCompleteTask(taskId: string, eventName?: string): Observable<any> {
    if (!this.isWAEnabled()) {
      this.alertService.setPreserveAlerts(true);
      this.alertService.warning({ phrase:'assignAndCompleteTask: Work Allocation is not enabled, so the task could not be completed. Please complete the task associated with the case manually.'});
      return of(null);
    }
    this.appConfig.logMessage(`assignAndCompleteTask: completing ${taskId}`);
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task/${taskId}/complete`;
    return this.http
      .post(url, {
        completion_options: {
          assign_and_complete: true
        },
        actionByEvent: true,
        eventName: eventName
      })
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          this.handleTaskCompletionError();
          return throwError(error);
        })
      );
  }

  /**
   * Handles the response from the observable to get the user details when task is completed.
   * @param response is the response given from the observable which contains the user detaild.
   */
  public handleTaskCompletionError(): void {
    if (isInternalUser(this.sessionStorageService)) {
      // when submitting the completion of task if not yet rendered cases/case confirm then preserve the alert for re-rendering
      this.alertService.setPreserveAlerts(true, ['cases/case', 'submit']);
      this.alertService.warning({ phrase:'A task could not be completed successfully. Please complete the task associated with the case manually.'});
    }
  }

  /**
   * Look for open tasks for a case and event combination. There are 5 possible scenarios:
   *   1. No tasks found                              => Success.
   *   2. One task found => Mark as done              => Success.
   *   3. One task found => Mark as done throws error => Failure.
   *   4. More than one task found                    => Failure.
   *   5. Search call throws an error                 => Failure.
   * @param ccdId The ID of the case to find tasks for.
   * @param eventId The ID of the event to find tasks for.
   */
  public completeAppropriateTask(ccdId: string, eventId: string, jurisdiction: string, caseTypeId: string): Observable<any> {
    if (!this.isWAEnabled(jurisdiction, caseTypeId)) {
      return of(null);
    }
    const taskSearchParameter: TaskSearchParameter = {
      ccdId,
      eventId,
      jurisdiction,
      caseTypeId
    };
    return this.searchTasks(taskSearchParameter)
      .pipe(
        map((response: any) => {
          const tasks: any[] = response.tasks;
          if (tasks && tasks.length > 0) {
            if (tasks.length === 1) {
              this.completeTask(tasks[0].id, eventId).subscribe();
            } else {
              // This is a problem. Throw an appropriate error.
              throw new Error(MULTIPLE_TASKS_FOUND);
            }
          }
          return true; // All good. Nothing to see here.
        }),
        catchError(error => {
          // Simply rethrow it.
          return throwError(error);
        })
      );
  }

  /**
   * Return tasks for case and event.
   */
  public getTasksByCaseIdAndEventId(eventId: string, caseId: string, caseType: string, jurisdiction: string): Observable<TaskPayload> {
    const defaultPayload: TaskPayload = {
      task_required_for_event: false,
      tasks: []
    };
    if (!this.isWAEnabled()) {
      this.appConfig.logMessage(`isWAEnabled false for ${caseId} in event ${eventId}`);
      return of(defaultPayload);
    }
    return this.http.get(`${this.appConfig.getWorkAllocationApiUrl()}/case/tasks/${caseId}/event/${eventId}/caseType/${caseType}/jurisdiction/${jurisdiction}`);
  }

 /**
  * Call the API to get a task
  */
 public getTask(taskId: string): Observable<TaskResponse> {
  if (!this.isWAEnabled()) {
    return of({task: null});
  }
  this.appConfig.logMessage(`getTask: ${taskId}`);
  return this.http.get(`${this.appConfig.getWorkAllocationApiUrl()}/task/${taskId}`);
 }
}
