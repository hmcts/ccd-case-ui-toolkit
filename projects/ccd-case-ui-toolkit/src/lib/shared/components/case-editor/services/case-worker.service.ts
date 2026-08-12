import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { Caseworker } from '../../../domain/work-allocation/case-worker.model';
import { StaffCacheRoleCategory, StaffUser } from '../../../domain/work-allocation/staff-user.model';
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

  public searchStaffUsers(
    services: string[],
    searchTerm: string,
    roleCategories: StaffCacheRoleCategory[]
  ): Observable<StaffUser[]> {
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/caseworker/getUsersByServiceName`;
    const normalisedSearchTerm = searchTerm.toLowerCase();

    return this.http
      .post(url, { services, term: searchTerm })
      .pipe(
        map((caseworkers: Caseworker[]) => caseworkers
          .filter(caseworker => roleCategories.some(roleCategory => caseworker.roleCategories.includes(roleCategory)))
          .map(caseworker => ({
            idamId: caseworker.idamId,
            displayName: `${caseworker.firstName} ${caseworker.lastName}`.trim(),
            ...(caseworker.email ? { emailId: caseworker.email } : {})
          }))
          .filter(staffUser => staffUser.displayName.toLowerCase().includes(normalisedSearchTerm))
        ),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }
}
