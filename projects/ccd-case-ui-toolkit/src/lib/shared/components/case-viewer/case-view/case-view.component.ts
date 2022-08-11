import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';
import { Observable, Subscription, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { Draft } from '../../../domain/draft.model';
import { AlertService } from '../../../services/alert/alert.service';
import { DraftService } from '../../../services/draft/draft.service';
import { NavigationNotifierService } from '../../../services/navigation/navigation-notifier.service';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { CasesService } from '../../case-editor/services/cases.service';


@Component({
  selector: 'ccd-case-view',
  templateUrl: 'case-view.component.html'
})
export class CaseViewComponent implements OnInit, OnDestroy {

  @Input()
  public case: string;
  @Input()
  public hasPrint = true;
  @Input()
  public hasEventSelector = true;

  @Output()
  public navigationTriggered: EventEmitter<any> = new EventEmitter();

  public navigationSubscription: Subscription;
  public caseDetails: CaseView;

  constructor(
    private readonly navigationNotifierService: NavigationNotifierService,
    private readonly caseNotifier: CaseNotifier,
    private readonly casesService: CasesService,
    private readonly draftService: DraftService,
    private readonly alertService: AlertService,
  ) {}

  public ngOnInit(): void {
    this.getCaseView(this.case)
      .pipe(
        map(caseView => {
          this.caseDetails = plainToClassFromExist(new CaseView(), caseView);
          this.caseNotifier.announceCase(this.caseDetails);
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

  public isDataLoaded(): boolean {
    return !!this.caseDetails;
  }

  private getCaseView(cid): Observable<CaseView> {
    if (Draft.isDraft(cid)) {
      return this.getDraft(cid);
    } else {
      return this.casesService.getCaseViewV2(cid);
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
