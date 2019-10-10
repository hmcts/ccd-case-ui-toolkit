import { BehaviorSubject } from 'rxjs';
import { CaseView } from '../../../domain';
import { Injectable } from '@angular/core';

@Injectable()
export class CaseNotifier {
    private caseViewSource: BehaviorSubject<CaseView> = new BehaviorSubject<CaseView>(new CaseView());
    caseView = this.caseViewSource.asObservable();

    announceCase(caseView: CaseView) {
        this.caseViewSource.next(caseView);
    }
}
