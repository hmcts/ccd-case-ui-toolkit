import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseworkersByService } from '../../../domain/work-allocation/case-worker.model';
import { HttpErrorService } from '../../../services/http/http-error.service';
import { HttpService } from '../../../services/http/http.service';

@Injectable()
export class CaseworkerService {

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService
  ) {
  }

  public getCaseworkers(serviceId): Observable<CaseworkersByService[]> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/retrieveCaseWorkersForServices`;
    return this.http
      .post(url, { serviceIds: [serviceId]})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }
}
