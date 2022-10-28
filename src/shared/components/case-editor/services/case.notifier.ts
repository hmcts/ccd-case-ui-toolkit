import { Injectable } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaseTab, CaseView } from '../../../domain';
import { CasesService } from './cases.service';

@Injectable()
export class CaseNotifier {
    public static readonly CASE_NAME = 'caseNameHmctsInternal';
    public static readonly CASE_LOCATION = 'caseManagementLocation'
    private caseViewSource: BehaviorSubject<CaseView> = new BehaviorSubject<CaseView>(new CaseView());
    caseView = this.caseViewSource.asObservable();
    public cachedCaseView: CaseView;

    constructor(private casesService: CasesService) {}

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
            this.announceCase(this.cachedCaseView);
            return this.cachedCaseView;
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
      })
    }
}
