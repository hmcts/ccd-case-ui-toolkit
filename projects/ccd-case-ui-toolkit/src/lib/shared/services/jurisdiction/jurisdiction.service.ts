import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Jurisdiction } from '../../domain';
import { JudicialUserModel } from '../../domain/jurisdiction';
import { HttpService } from '../http';

@Injectable()
export class JurisdictionService {

  private readonly selectedJurisdictionSource = new Subject<Jurisdiction>();
  public readonly selectedJurisdiction: Observable<Jurisdiction>;

  constructor(private readonly httpService: HttpService) {
    this.selectedJurisdiction = this.selectedJurisdictionSource.asObservable();
  }

  public announceSelectedJurisdiction(jurisdiction: Jurisdiction) {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

  public searchJudicialUsers(searchTerm: string, serviceId: string): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/getJudicialUsersSearch', { searchString: searchTerm, serviceCode: serviceId });
  }

  public searchJudicialUsersByPersonalCodes(personalCodes: string[]): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/searchJudicialUserByPersonalCodes', { personal_code: personalCodes });
  }
}
