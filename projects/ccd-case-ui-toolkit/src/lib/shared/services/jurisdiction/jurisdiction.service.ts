import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { JudicialUserModel } from '../../domain/jurisdiction';
import { HttpService } from '../http';

@Injectable()
export class JurisdictionService {
  // We retain the Subject observable because subscribing code couldn't happen a null value
  public readonly selectedJurisdictionSource = new Subject<Jurisdiction>();
  public readonly selectedJurisdictionBS = new BehaviorSubject<Jurisdiction>(null);
  public readonly selectedJurisdiction: Observable<Jurisdiction>;

  constructor(private readonly httpService: HttpService) {
    this.selectedJurisdiction = this.selectedJurisdictionSource.asObservable();
  }

  public getJurisdictions(): Observable<Jurisdiction[]> {
    return this.httpService.get('/aggregated/caseworkers/:uid/jurisdictions?access=read');
  }

  public announceSelectedJurisdiction(jurisdiction: Jurisdiction): void {
    this.selectedJurisdictionSource.next(jurisdiction);
    this.selectedJurisdictionBS.next(jurisdiction);
  }

  public searchJudicialUsers(searchTerm: string, serviceId: string): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/getJudicialUsersSearch', { searchString: searchTerm, serviceCode: serviceId });
  }

  public searchJudicialUsersByPersonalCodes(personalCodes: string[]): Observable<JudicialUserModel[]> {
    return this.httpService.post('api/prd/judicial/searchJudicialUserByPersonalCodes', { personal_code: personalCodes });
  }
}
