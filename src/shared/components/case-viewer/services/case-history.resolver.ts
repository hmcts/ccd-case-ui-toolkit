import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CaseHistory } from '../domain';
import { CaseHistoryService } from './case-history.service';

@Injectable()
export class CaseHistoryResolver implements Resolve<CaseHistory> {
  public static readonly PARAM_CASE_ID = 'cid';
  public static readonly PARAM_EVENT_ID = 'eid';

  constructor(private caseHistoryService: CaseHistoryService,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Promise<CaseHistory> {
    let caseId = route.parent.paramMap.get(CaseHistoryResolver.PARAM_CASE_ID);
    let triggerId = route.paramMap.get(CaseHistoryResolver.PARAM_EVENT_ID);
    return this.getCaseHistoryView(caseId, triggerId);
  }

  private getCaseHistoryView(cid, eid): Promise<CaseHistory> {
    return this.caseHistoryService
      .get(cid, eid)
      .pipe(
        catchError(error => {
          console.error(error);
          if (error.status !== 401 && error.status !== 403) {
            this.router.navigate(['/error']);
          }
          return throwError(error);
          })
      ).toPromise();
  }
}
