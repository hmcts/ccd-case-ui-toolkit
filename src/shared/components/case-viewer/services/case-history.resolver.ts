import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import { CaseHistory } from '../domain';
import { CaseHistoryService } from './case-history.service';
import { CaseView } from '../../../domain';

@Injectable()
export class CaseHistoryResolver implements Resolve<CaseHistory> {
  public static readonly PARAM_EVENT_ID = 'eid';

  constructor(private caseHistoryService: CaseHistoryService,
              private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CaseHistory> {
    let caseView: CaseView = route.parent.data.case;
    let caseId = caseView.case_id;
    let triggerId = route.paramMap.get(CaseHistoryResolver.PARAM_EVENT_ID);
    return this.getCaseHistoryView(caseId, triggerId);
  }

  private getCaseHistoryView(cid, eid): Observable<CaseHistory> {
    return this.caseHistoryService
      .get(cid, eid)
      .catch((error: Response | any) => {
        console.error(error);
        if (error.status !== 401 && error.status !== 403) {
          this.router.navigate(['/error']);
        }
        return Observable.throw(error);
      });
  }
}
