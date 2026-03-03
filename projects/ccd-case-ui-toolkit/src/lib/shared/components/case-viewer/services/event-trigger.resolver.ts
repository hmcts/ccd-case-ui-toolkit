import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { Profile } from '../../../domain/profile/profile.model';
import { AlertService } from '../../../services/alert/alert.service';
import { ProfileNotifier } from '../../../services/profile/profile.notifier';
import { ProfileService } from '../../../services/profile/profile.service';
import { CasesService } from '../../case-editor/services/cases.service';
import { AbstractAppConfig } from '../../../../app.config';
import { ErrorNotifierService } from '../../../services/error/error-notifier.service';
import { LoadingService, SessionStorageService } from '../../../services';
import { safeJsonParse } from '../../../json-utils';

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
    private router: Router,
    private appConfig: AbstractAppConfig,
    private errorNotifier: ErrorNotifierService,
    private readonly loadingService: LoadingService,
    private readonly sessionStorageService: SessionStorageService,
    ) {}

  public resolve(route: ActivatedRouteSnapshot): Promise<CaseEventTrigger> {
    const jurisdiction = route.parent?.paramMap.get('jurisdiction') || route.paramMap.get('jurisdiction');
    const caseType = route.parent?.paramMap.get('caseType') || route.paramMap.get('caseType');
    const eventTriggerId = route.paramMap.get(EventTriggerResolver.PARAM_EVENT_ID);
    const cid = route.paramMap.get(EventTriggerResolver.PARAM_CASE_ID);
    const query = route.queryParams;

    // If jurisdiction or caseType are missing, redirect to correct URL
    if (!jurisdiction || !caseType) {
      const caseInfo = safeJsonParse<any>(this.sessionStorageService.getItem('caseInfo'), {});
      const jurisdictionId = caseInfo?.jurisdiction;
      const caseTypeId = caseInfo?.caseType;
      const caseId = caseInfo?.caseId;
      if (!jurisdictionId || !caseTypeId || !caseId || (caseId !== cid)) {
        this.alertService.error({ phrase: 'Cannot determine jurisdiction and case type' });
        this.router.navigate([this.router.url]);
        return Promise.resolve(null);
      }

      this.router.navigate([
        '/cases/case-details',
        jurisdictionId,
        caseTypeId,
        cid,
        'trigger',
        eventTriggerId
      ], {
      queryParams: {
        ...query
      }
      });
      return Promise.resolve(null);
    }

    if (this.isRootTriggerEventRoute(route)) {
      return this.getAndCacheEventTrigger(route);
    }
    if (this.cachedEventTrigger && ((route.params?.eid === this.cachedEventTrigger?.id) && (route.params?.cid === this.cachedEventTrigger?.case_id))) {
      return Promise.resolve(this.cachedEventTrigger);
    }
    return this.getAndCacheEventTrigger(route);
  }

  private isRootTriggerEventRoute(route: ActivatedRouteSnapshot) {
    // if route is 'trigger/:eid'
    return !route.firstChild || !route.firstChild.url.length;
  }

  public resetCachedEventTrigger(): void {
    this.cachedEventTrigger = null;
  }

  private getAndCacheEventTrigger(route: ActivatedRouteSnapshot): Promise<CaseEventTrigger> {
    const cid = route.parent.paramMap.get(EventTriggerResolver.PARAM_CASE_ID);
    // tslint:disable-next-line: prefer-const
    let caseTypeId: string;
    const jurisdiction = route.parent.paramMap.get('jurisdiction');
    const caseType = route.parent.paramMap.get('caseType');
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
        map((eventTrigger) => this.cachedEventTrigger = eventTrigger),
        catchError((error) => {
          error.details = { eventId: eventTriggerId, ...error.details };
          this.alertService.setPreserveAlerts(true);
          this.alertService.error(error.message);
          this.errorNotifier.announceError(error);
          if (!this.router.url?.includes('/cases/case-details/')) {
            caseTypeId = route.parent.paramMap.get('caseType');
            this.router.navigate([`/cases/case-details/${jurisdiction}/${caseType}/${cid}`], { fragment: 'Tasks' });
          }
          return throwError(error);
        })
      ).toPromise();
  }
}
