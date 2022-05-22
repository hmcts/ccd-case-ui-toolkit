import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpService } from '../../../../services/http/http.service';
import { GetLinkedCases, LinkCaseReason, LinkedCase, LinkReason } from '../domain';
@Injectable()
export class LinkedCasesService {

  public linkedCases: LinkedCase[] = [];
  public preLinkedCases: LinkedCase[] = [];

  constructor(
    private http: HttpService,
  ) {
  }

  getLinkedCases(caseId: string): Observable<GetLinkedCases> { 
    return this.http
    .get('assets/getLinkedCases.json')
    .pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

  getCaseLinkReasons(categoryKey: string): Observable<LinkCaseReason[]> { 
    return this.http
    .get('assets/getCaseLinkReasons.json')
    .pipe(
      catchError(error => {
        return throwError(error);
      })
    );
  }

}

