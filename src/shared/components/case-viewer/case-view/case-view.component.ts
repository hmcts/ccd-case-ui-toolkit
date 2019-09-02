import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AlertService } from '../../../services/alert';
import { CaseView, Draft } from '../../../domain';
import { CasesService, CaseNotifier } from '../../case-editor';
import { DraftService, FieldsUtils } from '../../../services';
import { Observable, throwError, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationNotifierService } from '../../../services/navigation/navigation-notifier.service';
import { plainToClassFromExist } from 'class-transformer';
import { CaseViewInputNotifier } from './case-view-input.notifier';

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
    private caseViewInputNotifier: CaseViewInputNotifier,
    private caseNofitier: CaseNotifier,
    private casesService: CasesService,
    private draftService: DraftService,
    private alertService: AlertService,
    private fieldsUtils: FieldsUtils
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
      if (!this.fieldsUtils.isEmpty(navigation)) {
        this.navigationTriggered.emit(navigation);
      }
    });
    this.caseViewInputNotifier.announceInput({hasPrint: this.hasPrint, hasEventSelector: this.hasEventSelector});
  }

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
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
