import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { CaseViewInput } from './case-view-input.model';

@Injectable()
export class CaseViewInputNotifier {
    private caseViewInputSource: BehaviorSubject<CaseViewInput> = new BehaviorSubject<CaseViewInput>(new CaseViewInput());
    caseViewInput = this.caseViewInputSource.asObservable();

    announceInput(caseViewInput: CaseViewInput) {
        this.caseViewInputSource.next(caseViewInput);
    }
}
