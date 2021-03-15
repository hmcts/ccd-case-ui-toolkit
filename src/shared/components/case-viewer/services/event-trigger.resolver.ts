import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { CaseEventTrigger, CaseView } from '../../../domain';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CasesService } from '../../case-editor';
import { AlertService, ProfileNotifier, ProfileService } from '../../../services';

@Injectable()
export class EventTriggerResolver implements Resolve<CaseEventTrigger> {
  public static readonly PARAM_CASE_ID = 'cid';
  public static readonly PARAM_EVENT_ID = 'eid';
  public static readonly IGNORE_WARNING = 'ignoreWarning';
  private static readonly IGNORE_WARNING_VALUES = [ 'true', 'false' ];
  private cachedEventTrigger: CaseEventTrigger;
  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
    private profileService: ProfileService,
    private profileNotifier: ProfileNotifier,
    ) {}

  resolve(route: ActivatedRouteSnapshot): Promise<CaseEventTrigger> {
    return this.isRootTriggerEventRoute(route) ? this.getAndCacheEventTrigger(route)
        : this.cachedEventTrigger ? Promise.resolve(this.cachedEventTrigger)
        : this.getAndCacheEventTrigger(route);
  }

  private isRootTriggerEventRoute(route: ActivatedRouteSnapshot) {
    // if route is 'trigger/:eid'
    return !route.firstChild || !route.firstChild.url.length;
  }

  private getAndCacheEventTrigger(route: ActivatedRouteSnapshot): Promise<CaseEventTrigger> {
    let cid = route.parent.paramMap.get(EventTriggerResolver.PARAM_CASE_ID);
    let caseTypeId = undefined;
    let eventTriggerId = route.paramMap.get(EventTriggerResolver.PARAM_EVENT_ID);
    let ignoreWarning = route.queryParamMap.get(EventTriggerResolver.IGNORE_WARNING);
    if (-1 === EventTriggerResolver.IGNORE_WARNING_VALUES.indexOf(ignoreWarning)) {
      ignoreWarning = 'false';
    }

    const profileObserver = this.profileService.get();
    profileObserver
      .pipe(
        map(profileData => {
          this.profileNotifier.announceProfile(profileData);
        })
      ).toPromise();

    return this.casesService
      .getEventTrigger(caseTypeId, eventTriggerId, cid, ignoreWarning)
      .pipe(
        map(eventTrigger => this.cachedEventTrigger = eventTrigger),
        catchError(error => {
          this.alertService.error(error.message);
          return throwError(error);
        })
      ).toPromise();
  }
}
