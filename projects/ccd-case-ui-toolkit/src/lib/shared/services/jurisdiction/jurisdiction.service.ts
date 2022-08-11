import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';

@Injectable()
export class JurisdictionService {

  public readonly selectedJurisdictionSource = new Subject<Jurisdiction>();

  public selectedJurisdiction = this.selectedJurisdictionSource.asObservable();

  public announceSelectedJurisdiction(jurisdiction: Jurisdiction) {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

}
