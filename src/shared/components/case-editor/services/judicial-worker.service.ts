import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { Judicialworker } from '../../../domain/work-allocation/judicial-worker.model';
import { HttpErrorService, HttpService } from '../../../services';

@Injectable()
export class JudicialworkerService {

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService
  ) {
  }

  public getJudicialworkers(userIds: string[], serviceId: string): Observable<Judicialworker[]> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/getJudicialUsers`;
    return this.http
      .post(url, {userIds, services: [serviceId]})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }
}
