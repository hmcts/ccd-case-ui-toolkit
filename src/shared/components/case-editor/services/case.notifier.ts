import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CaseView } from '../../../domain';

@Injectable()
export class CaseNotifier {
    readonly caseViewSource: BehaviorSubject<CaseView> = new BehaviorSubject<CaseView>(new CaseView());

    public caseView = this.caseViewSource.asObservable();
    public cachedCaseView: CaseView;
    public announceCase(c: CaseView) {
        this.caseViewSource.next(c);
    }
}
