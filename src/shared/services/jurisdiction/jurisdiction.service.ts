import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Jurisdiction } from '../../domain';

@Injectable()
export class JurisdictionService {

  readonly selectedJurisdictionSource = new Subject<Jurisdiction>();

  public selectedJurisdiction = this.selectedJurisdictionSource.asObservable();

  announceSelectedJurisdiction(jurisdiction: Jurisdiction) {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

}
