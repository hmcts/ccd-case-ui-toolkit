import { Injectable } from '@angular/core';
import { plainToClassFromExist } from 'class-transformer';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaseView } from '../../../domain';
import { CasesService } from './cases.service';

@Injectable()
export class CaseNotifier {
    private caseViewSource: BehaviorSubject<CaseView> = new BehaviorSubject<CaseView>(new CaseView());
    caseView = this.caseViewSource.asObservable();
    public cachedCaseView: CaseView;

    constructor(private casesService: CasesService) {}

    public announceCase(c: CaseView) {
        this.caseViewSource.next(c);
    }

    public fetchAndRefresh(cid: string) {
      return this.casesService
        .getCaseViewV2(cid)
        .pipe(
          map(caseView => {
            this.cachedCaseView = plainToClassFromExist(new CaseView(), caseView);
            this.announceCase(this.cachedCaseView);
            return this.cachedCaseView;
          }),
        );
    }
}
