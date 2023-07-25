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
          return throwError(error);
        })
      );
  }

  /**
   * Call the API to get tasks matching the search criteria.
   * @param searchRequest The search parameters that specify which tasks to match.
   */
   public searchTasks(searchRequest: TaskSearchParameter): Observable<object> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/searchForCompletable`;
    return this.http
      .post(url, {searchRequest}, null, false)
      .pipe(
        map(response => response),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }
}
