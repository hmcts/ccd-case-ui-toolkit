import { Injectable, Optional } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CaseTab, CaseView } from '../../../domain';
import { HmctsServiceDetail } from '../../../domain/case-flag';
import { CaseFlagRefdataService } from '../../../services/case-flag';
import { CasesService } from './cases.service';

@Injectable()
export class CaseNotifier {
    public static readonly CASE_NAME = 'caseNameHmctsInternal';
    public static readonly CASE_LOCATION = 'caseManagementLocation';
    private readonly caseViewSource: BehaviorSubject<CaseView> = new BehaviorSubject<CaseView>(new CaseView());
    private readonly hmctsServiceIdByCaseType: Map<string, string> = new Map<string, string>();
    public caseView = this.caseViewSource.asObservable();
    public cachedCaseView: CaseView;

    constructor(
      private readonly casesService: CasesService,
      @Optional() private readonly caseFlagRefdataService?: CaseFlagRefdataService
    ) {}

    public removeCachedCase() {
      this.cachedCaseView = null;
    }

    public announceCase(c: CaseView) {
      this.caseViewSource.next(c);
    }
    public fetchAndRefresh(cid: string) {
      return this.casesService
        .getCaseViewV2(cid)
        .pipe(
          map(caseView => {
            this.cachedCaseView = plainToClassFromExist(new CaseView(), caseView);
            this.setBasicFields(this.cachedCaseView.tabs);
            return this.cachedCaseView;
          }),
          switchMap(caseView => this.resolveHmctsServiceId(caseView)),
          map(caseView => {
            this.announceCase(caseView);
            return caseView;
          }),
        );
    }

    public setBasicFields(tabs: CaseTab[]): void {
      tabs.forEach((t) => {
        const caseName = t.fields.find(f => f.id === CaseNotifier.CASE_NAME);
        const caseLocation = t.fields.find(f => f.id === CaseNotifier.CASE_LOCATION);
        if (caseName || caseLocation) {
          this.cachedCaseView.basicFields = {
            caseNameHmctsInternal : caseName ? caseName.value : null,
            caseManagementLocation : caseLocation ? caseLocation.value : null
          };
        }
      });
    }

    private resolveHmctsServiceId(caseView: CaseView): Observable<CaseView> {
      const caseTypeId = caseView?.case_type?.id;

      if (!caseTypeId || !this.caseFlagRefdataService) {
        return of(caseView);
      }

      if (this.hmctsServiceIdByCaseType.has(caseTypeId)) {
        caseView.hmctsServiceId = this.hmctsServiceIdByCaseType.get(caseTypeId);
        return of(caseView);
      }

      return this.caseFlagRefdataService.getHmctsServiceDetailsByCaseType(caseTypeId).pipe(
        map((serviceDetails: HmctsServiceDetail[]) => {
          const hmctsServiceId = serviceDetails?.find((serviceDetail) => !!serviceDetail.service_code)?.service_code;

          if (hmctsServiceId) {
            this.hmctsServiceIdByCaseType.set(caseTypeId, hmctsServiceId);
            caseView.hmctsServiceId = hmctsServiceId;
          }

          console.log('caseView: ', caseView);

          return caseView;
        }),
        catchError(() => of(caseView))
      );
    }
}
