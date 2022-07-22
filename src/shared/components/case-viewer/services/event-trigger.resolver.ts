import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CaseEventTrigger, Profile } from '../../../domain';
import { AlertService, ProfileNotifier, ProfileService } from '../../../services';
import { CasesService } from '../../case-editor';

@Injectable()
export class EventTriggerResolver implements Resolve<CaseEventTrigger> {
  public static readonly PARAM_CASE_ID = 'cid';
  public static readonly PARAM_EVENT_ID = 'eid';
  public static readonly IGNORE_WARNING = 'ignoreWarning';
  private static readonly IGNORE_WARNING_VALUES = [ 'true', 'false' ];
  private cachedEventTrigger: CaseEventTrigger;
  private cachedProfile: Profile;
  constructor(
    private readonly casesService: CasesService,
    private readonly alertService: AlertService,
    private readonly profileService: ProfileService,
    private readonly profileNotifier: ProfileNotifier,
    ) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<CaseEventTrigger> {
    return this.isRootTriggerEventRoute(route) ? this.getAndCacheEventTrigger(route)
        : this.cachedEventTrigger ? Promise.resolve(this.cachedEventTrigger)
        : this.getAndCacheEventTrigger(route);
  }

  private isRootTriggerEventRoute(route: ActivatedRouteSnapshot) {
    // if route is 'trigger/:eid'
    return !route.firstChild || !route.firstChild.url.length;
  }

  private getAndCacheEventTrigger(route: ActivatedRouteSnapshot): Promise<CaseEventTrigger> {
    const cid = route.parent.paramMap.get(EventTriggerResolver.PARAM_CASE_ID);
    // tslint:disable-next-line: prefer-const
    let caseTypeId: string;
    const eventTriggerId = route.paramMap.get(EventTriggerResolver.PARAM_EVENT_ID);
    let ignoreWarning = route.queryParamMap.get(EventTriggerResolver.IGNORE_WARNING);
    if (-1 === EventTriggerResolver.IGNORE_WARNING_VALUES.indexOf(ignoreWarning)) {
      ignoreWarning = 'false';
    }

    if (this.cachedProfile) {
      this.profileNotifier.announceProfile(this.cachedProfile);
    } else {
      this.profileService.get().subscribe(profile => {
        this.cachedProfile = profile;
        this.profileNotifier.announceProfile(profile);
      });
    }

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
