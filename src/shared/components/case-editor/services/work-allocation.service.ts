import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { TaskSearchParameter, TaskSearchParameters } from '../../../domain';
import { UserDetails } from '../../../domain/user/user-details.model';
import { AlertService, HttpErrorService, HttpService } from '../../../services';

export const MULTIPLE_TASKS_FOUND = 'More than one task found!';

@Injectable()
export class WorkAllocationService {

  public static IACCaseOfficer = 'caseworker-ia-caseofficer';
  public static IACAdmOfficer = 'caseworker-ia-admofficer';

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService,
    private readonly alertService: AlertService
  ) {
  }

  /**
   * Call the API to get tasks matching the search criteria.
   * @param searchRequest The search parameters that specify which tasks to match.
   */
  public searchTasks(searchRequest: TaskSearchParameters): Observable<object> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task`;
    return this.http
      .post(url, { searchRequest })
      .pipe(
        map(response => response),
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
  public completeTask(taskId: string): Observable<any> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task/${taskId}/complete`;
    return this.http
      .post(url, {})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          // this will subscribe to get the user details and decide whether to display an error message
          this.http.get(this.appConfig.getUserInfoApiUrl()).map(response => response).subscribe((response) => {
            this.handleTaskCompletionError(response);
          });
          return throwError(error);
        })
      );
  }

  /**
   * Handles the response from the observable to get the user details when task is completed.
   * @param response is the response given from the observable which contains the user detaild.
   */
  public handleTaskCompletionError(response: any): void {
    const userDetails = response as UserDetails;
    if (this.userIsCaseworker(userDetails.userInfo.roles)) {
      // when submitting the completion of task if not yet rendered cases/case confirm then preserve the alert for re-rendering
      this.alertService.setPreserveAlerts(true, ['cases/case', 'submit']);
      this.alertService.warning('A task could not be completed successfully. Please complete the task associated with the case manually.');
    }
  }

  /**
   * Returns true if the user's role is equivalent to a caseworker.
   * @param roles is the list of roles found from the current user.
   */
  public userIsCaseworker(roles: string[]): boolean {
    const lowerCaseRoles = roles.map(role => role.toLowerCase());
    // When/if lib & target permanently change to es2016, replace indexOf with includes
    return (lowerCaseRoles.indexOf(WorkAllocationService.IACCaseOfficer) !== -1)
     || (lowerCaseRoles.indexOf(WorkAllocationService.IACAdmOfficer) !== -1);
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
  public completeAppropriateTask(ccdId: string, eventId: string): Observable<any> {
    const parameters: TaskSearchParameter[] = [{
      ccdId,
      eventId,
      state: ['Open'] // Need to know which are the "completeable" statuses.
    }];
    return this.searchTasks({ parameters })
      .pipe(
        map((response: any) => {
          const tasks: any[] = response.tasks;
          if (tasks && tasks.length > 0) {
            if (tasks.length === 1) {
              this.completeTask(tasks[0].id).subscribe();
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
}
