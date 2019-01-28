import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { CaseEventTrigger, CaseView, HttpError } from '../../../domain';
import { CasesService } from '../../case-editor';
import { AlertService } from '../../../services';

@Injectable()
export class EventTriggerResolver implements Resolve<CaseEventTrigger> {

  public static readonly PARAM_EVENT_ID = 'eid';
  public static readonly IGNORE_WARNING = 'ignoreWarning';

  private static readonly IGNORE_WARNING_VALUES = [ 'true', 'false' ];
  private cachedEventTrigger: CaseEventTrigger;

  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
    ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<CaseEventTrigger> {
    return this.isRootTriggerEventRoute(route) ? this.getAndCacheEventTrigger(route)
        : this.cachedEventTrigger ? Observable.of(this.cachedEventTrigger)
        : this.getAndCacheEventTrigger(route);
  }

  private isRootTriggerEventRoute(route: ActivatedRouteSnapshot) {
    // if route is 'trigger/:eid'
    return !route.firstChild || !route.firstChild.url.length;
  }

  private getAndCacheEventTrigger(route: ActivatedRouteSnapshot): Observable<CaseEventTrigger> {
    let caseDetails: CaseView = route.parent.data.case;
    let caseTypeId = undefined;
    let eventTriggerId = route.paramMap.get(EventTriggerResolver.PARAM_EVENT_ID);
    let ignoreWarning = route.queryParamMap.get(EventTriggerResolver.IGNORE_WARNING);
    if (-1 === EventTriggerResolver.IGNORE_WARNING_VALUES.indexOf(ignoreWarning)) {
      ignoreWarning = 'false';
    }
    return this.casesService
      .getEventTrigger(caseTypeId, eventTriggerId, caseDetails.case_id, ignoreWarning)
      .do(eventTrigger => this.cachedEventTrigger = eventTrigger)
      .catch((error: HttpError) => {
        this.alertService.error(error.message);

        return Observable.throw(error);
      });
  }
}
