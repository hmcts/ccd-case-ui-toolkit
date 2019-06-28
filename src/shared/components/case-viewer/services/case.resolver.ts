import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CaseView, Draft } from '../../../domain';
import { CaseService, CasesService } from '../../case-editor';
import { AlertService, DraftService } from '../../../services';
import { plainToClassFromExist } from 'class-transformer';

@Injectable()
export class CaseResolver implements Resolve<CaseView> {

  public static readonly PARAM_CASE_ID = 'cid';
  public static readonly CASE_CREATED_MSG = 'The case has been created successfully';
  public static readonly ON_ERROR_CASE_LIST = 'onErrorCaseList';

  // we need to run the CaseResolver on every child route of 'case/:jid/:ctid/:cid'
  // this is achieved with runGuardsAndResolvers: 'always' configuration
  // we cache the case view to avoid retrieving it for each child route
  public cachedCaseView: CaseView;
  onErrorCaseList: boolean;

  constructor(private caseService: CaseService,
              private casesService: CasesService,
              private draftService: DraftService,
              private router: Router,
              private alertService: AlertService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<CaseView> {

    let cid = route.paramMap.get(CaseResolver.PARAM_CASE_ID);
    this.onErrorCaseList = (route.queryParamMap.get(CaseResolver.ON_ERROR_CASE_LIST) || 'false' ) === 'true';

    if (!cid) {
      // when redirected to case view after a case created, and the user has no READ access,
      // the post returns no id
      this.navigateToCaseList();
    } else {
      return this.isRootCaseViewRoute(route) ? this.getAndCacheCaseView(cid)
        : this.cachedCaseView ? Promise.resolve(this.cachedCaseView)
        : this.getAndCacheCaseView(cid);
    }
  }

  private navigateToCaseList() {
    this.router.navigate(['/list/case'])
    .then(() => this.alertService.success(CaseResolver.CASE_CREATED_MSG));
  }

  private isRootCaseViewRoute(route: ActivatedRouteSnapshot) {
    // is route case/:jid/:ctid/:cid
    return ((!route.firstChild || !route.firstChild.url.length) && !this.isTabViewRoute(route));
  }

  private isTabViewRoute(route: ActivatedRouteSnapshot) {
    // is route case/:jid/:ctid/:cid#fragment
    return route.firstChild && route.firstChild.fragment;
  }

  private getAndCacheCaseView(cid): Promise<CaseView> {
    if (Draft.isDraft(cid)) {
      return this.getAndCacheDraft(cid);
    } else {
      return this.casesService
        .getCaseViewV2(cid)
        .pipe(
          map(caseView => {
            this.cachedCaseView = plainToClassFromExist(new CaseView(), caseView);
            this.caseService.announceCase(this.cachedCaseView);
            return this.cachedCaseView;
          }),
          catchError(error => this.checkAuthorizationError(error))
        ).toPromise();
    }
  }

  private getAndCacheDraft(cid): Promise<CaseView> {
    return this.draftService
      .getDraft(cid)
      .pipe(
        map(caseView => {
          this.cachedCaseView = plainToClassFromExist(new CaseView(), caseView);
          this.caseService.announceCase(this.cachedCaseView);
          return this.cachedCaseView;
        }),
        catchError(error => this.checkAuthorizationError(error))
      ).toPromise();
  }

  private checkAuthorizationError(error: any) {
    // TODO Should be logged to remote logging infrastructure
    console.error(error);
    if (this.onErrorCaseList && error.status === 404) {
      this.router.navigate(['/list/case'])
      return Observable.of(null);
    }
    if (error.status !== 401 && error.status !== 403) {
      this.router.navigate(['/error']);
    }
    return Observable.throw(error);
  }
}
