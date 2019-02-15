import { BehaviorSubject } from 'rxjs';
import { CaseView } from '../../../domain';
import { Injectable } from '@angular/core';

@Injectable()
export class CaseService {
    caseViewSource;

    announceCase(caseView: CaseView) {
        this.caseViewSource = new BehaviorSubject<CaseView>(caseView);
    }
}
