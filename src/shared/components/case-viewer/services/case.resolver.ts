import { NavigationEnd, ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CaseView, Draft } from '../../../domain';
import { DraftService, NavigationOrigin, SessionStorageService } from '../../../services';
import { NavigationNotifierService } from '../../../services/navigation/navigation-notifier.service';
import { CaseNotifier } from '../../case-editor';

@Injectable()
export class CaseResolver implements Resolve<CaseView> {

  public static readonly EVENT_REGEX = new RegExp('\/trigger\/.*?\/submit$');
  public static readonly PARAM_CASE_ID = 'cid';
  public static readonly CASE_CREATED_MSG = 'The case has been created successfully';

  public static defaultWAPage = '/work/my-work/list';
  public static defaultPage = '/cases';
  // we need to run the CaseResolver on every child route of 'case/:jid/:ctid/:cid'
  // this is achieved with runGuardsAndResolvers: 'always' configuration
  // we cache the case view to avoid retrieving it for each child route
  previousUrl: string;
  constructor(private caseNotifier: CaseNotifier,
              private draftService: DraftService,
              private navigationNotifierService: NavigationNotifierService,
              private router: Router,
              private sessionStorage: SessionStorageService) {
    router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = event.url;
      });
  }

  resolve(route: ActivatedRouteSnapshot): Promise<CaseView> {
    let cid = route.paramMap.get(CaseResolver.PARAM_CASE_ID);

    if (!cid) {
      // when redirected to case view after a case created, and the user has no READ access,
      // the post returns no id
      this.navigateToCaseList();
    } else {
      return this.isRootCaseViewRoute(route) ? this.getAndCacheCaseView(cid)
        : this.caseNotifier.cachedCaseView ? Promise.resolve(this.caseNotifier.cachedCaseView)
        : this.getAndCacheCaseView(cid);
    }
  }

  private navigateToCaseList() {
    this.navigationNotifierService.announceNavigation({action: NavigationOrigin.NO_READ_ACCESS_REDIRECTION});
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
    if (this.caseNotifier.cachedCaseView && this.caseNotifier.cachedCaseView.case_id && this.caseNotifier.cachedCaseView.case_id === cid) {
      this.caseNotifier.announceCase(this.caseNotifier.cachedCaseView);
      return of(this.caseNotifier.cachedCaseView).toPromise();
    } else {
      if (Draft.isDraft(cid)) {
        return this.getAndCacheDraft(cid);
      } else {
        return this.caseNotifier.fetchAndRefresh(cid)
          .pipe(catchError(error => this.checkAuthorizationError(error)))
          .toPromise();
      }
    }
  }

  private getAndCacheDraft(cid): Promise<CaseView> {
      return this.draftService
      .getDraft(cid)
      .pipe(
        map(caseView => {
          this.caseNotifier.cachedCaseView = plainToClassFromExist(new CaseView(), caseView);
          this.caseNotifier.announceCase(this.caseNotifier.cachedCaseView);
          return this.caseNotifier.cachedCaseView;
        }),
        catchError(error => this.checkAuthorizationError(error))
      ).toPromise();
  }

  private checkAuthorizationError(error: any) {
    // TODO Should be logged to remote logging infrastructure
    if (error.status === 400) {
      this.router.navigate(['/search/noresults']);
      return Observable.of(null);
    }
    console.error(error);
    if (CaseResolver.EVENT_REGEX.test(this.previousUrl) && error.status === 404) {
      this.router.navigate(['/list/case']);
      return Observable.of(null);
    }
    if (error.status !== 401 && error.status !== 403) {
      this.router.navigate(['/error']);
    }
    this.goToDefaultPage();
    return Observable.throw(error);
  }

  // as discussed for EUI-5456, need functionality to go to default page
  private goToDefaultPage(): void {
    const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails'));
    userDetails && userDetails.roles
        && !userDetails.roles.includes('pui-case-manager')
        &&
        (userDetails.roles.includes('caseworker-ia-iacjudge')
          || userDetails.roles.includes('caseworker-ia-caseofficer')
          || userDetails.roles.includes('caseworker-ia-admofficer')
          || userDetails.roles.includes('caseworker-civil')
          || userDetails.roles.includes('caseworker-privatelaw'))
        ? this.router.navigate([CaseResolver.defaultWAPage]) : this.router.navigate([CaseResolver.defaultPage]);
  }
}
