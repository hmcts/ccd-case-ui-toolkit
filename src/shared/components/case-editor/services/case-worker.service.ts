import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpErrorService, HttpService } from '../../../services';

@Injectable()
export class CaseworkerService {

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService
  ) {
  }

  public getCaseworkers(userIds: string[]): Observable<any> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/caseworker`;
    return this.http
      .post(url, {userIds})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }
}
