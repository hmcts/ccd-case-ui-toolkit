import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Resolve, Router } from '@angular/router';
import { plainToClassFromExist } from 'class-transformer';
import { of, throwError } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseView, Draft } from '../../../domain';
import { DraftService, NavigationOrigin, SessionStorageService } from '../../../services';
import { NavigationNotifierService } from '../../../services/navigation/navigation-notifier.service';
import { PUI_CASE_MANAGER, USER_DETAILS } from '../../../utils';
import { CaseNotifier } from '../../case-editor';

@Injectable()
export class CaseResolver implements Resolve<CaseView> {
  public static readonly EVENT_REGEX = new RegExp('\/trigger\/.*?\/submit$');
  public static readonly PARAM_CASE_ID = 'cid';
  public static readonly CASE_CREATED_MSG = 'The case has been created successfully';

  public static readonly EVENT_ID_QM_RESPOND_TO_QUERY = 'eventId=queryManagementRespondQuery';

  public static defaultWAPage = '/work/my-work/list';
  public static defaultPage = '/cases';
  // we need to run the CaseResolver on every child route of 'case/:jid/:ctid/:cid'
  // this is achieved with runGuardsAndResolvers: 'always' configuration
  // we cache the case view to avoid retrieving it for each child route
  public previousUrl: string;
  constructor(private caseNotifier: CaseNotifier,
              private draftService: DraftService,
              private navigationNotifierService: NavigationNotifierService,
              private router: Router,
              private sessionStorage: SessionStorageService) {
    router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = event.url;
      });
  }

  public resolve(route: ActivatedRouteSnapshot): Promise<CaseView> {
    const cid = route.paramMap.get(CaseResolver.PARAM_CASE_ID);
    const currentUrl = this.router.url ?? '';

    // Prevent resolving if eventId=queryManagementRespondQuery is in the URL
    if (currentUrl.includes(CaseResolver.EVENT_ID_QM_RESPOND_TO_QUERY)) {
      console.info('Skipping resolve for event queryManagementRespondQuery.');
      this.goToDefaultPage();
    }

    if (!cid) {
      console.info('No case ID available in the route. Will navigate to case list.');
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
          .pipe(catchError(error => this.processErrorInCaseFetch(error, cid)))
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
        catchError(error => this.processErrorInCaseFetch(error, cid))
      ).toPromise();
  }

  private processErrorInCaseFetch(error: any, caseReference: string) {
    console.error('!!! processErrorInCaseFetch !!!');
    console.error(error);
    // TODO Should be logged to remote logging infrastructure
    if (error.status === 400) {
      this.router.navigate(['/search/noresults']);
      return of(null);
    }
    if (CaseResolver.EVENT_REGEX.test(this.previousUrl) && error.status === 404) {
      this.router.navigate(['/list/case']);
      return of(null);
    }
    // Error 403, navigate to restricted case access page
    if (error.status === 403) {
      this.router.navigate([`/cases/restricted-case-access/${caseReference}`]);
      return of(null);
    }
    if (error.status !== 401) {
      this.router.navigate(['/error']);
    }
    this.goToDefaultPage();
    return throwError(error);
  }

  // as discussed for EUI-5456, need functionality to go to default page
  private goToDefaultPage(): void {
    console.info('Going to default page!');
    const userDetails = JSON.parse(this.sessionStorage.getItem(USER_DETAILS));
    userDetails && userDetails.roles
        && !userDetails.roles.includes(PUI_CASE_MANAGER)
        &&
        (userDetails.roles.includes('caseworker-ia-iacjudge')
          || userDetails.roles.includes('caseworker-ia-caseofficer')
          || userDetails.roles.includes('caseworker-ia-admofficer')
          || userDetails.roles.includes('caseworker-civil')
          || userDetails.roles.includes('caseworker-privatelaw'))
        ? this.router.navigate([CaseResolver.defaultWAPage]) : this.router.navigate([CaseResolver.defaultPage]);
  }
}
