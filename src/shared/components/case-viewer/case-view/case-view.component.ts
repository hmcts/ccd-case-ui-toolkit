import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AlertService } from '../../../services/alert';
import { CaseView, Draft } from '../../../domain';
import { CasesService, CaseNotifier } from '../../case-editor';
import { DraftService } from '../../../services';
import { Observable, throwError, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationNotifierService } from '../../../services/navigation/navigation-notifier.service';
import { plainToClassFromExist } from 'class-transformer';

@Component({
  selector: 'ccd-case-view',
  templateUrl: 'case-view.component.html'
})
export class CaseViewComponent implements OnInit, OnDestroy {

  @Input()
  case: string;
  @Input()
  hasPrint = true;
  @Input()
  hasEventSelector = true;

  @Output()
  navigationTriggered: EventEmitter<any> = new EventEmitter();

  navigationSubscription: Subscription;
  caseDetails: CaseView;

  constructor(
    private navigationNotifierService: NavigationNotifierService,
    private caseNofitier: CaseNotifier,
    private casesService: CasesService,
    private draftService: DraftService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.getCaseView(this.case)
      .pipe(
        map(caseView => {
          this.caseDetails = plainToClassFromExist(new CaseView(), caseView);
          this.caseNofitier.announceCase(this.caseDetails);
        })
      )
      .toPromise()
      .catch(error => this.checkAuthorizationError(error));
    this.navigationSubscription = this.navigationNotifierService.navigation.subscribe(navigation => {
      this.navigationTriggered.emit(navigation);
    });
  }

  public ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  isDataLoaded(): boolean {
    return this.caseDetails ? true : false;
  }

  private getCaseView(cid): Observable<CaseView> {
    if (Draft.isDraft(cid)) {
      return this.getDraft(cid);
    } else {
    return this.casesService
          .getCaseViewV2(cid);
    }
  }

  private getDraft(cid): Observable<CaseView> {
    return this.draftService
      .getDraft(cid);
  }

  private checkAuthorizationError(error: any) {
    // TODO Should be logged to remote logging infrastructure
    console.error(error);
    if (error.status !== 401 && error.status !== 403) {
      this.alertService.error(error.message);
    }
    return throwError(error);
  }
}
