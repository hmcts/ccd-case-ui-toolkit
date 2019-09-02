import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AlertService, HttpError, NavigationNotifierService, NavigationOrigin } from '@hmcts/ccd-case-ui-toolkit';

@Injectable()
export class NavigationListenerService {
  public static readonly CASE_CREATED_MSG = 'The case has been created successfully';
  public static readonly DRAFT_DELETED_MSG = `The draft has been successfully deleted`;

  callbackErrorsSubject: Subject<any> = new Subject();
  navigationSubscription: any;

  constructor(
    private alertService: AlertService,
    private navigationNotifier: NavigationNotifierService,
    private router: Router) {
  }

  public init() {
    this.navigationSubscription = this.navigationNotifier.navigation.subscribe(navigation => {
      switch (navigation.action) {
        case NavigationOrigin.DRAFT_DELETED:
          return this.router.navigate(['search/result'])
            .then(() => {
              this.alertService.setPreserveAlerts(true);
              this.alertService.success(NavigationListenerService.DRAFT_DELETED_MSG);
            });
        case NavigationOrigin.ERROR_DELETING_DRAFT:
          return this.router.navigate(['search/result']);
        case NavigationOrigin.DRAFT_RESUMED:
          return this.router.navigate(
            ['create/case',
              navigation.jid,
              navigation.ctid,
              navigation.etid], { queryParams: navigation.queryParams }).catch(error => {
            this.handleError(error, navigation.etid);
          });
        case NavigationOrigin.EVENT_TRIGGERED:
          return this.router.navigate(['trigger', navigation.etid], {
            queryParams: navigation.theQueryParams,
            relativeTo: navigation.relativeTo
          }).catch(error => {
            this.handleError(error, navigation.etid);
          });
        case NavigationOrigin.NO_READ_ACCESS_REDIRECTION:
          return this.router.navigate((['search/result']))
            .then(() => {
              this.alertService.success(NavigationListenerService.CASE_CREATED_MSG);
            });
      }
    });
  }

  private handleError(error: HttpError, triggerId: string) {
    if (error.status !== 401 && error.status !== 403) {
      console.log('error during triggering event:', triggerId);
      console.log(error);
      this.callbackErrorsSubject.next(error);
    }
  }
}
