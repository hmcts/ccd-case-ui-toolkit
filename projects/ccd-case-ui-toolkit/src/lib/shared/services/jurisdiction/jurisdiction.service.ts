import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { JudicialUserModel } from '../../domain/jurisdiction';
import { HttpService } from '../http';

@Injectable()
export class JurisdictionService {

  private readonly selectedJurisdictionSource = new Subject<Jurisdiction>();
  public readonly selectedJurisdiction: Observable<Jurisdiction>;

  constructor(private readonly httpService: HttpService) {
    this.selectedJurisdiction = this.selectedJurisdictionSource.asObservable();
  }

  public getJurisdictions(): Observable<Jurisdiction[]> {
    return this.httpService.get('/aggregated/caseworkers/:uid/jurisdictions?access=read');
  }

  public announceSelectedJurisdiction(jurisdiction: Jurisdiction): void {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

  public searchJudicialUsers(searchTerm: string, serviceId: string): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/getJudicialUsersSearch', { searchString: searchTerm, serviceCode: 'BBA3' });
  }

  public searchJudicialUsersByPersonalCodes(personalCodes: string[]): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/searchJudicialUserByPersonalCodes', { personal_code: personalCodes });
  }
}
