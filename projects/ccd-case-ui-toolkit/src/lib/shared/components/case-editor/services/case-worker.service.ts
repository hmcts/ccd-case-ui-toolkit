import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { Caseworker, CaseworkersByService } from '../../../domain/work-allocation/case-worker.model';
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

  public getUserByIdamId(idamId: string): Observable<Caseworker> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/caseworker/getUserByIdamId`;
    return this.http
      .post(url, idamId)
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }
}
