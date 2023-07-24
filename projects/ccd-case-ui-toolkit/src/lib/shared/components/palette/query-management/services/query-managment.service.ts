import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../../app.config';
import { TaskSearchParameter } from '../../../../domain';
import { AlertService, HttpErrorService, HttpService } from '../../../../services';

@Injectable({
  providedIn: 'root'
})
export class QueryManagmentService {

  constructor(private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService,
    private readonly alertService: AlertService,) { }

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
          this.http.get(this.appConfig.getUserInfoApiUrl()).pipe(map(response => response)).subscribe((response) => {
            this.alertService.warning({ phrase:'A task could not be completed successfully. Please complete the task associated with the case manually.'});
          });
          return throwError(error);
        })
      );
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
}
