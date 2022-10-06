import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Jurisdiction } from '../../domain';
import { JudicialUserModel } from '../../domain/jurisdiction';
import { HttpService } from '../http';

@Injectable()
export class JurisdictionService {

  private selectedJurisdictionSource = new Subject<Jurisdiction>();

  public selectedJurisdiction: Observable<Jurisdiction>;

  constructor(private httpService: HttpService) {
    this.selectedJurisdiction = this.selectedJurisdictionSource.asObservable();
  }

  announceSelectedJurisdiction(jurisdiction: Jurisdiction) {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

  public searchJudicialUsers(searchTerm: string, serviceId: string): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/getJudicialUsersSearch', { searchString: searchTerm, serviceCode: serviceId });
  }
}
